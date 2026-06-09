import { Redis } from "@upstash/redis";
import { normalizeEmail } from "./validation";
import { Mt5Credentials } from "@/lib/types";

let redisClient: Redis | null = null;

function createUpstashClient() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  try {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  } catch (e) {
    console.error('Failed to create Upstash client', e);
    return null;
  }
}

// Simple in-memory fallback store for local development or when Upstash is unreachable.
const inMemory = (() => {
  const hashes = new Map<string, Record<string, any>>();
  const strings = new Map<string, string>();
  const lists = new Map<string, string[]>();

  return {
    async get(key: string) {
      return strings.get(key) ?? null;
    },
    async set(key: string, value: string) {
      strings.set(key, value);
      return 'OK';
    },
    async hset(key: string, data: Record<string, any>) {
      const cur = hashes.get(key) ?? {};
      hashes.set(key, { ...cur, ...data });
      return Object.keys(data).length;
    },
    async hgetall(key: string) {
      return hashes.get(key) ?? {};
    },
    async del(key: string) {
      const had = hashes.delete(key) || strings.delete(key) || lists.delete(key);
      return had ? 1 : 0;
    },
    async keys(pattern: string) {
      const allKeys = Array.from(new Set([...hashes.keys(), ...strings.keys(), ...lists.keys()]));
      // very small glob support for prefix
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        return allKeys.filter((k) => k.startsWith(prefix));
      }
      return allKeys.filter((k) => k === pattern);
    },
    async lpush(key: string, value: string) {
      const arr = lists.get(key) ?? [];
      arr.unshift(value);
      lists.set(key, arr);
      return arr.length;
    },
    async lrange(key: string, start: number, stop: number) {
      const arr = lists.get(key) ?? [];
      // handle -1
      const end = stop < 0 ? arr.length - 1 : stop;
      return arr.slice(start, end + 1);
    },
  } as const;
})();

export function getRedis(): Redis | typeof inMemory {
  if (redisClient) return redisClient;

  const client = createUpstashClient();
  if (client) {
    redisClient = client;
    return redisClient;
  }

  // Fall back to the in-memory implementation (useful for local development/offline)
  return inMemory;
}

// Helper: run an async operation with timeout and limited retries
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

// User operations
export async function createUser(userId: string, userData: any) {
  const redis = getRedis();
  return await attempt(() => (redis as any).hset(`user:${userId}`, userData));
}

export async function getUser(userId: string): Promise<Record<string, any>> {
  const redis = getRedis();
  const res = await attempt(() => (redis as any).hgetall(`user:${userId}`));
  return res as Record<string, any>;
}

export async function getUserByEmail(email: string) {
  const userId = await getUserIdByEmail(email);
  if (!userId) {
    return null;
  }

  return await getUser(userId as string);
}

export async function getUserIdByEmail(email: string): Promise<string | null> {
  const redis = getRedis();
  const res = await attempt(() => (redis as any).get(emailKey(email)));
  return res as string | null;
}

export async function setUserByEmail(email: string, userId: string) {
  const redis = getRedis();
  return await attempt(() => (redis as any).set(emailKey(email), userId));
}

export async function updateUser(userId: string, updates: any) {
  const redis = getRedis();
  return await attempt(() => (redis as any).hset(`user:${userId}`, updates));
}

export async function getAllUsers() {
  const redis = getRedis();
  const keys = await attempt(() => (redis as any).keys("user:*"));
  const userKeys = (keys as string[]).filter((k: string) => !k.includes(":mt5:") && !k.includes(":payment:"));
  const users = [];

  for (const key of userKeys) {
    const userData = await attempt(() => (redis as any).hgetall(key));
    const user = userData as Record<string, any>;
    if (user && user.email) {
      users.push({ id: key.replace("user:", ""), ...user });
    }
  }

  return users;
}

// MT5 operations
export async function setMt5Credentials(userId: string, credentials: any) {
  const redis = getRedis();
  return await attempt(() => (redis as any).hset(`mt5:${userId}`, credentials));
}

export async function getMt5Credentials(userId: string): Promise<Partial<Mt5Credentials> | Record<string, never>> {
  const redis = getRedis();
  return await attempt(() => (redis as any).hgetall(`mt5:${userId}`));
}

export async function deleteMt5Credentials(userId: string) {
  const redis = getRedis();
  return await attempt(() => (redis as any).del(`mt5:${userId}`));
}

// Payment operations
export async function createPayment(paymentId: string, paymentData: any) {
  const redis = getRedis();
  // Filter out null and undefined values since Upstash Redis doesn't support them
  const cleanData = Object.fromEntries(
    Object.entries(paymentData).filter(([, value]) => value !== null && value !== undefined)
  );
  await attempt(() => (redis as any).hset(`payment:${paymentId}`, cleanData));
  await attempt(() => (redis as any).lpush(`payments:${paymentData.userId}`, paymentId));
  return paymentId;
}

export async function getPayment(paymentId: string): Promise<Record<string, any>> {
  const redis = getRedis();
  const res = await attempt(() => (redis as any).hgetall(`payment:${paymentId}`));
  return res as Record<string, any>;
}

export async function updatePayment(paymentId: string, updates: any) {
  const redis = getRedis();
  return await attempt(() => (redis as any).hset(`payment:${paymentId}`, updates));
}

export async function getUserPayments(userId: string) {
  const redis = getRedis();
  const paymentIds = (await attempt(() => (redis as any).lrange(`payments:${userId}`, 0, -1))) as string[];
  const payments = [];

  for (const id of paymentIds) {
    const payment = await attempt(() => (redis as any).hgetall(`payment:${id}`));
    if (payment) {
      payments.push({ id, ...payment });
    }
  }

  return payments.reverse(); // Most recent first
}

export async function getAllPayments(): Promise<Record<string, any>[]> {
  const redis = getRedis();
  const keys = await attempt(() => (redis as any).keys("payment:*"));
  const payments: Record<string, any>[] = [];

  for (const key of keys as string[]) {
    const payment = await attempt(() => (redis as any).hgetall(key));
    if (payment) {
      payments.push({ id: key.replace("payment:", ""), ...(payment as Record<string, any>) });
    }
  }

  return payments;
}

// Coupon operations
export async function getCoupon(code: string) {
  const redis = getRedis();
  return await attempt(() => (redis as any).hgetall(`coupon:${code}`));
}

export async function createCoupon(code: string, couponData: any) {
  const redis = getRedis();
  return await attempt(() => (redis as any).hset(`coupon:${code}`, couponData));
}

export async function updateCoupon(code: string, updates: any) {
  const redis = getRedis();
  return await attempt(() => (redis as any).hset(`coupon:${code}`, updates));
}
