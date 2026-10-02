import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN in .env.local");
  process.exit(1);
}

const redis = new Redis({ url, token });

async function resetDB() {
  console.log("Starting DB reset...");
  try {
    // 1. Get the users index
    const indexData = await redis.json.get("users:index");
    let index = [];
    if (Array.isArray(indexData)) {
      index = Array.isArray(indexData[0]) ? indexData[0] : indexData;
    }

    console.log(`Found ${index.length} users in index.`);

    let deletedCount = 0;
    const keptAdmins = [];

    // 2. Iterate and delete non-admins
    for (const user of index) {
      if (!user.isAdmin) {
        console.log(`Deleting non-admin user: ${user.email} (${user.userId})`);
        
        // Delete email index
        const emailKey = Buffer.from(user.email).toString('base64');
        await redis.del(`email:${emailKey}`);
        
        // Delete user document
        await redis.del(`user:${user.userId}`);
        
        deletedCount++;
      } else {
        console.log(`Keeping admin user: ${user.email}`);
        keptAdmins.push(user);
      }
    }

    // 3. Update the index to only contain admins
    await redis.json.set("users:index", "$", keptAdmins);

    console.log(`\nDB Reset Complete!`);
    console.log(`Deleted ${deletedCount} users.`);
    console.log(`Kept ${keptAdmins.length} admin(s).`);

  } catch (error) {
    console.error("Error resetting DB:", error);
  }
}

resetDB();
