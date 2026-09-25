require('dotenv').config({ path: '.env.local' });
const { Redis } = require('@upstash/redis');
const fs = require('fs');

const primary = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const backup = new Redis({
  url: process.env.UPSTASH_REDIS_BACKUP_DB_REST_URL,
  token: process.env.UPSTASH_REDIS_BACKUP_DB_REST_TOKEN,
});

const normalizeEmail = (value = '') => String(value).trim().toLowerCase();

const isLegitAdmin = (record) => {
  const email = normalizeEmail(record?.email);
  const username = String(record?.username || '').trim();
  return email === 'mukisamicheal088@gmail.com' || username === 'Admin';
};

const isSuspicious = (record) => {
  if (!record || isLegitAdmin(record)) return false;

  const username = String(record.username || '').toLowerCase();
  const email = normalizeEmail(record.email);
  const domain = email.split('@')[1] || '';

  const disposableDomains = [
    'yopmail.com',
    'tempmail.com',
    'mailinator.com',
    'jctoto.com',
    'guerrillamail.com',
    'maildrop.cc',
    '10minutemail.com',
  ];

  const suspiciousPatterns = [
    'inject',
    'hmac',
    'proto',
    'forge',
    'admin_test',
    'newadmin',
    'nomad.test',
    'fresh.test',
    'testuser',
    'test_where',
    'newreg99',
    'phantompip.com',
    'kimanzi',
    'admin@',
    'support@',
    'info@',
    'contact@',
    'hello@',
    'team@',
    'ceo@',
    'founder@',
    'manager@',
    'billing@',
    'payments@',
    'sales@',
    'noreply@',
    'no-reply@',
    'dev@',
    'bot@',
    'mt5@',
    'trading@',
    'hacker',
    'root',
    'enum',
    'hack',
    'inject.admin',
    'inject.test',
    'test@',
  ];

  const isDisposable = disposableDomains.includes(domain);
  const hasSuspiciousPattern = suspiciousPatterns.some((pattern) => username.includes(pattern) || email.includes(pattern));

  return isDisposable || hasSuspiciousPattern;
};

async function cleanupOne(label, redis) {
  const index = await redis.json.get('users:index');
  const users = Array.isArray(index) && Array.isArray(index[0]) ? index[0] : (Array.isArray(index) ? index : []);

  const matches = users.filter(isSuspicious);

  for (const user of matches) {
    const userId = user?.userId;
    const email = normalizeEmail(user?.email);

    if (userId) {
      await redis.del(`user:${userId}`);
    }
    if (email) {
      await redis.del(`email:${email}`);
    }
  }

  const remaining = users.filter((user) => !matches.some((match) => match.userId && user.userId === match.userId));
  await redis.json.set('users:index', '$', remaining);

  return {
    label,
    removedCount: matches.length,
    remainingCount: remaining.length,
    removed: matches.map((user) => ({
      userId: user.userId,
      username: user.username,
      email: normalizeEmail(user.email),
    })),
  };
}

(async () => {
  try {
    const primaryResult = await cleanupOne('primary', primary);
    const backupResult = await cleanupOne('backup', backup);
    const removed = [...primaryResult.removed, ...backupResult.removed];

    fs.writeFileSync(
      'deleted_suspicious_users.txt',
      [
        'Deleted suspicious user records from primary and backup Redis',
        '',
        ...removed.map((u) => `${u.username || 'Unknown'} | ${u.email || 'unknown'} | ${u.userId || 'no-id'}`),
      ].join('\n') + '\n',
      'utf8'
    );

    console.log('PRIMARY_REMOVED', primaryResult.removedCount);
    console.log('BACKUP_REMOVED', backupResult.removedCount);
    console.log('TOTAL_REMOVED', removed.length);
    console.log('PRIMARY_REMAINING', primaryResult.remainingCount);
    console.log('BACKUP_REMAINING', backupResult.remainingCount);
    console.log('FILE', 'deleted_suspicious_users.txt');
  } catch (error) {
    console.error('ERROR', error && error.message ? error.message : error);
    process.exitCode = 1;
  }
})();
