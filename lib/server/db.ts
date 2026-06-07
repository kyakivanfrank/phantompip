import { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redisClient;
}

// User operations
export async function createUser(userId: string, userData: any) {
  const redis = getRedis();
  return await redis.hset(`user:${userId}`, userData);
}

export async function getUser(userId: string) {
  const redis = getRedis();
  return await redis.hgetall(`user:${userId}`);
}

export async function getUserByEmail(email: string) {
  const redis = getRedis();
  const result = await redis.hgetall(`user:email:${email}`);
  return result && Object.keys(result).length > 0 ? result : null;
}

export async function getUserIdByEmail(email: string) {
  const redis = getRedis();
  return await redis.get(`email:${email}`);
}

export async function setUserByEmail(email: string, userId: string) {
  const redis = getRedis();
  return await redis.set(`email:${email}`, userId);
}

export async function updateUser(userId: string, updates: any) {
  const redis = getRedis();
  return await redis.hset(`user:${userId}`, updates);
}

export async function getAllUsers() {
  const redis = getRedis();
  const keys = await redis.keys("user:*");
  const userKeys = keys.filter(
    (k: string) => !k.includes(":email:") && !k.includes(":mt5:") && !k.includes(":payment:")
  );
  const users = [];

  for (const key of userKeys) {
    const userData = await redis.hgetall(key);
    if (userData && userData.email) {
      users.push({ id: key.replace("user:", ""), ...userData });
    }
  }

  return users;
}

// MT5 operations
export async function setMt5Credentials(userId: string, credentials: any) {
  const redis = getRedis();
  return await redis.hset(`mt5:${userId}`, credentials);
}

export async function getMt5Credentials(userId: string) {
  const redis = getRedis();
  return await redis.hgetall(`mt5:${userId}`);
}

export async function deleteMt5Credentials(userId: string) {
  const redis = getRedis();
  return await redis.del(`mt5:${userId}`);
}

// Payment operations
export async function createPayment(paymentId: string, paymentData: any) {
  const redis = getRedis();
  // Filter out null and undefined values since Upstash Redis doesn't support them
  const cleanData = Object.fromEntries(
    Object.entries(paymentData).filter(([, value]) => value !== null && value !== undefined)
  );
  await redis.hset(`payment:${paymentId}`, cleanData);
  await redis.lpush(`payments:${paymentData.userId}`, paymentId);
  return paymentId;
}

export async function getPayment(paymentId: string) {
  const redis = getRedis();
  return await redis.hgetall(`payment:${paymentId}`);
}

export async function updatePayment(paymentId: string, updates: any) {
  const redis = getRedis();
  return await redis.hset(`payment:${paymentId}`, updates);
}

export async function getUserPayments(userId: string) {
  const redis = getRedis();
  const paymentIds = (await redis.lrange(`payments:${userId}`, 0, -1)) as string[];
  const payments = [];

  for (const id of paymentIds) {
    const payment = await redis.hgetall(`payment:${id}`);
    if (payment) {
      payments.push({ id, ...payment });
    }
  }

  return payments.reverse(); // Most recent first
}

export async function getAllPayments() {
  const redis = getRedis();
  const keys = await redis.keys("payment:*");
  const payments = [];

  for (const key of keys) {
    const payment = await redis.hgetall(key);
    if (payment) {
      payments.push({ id: key.replace("payment:", ""), ...payment });
    }
  }

  return payments;
}

// Coupon operations
export async function getCoupon(code: string) {
  const redis = getRedis();
  return await redis.hgetall(`coupon:${code}`);
}

export async function createCoupon(code: string, couponData: any) {
  const redis = getRedis();
  return await redis.hset(`coupon:${code}`, couponData);
}

export async function updateCoupon(code: string, updates: any) {
  const redis = getRedis();
  return await redis.hset(`coupon:${code}`, updates);
}
