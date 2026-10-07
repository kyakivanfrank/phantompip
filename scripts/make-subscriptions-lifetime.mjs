import { Redis } from '@upstash/redis';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function upgradeToLifetime() {
  const db = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const backupDb = process.env.BACKUP_UPSTASH_REDIS_REST_URL ? new Redis({
    url: process.env.BACKUP_UPSTASH_REDIS_REST_URL,
    token: process.env.BACKUP_UPSTASH_REDIS_REST_TOKEN,
  }) : null;

  let cursor = '0';
  const userKeys = [];

  console.log("Scanning for users...");
  do {
    const [nextCursor, keys] = await db.scan(cursor, { match: 'user:*', count: 1000 });
    cursor = nextCursor;
    userKeys.push(...keys);
  } while (cursor !== '0');

  console.log(`Found ${userKeys.length} users. Checking for active subscriptions...`);

  let upgradedCount = 0;

  for (let i = 0; i < userKeys.length; i += 50) {
    const chunk = userKeys.slice(i, i + 50);
    const users = await Promise.all(chunk.map(k => db.json.get(k).catch(() => null)));

    for (let j = 0; j < chunk.length; j++) {
      const user = users[j];
      const key = chunk[j];

      // Unwrap the user if necessary
      const actualUser = typeof user === 'string' ? JSON.parse(user) : user;

      if (actualUser && actualUser.subscription && actualUser.subscription.status === 'active') {
        const userId = key.split(':')[1];
        
        // Upgrade to lifetime
        const now = new Date();
        const expiryDate = new Date();
        expiryDate.setFullYear(now.getFullYear() + 100);
        const expiryIso = expiryDate.toISOString().split('T')[0];

        actualUser.subscription.billingCycle = 'lifetime';
        actualUser.subscription.expiryDate = expiryIso;
        actualUser.subscription.planName = 'PhantomPip Bot (Lifetime)';

        await db.json.set(key, '$', actualUser);
        if (backupDb) {
          await backupDb.json.set(key, '$', actualUser);
        }
        console.log(`Upgraded user ${userId} to Lifetime.`);
        upgradedCount++;
      }
    }
  }

  console.log(`Successfully upgraded ${upgradedCount} active subscriptions to Lifetime!`);
  process.exit(0);
}

upgradeToLifetime().catch(console.error);
