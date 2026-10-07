import { Redis } from "@upstash/redis";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const primaryDb = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function main() {
  try {
    console.log("Fetching all users to fix WRONGTYPE...");
    let cursor = 0;
    const userKeys: string[] = [];
    do {
      const [nextCursor, keys] = await primaryDb.scan(cursor, { match: "user:*", count: 100 });
      userKeys.push(...keys);
      cursor = nextCursor === "0" ? 0 : Number(nextCursor);
    } while (cursor !== 0);

    let updatedCount = 0;
    for (const key of userKeys) {
      if (!key.startsWith("user:usr_")) continue;
      
      try {
        // Try getting it as a string
        const strVal = await primaryDb.get<string | object>(key);
        if (strVal && typeof strVal === 'object' && !Array.isArray(strVal)) {
          // If it was parsed correctly by Upstash Redis (it auto-parses JSON strings sometimes), 
          // or if it was stored as a string, let's delete it and store it as JSON.
          console.log(`Fixing key: ${key}`);
          await primaryDb.del(key);
          await (primaryDb.json as any).set(key, "$", strVal);
          updatedCount++;
        }
      } catch (err: any) {
        // If getting as string fails with WRONGTYPE, it's already a JSON key, which is fine.
        if (err.message && err.message.includes('WRONGTYPE')) {
          continue;
        }
        console.error(`Error on key ${key}:`, err);
      }
    }
    
    console.log(`Successfully fixed ${updatedCount} users.`);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
