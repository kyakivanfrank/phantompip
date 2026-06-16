import { Redis } from "@upstash/redis";
import { normalizeEmail } from "./validation";
import { UserDocument, UserIndexEntry, Payment, Bots, Bot } from "@/lib/types";
import { DEFAULT_BOTS } from "./bot-defaults";

function createUpstashClient(url?: string, token?: string) {
  if (!url || !token) {
    return null;
  }

  try {
    return new Redis({
      url,
      token,
    });
  } catch {
    return null;
  }
}

export const primaryDb = createUpstashClient(
  process.env.UPSTASH_REDIS_REST_URL,
  process.env.UPSTASH_REDIS_REST_TOKEN
);

export const backupDb = createUpstashClient(
  process.env.UPSTASH_REDIS_BACKUP_DB_REST_URL,
  process.env.UPSTASH_REDIS_BACKUP_DB_REST_TOKEN
);

const backupHoursFromEnv = Number.parseInt(process.env.BACKUPNUMBEROFHOURS || "4", 10);
const backupIntervalHours = Number.isFinite(backupHoursFromEnv) && backupHoursFromEnv > 0 ? backupHoursFromEnv : 4;
const backupIntervalSeconds = backupIntervalHours * 60 * 60;
const TIMEOUT_KEY = "system:last_backup_time";
const JSON_BACKED_KEY_PREFIXES = ["user:"];

let redisClient: Redis | null = primaryDb;
let optimisticBackupInFlight = false;

// Memory mock that partially supports RedisJSON (for fallback)
const inMemory = (() => {
  const store = new Map<string, any>();
  const strings = new Map<string, string>();


  function resolvePath(obj: any, path: string) {
    if (path === '$') return { parent: null, key: null, target: obj };
    const parts = path.replace('$.', '').split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    return { parent: current, key: parts[parts.length - 1], target: current[parts[parts.length - 1]] };
  }

  return {
    async get(key: string) {
      return strings.get(key) ?? null;
    },
    async set(key: string, value: string) {
      strings.set(key, value);
      return 'OK';
    },
    async del(key: string) {
      const had1 = store.delete(key);
      const had2 = strings.delete(key);
      return had1 || had2 ? 1 : 0;
    },
    async hset(key: string, data: Record<string, any>) {
      const cur = store.get(key) ?? {};
      store.set(key, { ...cur, ...data });
      return Object.keys(data).length;
    },
    async hgetall(key: string) {
      return store.get(key) ?? {};
    },
    json: {
      async get(key: string, options?: { path: string }) {
        const obj = store.get(key);
        if (!obj) return null;
        if (!options || !options.path || options.path === '$') return obj;
        const { target } = resolvePath(obj, options.path);
        return target ?? null;
      },
      async set(key: string, path: string, value: any) {
        if (!store.has(key)) store.set(key, {});
        const obj = store.get(key);
        if (path === '$') {
          store.set(key, value);
        } else {
          const { parent, key: lastKey } = resolvePath(obj, path);
          parent[lastKey!] = value;
        }
        return 'OK';
      },
      async arrappend(key: string, path: string, ...values: any[]) {
        const obj = store.get(key);
        if (!obj) return 0;
        const { parent, key: lastKey, target } = resolvePath(obj, path);
        if (!Array.isArray(target)) {
          parent[lastKey!] = [];
        }
        parent[lastKey!].push(...values);
        return parent[lastKey!].length;
      }
    }
  } as any;
})();

export function triggerOptimisticBackup() {
  if (!primaryDb || !backupDb || optimisticBackupInFlight) {
    return;
  }

  optimisticBackupInFlight = true;

  primaryDb
    .set(TIMEOUT_KEY, String(Date.now()), {
      nx: true,
      ex: backupIntervalSeconds,
    })
    .then(async (lockResult) => {
      if (lockResult !== "OK") {
        return null;
      }

      const allKeys = await primaryDb.keys("*");
      const targetKeys = allKeys.filter((key) => key !== TIMEOUT_KEY);

      if (targetKeys.length === 0) {
        return null;
      }

      // 1. Separate keys by their Redis data type
      const jsonKeys = targetKeys.filter(isJsonBackedKey);
      const stringKeys = targetKeys.filter((k) => !isJsonBackedKey(k));

      const scalarPayload: Record<string, string | number> = {};
      const jsonPayload: Array<{ key: string; value: any }> = [];

      // 2. Fetch standard String keys using standard MGET
      if (stringKeys.length > 0) {
        const stringValues = await primaryDb.mget(...stringKeys);
        stringKeys.forEach((key, index) => {
          if (stringValues[index] !== null && stringValues[index] !== undefined) {
            scalarPayload[key] = stringValues[index] as string | number;
          }
        });
      }

      // 3. Fetch JSON keys using the specialized JSON.MGET command
      if (jsonKeys.length > 0) {
        // JSON.MGET takes the keys array, and the path "$" as the final argument
        const jsonValues = await (primaryDb.json as any).mget(...jsonKeys, "$");
        
        jsonKeys.forEach((key, index) => {
          if (jsonValues[index] !== null && jsonValues[index] !== undefined) {
            // Upstash JSON.MGET returns an array for the "$" path match (e.g., [ { userObj } ])
            let parsedVal = jsonValues[index];
            if (Array.isArray(parsedVal)) {
              parsedVal = parsedVal[0];
            }
            jsonPayload.push({ key, value: parsedVal });
          }
        });
      }

      // 4. Batch write to the backup database
      const writes: Promise<any>[] = [];

      // Write strings in a single MSET command
      if (Object.keys(scalarPayload).length > 0) {
        writes.push(backupDb.mset(scalarPayload as any));
      }

      // Redis does not have a JSON.MSET command.
      // We push them into Promise.all which leverages the Upstash SDK auto-pipelining.
      for (const entry of jsonPayload) {
        writes.push((backupDb.json as any).set(entry.key, "$", entry.value));
      }

      if (writes.length === 0) {
        return null;
      }

      return Promise.all(writes);
    })
    .catch((err) => {
      // Keep it silent for the user, but log it to the server console for you
      console.error("[Optimistic Backup Engine Error]:", err);
      return undefined;
    })
    .finally(() => {
      optimisticBackupInFlight = false;
    });
}

function isJsonBackedKey(key: string) {
  return key === "users:index" || JSON_BACKED_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function getRedis(): Redis | typeof inMemory {
  if (redisClient) return redisClient;

  return inMemory;
}

export async function attempt<T>(fn: () => Promise<T>, timeoutMs = 3000, retries = 2): Promise<T> {
  let lastErr: any;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await Promise.race([
        fn(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
      ]);
      return res as T;
    } catch (err) {
      lastErr = err;
      const backoff = 100 * Math.pow(2, i);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastErr;
}

function emailKey(email: string) {
  return `email:${normalizeEmail(email)}`;
}

// -----------------------------------------------------------------------------
// USER OPERATIONS
// -----------------------------------------------------------------------------

export async function createUser(userId: string, userData: UserDocument) {
  const redis = getRedis();

  // Force MT5 placeholders and Bot defaults
  const normalizedUserData = {
    ...userData,
    mt5: userData.mt5 || {
      loginId: "",
      password: "",
      brokerServer: "",
      connectedAt: null,
      isConnected: false,
    },
    bots: Object.keys(userData.bots || {}).length === 0 ? DEFAULT_BOTS : userData.bots,
  };

  // Create user document
  await attempt(() => (redis.json as any).set(`user:${userId}`, "$", normalizedUserData));

  // Set email lookup mapping (since redis json doesn't support secondary indexing easily)
  await attempt(() => redis.set(emailKey(normalizedUserData.account.email), userId));

  // Add to lightweight index
  const indexEntry: UserIndexEntry = {
    userId: userData.userId,
    username: userData.account.username,
    email: userData.account.email,
    subscriptionStatus: userData.subscription.status,
    approvalStatus: userData.subscription.approvalStatus,
    expiryDate: userData.subscription.expiryDate,
    isAdmin: userData.isAdmin
  };

  const index = await attempt(() => (redis.json as any).get("users:index"));
  if (!index) {
    await attempt(() => (redis.json as any).set("users:index", "$", [indexEntry]));
  } else {
    await attempt(() => (redis.json as any).arrappend("users:index", "$", indexEntry));
  }

  return userData;
}

export async function getUser(userId: string): Promise<UserDocument | null> {
  const redis = getRedis();
  const res = await attempt(() => (redis.json as any).get(`user:${userId}`));
  if (Array.isArray(res)) return res[0] as UserDocument | null; // Redis upstash driver sometimes wraps in array
  return res as UserDocument | null;
}

export async function getUserIdByEmail(email: string): Promise<string | null> {
  const redis = getRedis();
  const res = await attempt(() => redis.get(emailKey(email)));
  return res as string | null;
}

export async function getUserByEmail(email: string): Promise<UserDocument | null> {
  const userId = await getUserIdByEmail(email);
  if (!userId) return null;
  return await getUser(userId);
}

export async function setUserByEmail(email: string, userId: string) {
  const redis = getRedis();
  return await attempt(() => redis.set(emailKey(email), userId));
}

export async function deleteUser(userId: string) {
  const redis = getRedis();
  const user = await getUser(userId);
  if (user) {
    await attempt(() => redis.del(emailKey(user.account.email)));
  }

  // Delete document
  await attempt(() => redis.del(`user:${userId}`));

  // Remove from index
  const index = (await attempt(() => (redis.json as any).get("users:index"))) as UserIndexEntry[] || [];
  let unwrappedIndex = Array.isArray(index) && Array.isArray(index[0]) ? index[0] : index;
  if (!Array.isArray(unwrappedIndex)) unwrappedIndex = [];

  const updated = unwrappedIndex.filter((u: UserIndexEntry) => u.userId !== userId);
  await attempt(() => (redis.json as any).set("users:index", "$", updated));
}

export async function getAllUsers(): Promise<UserIndexEntry[]> {
  const redis = getRedis();
  const index = await attempt(() => (redis.json as any).get("users:index"));

  if (!index) return [];
  // Handle upstash returning array of array for JSON.GET
  if (Array.isArray(index) && Array.isArray(index[0])) return index[0];
  if (Array.isArray(index)) return index;

  return [];
}

export async function updateUserDetails(userId: string, updates: { username?: string, email?: string }) {
  const redis = getRedis();
  const user = await getUser(userId);
  if (!user) return;

  if (updates.username) {
    await attempt(() => (redis.json as any).set(`user:${userId}`, "$.account.username", updates.username));
  }

  if (updates.email && updates.email !== user.account.email) {
    await attempt(() => redis.del(emailKey(user.account.email)));
    await attempt(() => redis.set(emailKey(updates.email!), userId));
    await attempt(() => (redis.json as any).set(`user:${userId}`, "$.account.email", updates.email));
  }

  // Sync index
  if (updates.username || updates.email) {
    const index = await getAllUsers();
    const i = index.findIndex(u => u.userId === userId);
    if (i !== -1) {
      if (updates.username) index[i].username = updates.username;
      if (updates.email) index[i].email = updates.email;
      await attempt(() => (redis.json as any).set("users:index", "$", index));
    }
  }
}

// -----------------------------------------------------------------------------
// ADMIN / SUBSCRIPTION OPERATIONS
// -----------------------------------------------------------------------------

export async function resetUserPassword(userId: string, newPasswordHash: string) {
  const redis = getRedis();
  return await attempt(() => (redis.json as any).set(`user:${userId}`, "$.account.passwordHash", newPasswordHash));
}

export async function updateSubscription(userId: string, updates: Partial<UserDocument["subscription"]>) {
  const redis = getRedis();
  for (const [key, value] of Object.entries(updates)) {
    if (key !== 'payments') {
      // CRITICAL FIX: Explicitly stringify values to prevent JSON parsing crashes on strings
      await attempt(() => (redis.json as any).set(`user:${userId}`, `$.subscription.${key}`, JSON.stringify(value)));
    }
  }

  // Sync index
  const index = await getAllUsers();
  const i = index.findIndex(u => u.userId === userId);
  if (i !== -1) {
    if (updates.status) index[i].subscriptionStatus = updates.status;
    if (updates.approvalStatus) index[i].approvalStatus = updates.approvalStatus;
    if (updates.expiryDate) index[i].expiryDate = updates.expiryDate;
    await attempt(() => (redis.json as any).set("users:index", "$", index));
  }
}
// -----------------------------------------------------------------------------
// PAYMENT OPERATIONS
// -----------------------------------------------------------------------------

export async function createPayment(userId: string, payment: Payment) {
  const redis = getRedis();

  // 1. Fetch current user to check existing payments
  const user = await getUser(userId);
  if (!user || !user.subscription) return null;

  // 2. Ensure the payments array exists
  const existingPayments = user.subscription.payments || [];

  // 3. Deduplication Check: Prevent double-click submissions
  const isDuplicate = existingPayments.some(p => p.paymentId === payment.paymentId);

  if (isDuplicate) {
    console.log(`Duplicate payment ${payment.paymentId} prevented for user ${userId}`);
    return "DUPLICATE_PREVENTED";
  }

  // 4. Safe to append
  return await attempt(() => (redis.json as any).arrappend(`user:${userId}`, "$.subscription.payments", payment));
}
export async function getUserPayments(userId: string): Promise<Payment[]> {
  const user = await getUser(userId);
  if (!user || !user.subscription || !user.subscription.payments) return [];
  return [...user.subscription.payments].reverse();
}

export async function getAllPayments() {
  const index = await getAllUsers();
  const allPayments: any[] = [];
  const seenPaymentIds = new Set<string>(); // Tracker to eliminate duplicates

  for (const entry of index) {
    const user = await getUser(entry.userId);
    if (user && user.subscription && Array.isArray(user.subscription.payments)) {
      for (const p of user.subscription.payments) {

        // Only process this payment if we haven't seen its ID before
        if (!seenPaymentIds.has(p.paymentId)) {
          seenPaymentIds.add(p.paymentId);
          allPayments.push({
            ...p,
            userId: user.userId,
            userEmail: user.account.email,
            username: user.account.username
          });
        }

      }
    }
  }

  return allPayments.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export async function getPayment(paymentId: string) {
  const allPayments = await getAllPayments();
  return allPayments.find(p => p.paymentId === paymentId) || null;
}

export async function updatePaymentStatus(userId: string, paymentId: string, status: string, additionalUpdates?: any) {
  const redis = getRedis();
  const user = await getUser(userId);
  if (!user || !user.subscription || !user.subscription.payments) return;
  
  for (let i = 0; i < user.subscription.payments.length; i++) {
    if (user.subscription.payments[i].paymentId === paymentId) {
      
      // CRITICAL FIX: Explicitly stringify the plain string value for Upstash
      await attempt(() => (redis.json as any).set(`user:${userId}`, `$.subscription.payments[${i}].status`, JSON.stringify(status)));
      
      if (additionalUpdates) {
        for (const [key, value] of Object.entries(additionalUpdates)) {
          await attempt(() => (redis.json as any).set(`user:${userId}`, `$.subscription.payments[${i}].${key}`, JSON.stringify(value)));
        }
      }
      
    }
  }
}


// Support older wrapper APIs (for legacy routes that might still exist)
export async function updatePayment(paymentId: string, updates: any) {
  const payment = await getPayment(paymentId);
  if (payment) {
    await updatePaymentStatus(payment.userId, paymentId, updates.status || payment.status, updates);
  }
}

// -----------------------------------------------------------------------------
// MT5 OPERATIONS
// -----------------------------------------------------------------------------

export async function setMt5Credentials(userId: string, credentials: UserDocument["mt5"]) {
  const redis = getRedis();
  return await attempt(() => (redis.json as any).set(`user:${userId}`, "$.mt5", credentials));
}

export async function getMt5Credentials(userId: string): Promise<UserDocument["mt5"] | null> {
  const redis = getRedis();
  const res = await attempt(() => (redis.json as any).get(`user:${userId}`, { path: "$.mt5" }));
  const credentials = Array.isArray(res) ? res[0] : res;

  if (!credentials) {
    const placeholder = {
      loginId: "",
      password: "",
      brokerServer: "",
      connectedAt: null,
      isConnected: false,
    };
    await attempt(() => (redis.json as any).set(`user:${userId}`, "$.mt5", placeholder));
    return placeholder;
  }

  return credentials as UserDocument["mt5"] | null;
}

// -----------------------------------------------------------------------------
// BOT OPERATIONS
// -----------------------------------------------------------------------------

function mergeUserBots(existingBots: Partial<Bots> | undefined | null): Bots {
  const merged = {} as Bots;

  for (const key of Object.keys(DEFAULT_BOTS) as (keyof Bots)[]) {
    const defaultBot = DEFAULT_BOTS[key];
    const userBot = existingBots && existingBots[key] ? existingBots[key] : null;
    const userSettings =
      userBot?.settings && typeof userBot.settings === "object" ? userBot.settings : {};

    merged[key] = {
      ...defaultBot,
      ...(userBot || {}),
      settings: {
        ...defaultBot.settings,
        ...userSettings,
      },
    };
  }

  return merged;
}

async function writeMergedBot(
  userId: string,
  botKey: keyof Bots,
  updates: {
    settings?: Partial<Bot["settings"]>;
    isEnabled?: boolean;
  } = {}
): Promise<Bot> {
  const redis = getRedis();
  const user = await getUser(userId);

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  const botsObj = mergeUserBots(user.bots);
  const existingBot = botsObj && botsObj[botKey] ? botsObj[botKey] : null;
  const defaultBot = DEFAULT_BOTS[botKey];
  const existingSettings =
    existingBot?.settings && typeof existingBot.settings === "object" ? existingBot.settings : {};

  const mergedBot: Bot = {
    ...defaultBot,
    ...(existingBot || {}),
    isEnabled: updates.isEnabled ?? existingBot?.isEnabled ?? defaultBot.isEnabled,
    settings: {
      ...defaultBot.settings,
      ...existingSettings,
      ...(updates.settings || {}),
    },
  };

  const nextUser: UserDocument = {
    ...user,
    bots: {
      ...botsObj,
      [botKey]: mergedBot,
    },
  };

  await attempt(() => (redis.json as any).set(`user:${userId}`, "$", nextUser));

  return mergedBot;
}

export async function toggleBotActive(userId: string, botKey: keyof Bots, isEnabled: boolean) {
  await writeMergedBot(userId, botKey, { isEnabled });
  return 'OK';
}

export async function updateBotSettings(
  userId: string,
  botKey: keyof Bots,
  settings: Partial<Bot["settings"]>,
  isEnabled?: boolean
) {
  return await writeMergedBot(userId, botKey, { settings, isEnabled });
}

export async function getBotSettings(userId: string, botKey: keyof Bots) {
  const redis = getRedis();
  const res = await attempt(() => (redis.json as any).get(`user:${userId}`, { path: `$.bots.${botKey}.settings` }));
  if (Array.isArray(res)) return res[0];
  return res;
}

export async function getBot(userId: string, botKey: keyof Bots) {
  const redis = getRedis();
  const res = await attempt(() => (redis.json as any).get(`user:${userId}`, { path: `$.bots.${botKey}` }));
  if (Array.isArray(res)) return res[0];
  return res;
}

export async function getAllUserBotSettings(userId: string) {
  const redis = getRedis();
  const user = await getUser(userId);

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  const mergedBots = mergeUserBots(user.bots);

  if (!user.bots || JSON.stringify(user.bots) !== JSON.stringify(mergedBots)) {
    const nextUser: UserDocument = {
      ...user,
      bots: mergedBots,
    };

    await attempt(() => (redis.json as any).set(`user:${userId}`, "$", nextUser));
  }

  return mergedBots;
}

export async function deleteBot(userId: string, botKey: keyof Bots) {
  const redis = getRedis();
  const userBots = await attempt(() => (redis.json as any).get(`user:${userId}`, { path: "$.bots" }));
  const botsObj = Array.isArray(userBots) ? userBots[0] : userBots;

  if (botsObj && botsObj[botKey]) {
    delete botsObj[botKey];
    await attempt(() => (redis.json as any).set(`user:${userId}`, "$.bots", botsObj));
  }
}

// -----------------------------------------------------------------------------

