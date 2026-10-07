// One-off migration: copy every key from SOURCE (creative-bluebird) into TARGET (regular-corgi).
// Usage:
//   node -r dotenv/config migrate_db.mjs survey  dotenv_config_path=.env.local
//   node -r dotenv/config migrate_db.mjs copy    dotenv_config_path=.env.local
//   node -r dotenv/config migrate_db.mjs verify  dotenv_config_path=.env.local
// Reads SOURCE from UPSTASH_REDIS_REST_* and TARGET from UPSTASH_REDIS_BACKUP_DB_REST_*.
// Does NOT flush the target; it only upserts keys.
import { Redis } from "@upstash/redis";

const mode = process.argv[2] || "survey";
const SKIP_KEYS = new Set(["system:last_backup_time"]);
const BATCH = 200;

const pairs = [
  { url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN },
  { url: process.env.UPSTASH_REDIS_BACKUP_DB_REST_URL, token: process.env.UPSTASH_REDIS_BACKUP_DB_REST_TOKEN },
];
const srcCfg = pairs.find((p) => p.url?.includes("creative-bluebird"));
const dstCfg = pairs.find((p) => p.url?.includes("regular-corgi"));
if (!srcCfg || !dstCfg) {
  console.error("Refusing to run: could not find both creative-bluebird and regular-corgi in .env.local");
  process.exit(1);
}

// Raw mode: values are copied byte-for-byte without JSON re-parsing.
const src = new Redis({ url: srcCfg.url, token: srcCfg.token, automaticDeserialization: false });
const dst = new Redis({ url: dstCfg.url, token: dstCfg.token, automaticDeserialization: false });

async function scanAll(db) {
  let cursor = "0";
  const keys = [];
  do {
    const [next, batch] = await db.scan(cursor, { count: 1000 });
    cursor = String(next);
    keys.push(...batch);
  } while (cursor !== "0");
  return keys.filter((k) => !SKIP_KEYS.has(k));
}

function chunks(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

async function getTypes(db, keys) {
  const result = new Map();
  for (const group of chunks(keys, BATCH)) {
    const p = db.pipeline();
    group.forEach((k) => { p.type(k); p.pttl(k); });
    const res = await p.exec();
    group.forEach((k, i) => result.set(k, { type: res[i * 2], pttl: Number(res[i * 2 + 1]) }));
  }
  return result;
}

async function survey() {
  const keys = await scanAll(src);
  const types = await getTypes(src, keys);
  const counts = {};
  let withTtl = 0;
  for (const { type, pttl } of types.values()) {
    counts[type] = (counts[type] || 0) + 1;
    if (pttl > 0) withTtl++;
  }
  const prefixes = {};
  for (const k of keys) {
    const p = k.includes(":") ? k.split(":")[0] + ":" : k;
    prefixes[p] = (prefixes[p] || 0) + 1;
  }
  console.log("Source keys:", keys.length);
  console.log("By type:", counts);
  console.log("By prefix:", prefixes);
  console.log("Keys with TTL:", withTtl);
  console.log("Target keys currently:", (await scanAll(dst)).length);
}

async function copy() {
  const keys = await scanAll(src);
  const types = await getTypes(src, keys);
  console.log(`Copying ${keys.length} keys...`);
  let done = 0;
  const skipped = [];

  for (const group of chunks(keys, BATCH)) {
    const read = src.pipeline();
    const plan = [];
    for (const k of group) {
      const { type } = types.get(k);
      if (type === "string") read.get(k);
      else if (type === "json" || type === "ReJSON-RL") read.json.get(k);
      else if (type === "hash") read.hgetall(k);
      else if (type === "set") read.smembers(k);
      else if (type === "list") read.lrange(k, 0, -1);
      else if (type === "zset") read.zrange(k, 0, -1, { withScores: true });
      else { skipped.push(`${k} (${type})`); continue; }
      plan.push(k);
    }
    const values = plan.length ? await read.exec() : [];

    const write = dst.pipeline();
    plan.forEach((k, i) => {
      const { type, pttl } = types.get(k);
      const v = values[i];
      if (v === null || v === undefined) return;
      if (type === "string") write.set(k, v, pttl > 0 ? { px: pttl } : undefined);
      else if (type === "json" || type === "ReJSON-RL") write.json.set(k, "$", v);
      else {
        write.del(k);
        if (type === "hash") write.hset(k, v);
        else if (type === "set" && v.length) write.sadd(k, ...v);
        else if (type === "list" && v.length) write.rpush(k, ...v);
        else if (type === "zset" && v.length) {
          const members = [];
          for (let j = 0; j < v.length; j += 2) members.push({ member: v[j], score: Number(v[j + 1]) });
          write.zadd(k, ...members);
        }
      }
      if (type !== "string" && pttl > 0) write.pexpire(k, pttl);
    });
    await write.exec();
    done += group.length;
    console.log(`  ${done}/${keys.length}`);
  }
  if (skipped.length) console.log("Skipped:", skipped);
  console.log("Copy finished.");
}

async function verify() {
  const srcKeys = await scanAll(src);
  const dstKeys = new Set(await scanAll(dst));
  const missing = srcKeys.filter((k) => !dstKeys.has(k));
  console.log("Source keys:", srcKeys.length, "| Target keys:", dstKeys.size, "| Missing in target:", missing.length);
  if (missing.length) console.log("First missing:", missing.slice(0, 20));

  // Spot-check content equality on a sample of keys
  const types = await getTypes(src, srcKeys);
  const sample = srcKeys;
  let mismatches = 0;
  for (const group of chunks(sample, BATCH)) {
    const a = src.pipeline(), b = dst.pipeline();
    const used = [];
    for (const k of group) {
      const t = types.get(k).type;
      if (t === "string") { a.get(k); b.get(k); used.push(k); }
      else if (t === "json" || t === "ReJSON-RL") { a.json.get(k, "$"); b.json.get(k, "$"); used.push(k); }
    }
    if (!used.length) continue;
    const [ra, rb] = await Promise.all([a.exec(), b.exec()]);
    used.forEach((k, i) => {
      const norm = (x) => JSON.stringify(typeof x === "string" ? safeParse(x) : x);
      if (norm(ra[i]) !== norm(rb[i])) { mismatches++; if (mismatches <= 5) console.log("Mismatch:", k); }
    });
  }
  console.log(`Content spot-check: ${sample.length} keys sampled, ${mismatches} mismatches`);
}

function safeParse(s) { try { return sortDeep(JSON.parse(s)); } catch { return s; } }
function sortDeep(x) {
  if (Array.isArray(x)) return x.map(sortDeep);
  if (x && typeof x === "object") return Object.fromEntries(Object.keys(x).sort().map((k) => [k, sortDeep(x[k])]));
  return x;
}

async function wipecopy() {
  const fs = await import("node:fs");
  // 1. Save anything that exists only in corgi, so the wipe is recoverable.
  const srcKeys = new Set(await scanAll(src));
  const corgiOnly = (await scanAll(dst)).filter((k) => !srcKeys.has(k));
  const saved = {};
  for (const k of corgiOnly) {
    const t = await dst.type(k);
    saved[k] = { type: t, value: t === "json" ? await dst.json.get(k) : await dst.get(k) };
  }
  saved["users:index (corgi)"] = { type: "json", value: await dst.json.get("users:index") };
  const out = process.env.BACKUP_OUT || "corgi_only_backup.json";
  fs.writeFileSync(out, JSON.stringify(saved, null, 2));
  console.log(`Saved ${corgiOnly.length} corgi-only keys + corgi users:index to ${out}`);

  // 2. Wipe corgi completely.
  await dst.flushdb();
  console.log("regular-corgi wiped. Keys now:", (await scanAll(dst)).length);

  // 3. 1:1 copy from bluebird (backup lock key intentionally skipped).
  await copy();
}

({ survey, copy, verify, wipecopy })[mode]().catch((e) => { console.error(e); process.exit(1); });
