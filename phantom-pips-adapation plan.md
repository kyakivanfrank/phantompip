# Phantom Pips — Upstash Redis JSON Schema
### Master Reference + Developer Prompt

---

## ⚡ DEVELOPER PROMPT
> Copy and paste this entire block to any AI model before asking it to write database code for this project.

---

```
You are helping build the backend database layer for a trading subscription website called Phantom Pips.
The database is Upstash Redis using the RedisJSON module (@upstash/redis with JSON commands).

RULES YOU MUST FOLLOW:
1. ALL user data — including the admin — lives in ONE document per person under the key: user:{userId}
2. The admin is just a normal user with "isAdmin": true. There is no separate admin collection or admin document type.
3. Do NOT create separate Redis keys for subscriptions, bots, or MT5 — they all live NESTED inside user:{userId}.
4. The admin can READ any user's full document including their plain-text MT5 password. The admin can ONLY write these fields on other users:
     - account.passwordHash (reset password — bcrypt hash first, never plain text)
     - subscription.status
     - subscription.approvalStatus
     - subscription.approvedAt
     - subscription.expiryDate
   The admin CANNOT change a user's email, MT5 credentials, bot settings, or any other field.
5. The admin CAN delete a user entirely. Deleting a user means: DEL user:{userId} AND removing their entry from users:index. Both must happen together — never one without the other.
6. The MT5 password is stored as plain text (the admin needs to read it to log in on the user's behalf). Do NOT hash or encrypt it.
7. The account password IS hashed with bcrypt. When the admin resets a user's password, hash the new password with bcrypt before writing it to account.passwordHash.
8. There is NO tradingStyle field anywhere — not on mt5, not on bots, not anywhere. Each bot has its own fixed style and riskLevel baked in permanently. The user ONLY controls isActive (on/off toggle). Remove tradingStyle immediately if you ever see it.
9. Bot keys are exactly: "neuralXTrend", "scalpAlpha", "gridSentinel" — match these exactly.
10. There is NO settings block on the user document. Username and email live only under account. Do not add a settings block.
11. The users:index key holds a lightweight array used only for the admin's user list page. It contains NO MT5 credentials — those are fetched from the full user document when needed. Keep the index in sync whenever a user is created, updated, or deleted.
12. Use JSON.SET to write, JSON.GET to read, JSON.ARRAPPEND to add payments.
13. Do not break the existing structure. Only add to it — never rename or remove existing fields.
```

---

## Key Structure

| Redis Key | Type | Description |
|---|---|---|
| `user:{userId}` | JSON | One document per user (admin included) |
| `users:index` | JSON | Lightweight list for admin dashboard |

---

## 1. USER DOCUMENT — `user:{userId}`

```json
{
  "userId": "usr_8f3a91bc",
  "isAdmin": false,

  "account": {
    "username": "Rick Jerret",
    "email": "rick@gmail.com",
    "passwordHash": "$2b$12$KIXf3QzLpNhashedpassword",
    "createdAt": "2025-06-01T10:23:00Z",
    "lastLoginAt": "2025-06-10T08:45:00Z"
  },

  "subscription": {
    "status": "active",
    "approvalStatus": "approved",
    "planName": "Premium Plan",
    "priceUSD": 49.99,
    "billingCycle": "monthly",
    "startDate": "2025-06-01",
    "expiryDate": "2025-07-01",
    "approvedAt": "2025-06-01T12:00:00Z",
    "payments": [
      {
        "paymentId": "pay_001",
        "amount": 49.99,
        "method": "USDT",
        "network": "TRON (TRC20)",
        "transactionRef": "TXN_ABC123def456",
        "status": "confirmed",
        "submittedAt": "2025-06-01T09:00:00Z"
      }
    ]
  },

  "mt5": {
    "loginId": "10045231",
    "password": "MyTradingPass99",
    "brokerServer": "ICMarketsSC-Demo",
    "connectedAt": "2025-06-01T11:00:00Z",
    "isConnected": true
  },

  "bots": {
    "neuralXTrend": {
      "displayName": "Neural-X Trend",
      "style": "Trend Following",
      "riskLevel": "Medium Risk",
      "isActive": true,
      "settings": {
        "stopLossPercent": 1.5,
        "takeProfitPercent": 3.0,
        "maxDrawdownPercent": 10.0,
        "dailyLossLimitPercent": 5.0,
        "lotSize": 0.5
      },
      "activatedAt": "2025-06-05T08:00:00Z"
    },
    "scalpAlpha": {
      "displayName": "Scalp Alpha",
      "style": "Scalping",
      "riskLevel": "High Risk",
      "isActive": true,
      "settings": {
        "stopLossPercent": 0.5,
        "takeProfitPercent": 1.0,
        "maxDrawdownPercent": 6.0,
        "dailyLossLimitPercent": 4.0,
        "lotSize": 0.2
      },
      "activatedAt": "2025-06-06T09:00:00Z"
    },
    "gridSentinel": {
      "displayName": "Grid Sentinel",
      "style": "Grid",
      "riskLevel": "Low Risk",
      "isActive": false,
      "settings": {
        "stopLossPercent": 2.0,
        "takeProfitPercent": 4.0,
        "maxDrawdownPercent": 15.0,
        "dailyLossLimitPercent": 6.0,
        "lotSize": 0.1
      },
      "activatedAt": null
    }
  }
}
```

---

## 2. ADMIN DOCUMENT — also `user:{userId}`

The admin is identical in structure. The only difference is `"isAdmin": true`.

```json
{
  "userId": "usr_admin001",
  "isAdmin": true,

  "account": {
    "username": "Admin",
    "email": "admin@phantompips.com",
    "passwordHash": "$2b$12$AdminHashHere",
    "createdAt": "2025-01-01T00:00:00Z",
    "lastLoginAt": "2025-06-10T09:00:00Z"
  },

  "subscription": {
    "status": "active",
    "approvalStatus": "approved",
    "planName": "Premium Plan",
    "priceUSD": 0,
    "billingCycle": "lifetime",
    "startDate": "2025-01-01",
    "expiryDate": "2099-01-01",
    "approvedAt": "2025-01-01T00:00:00Z",
    "payments": []
  },

  "mt5": {
    "loginId": "",
    "password": "",
    "brokerServer": "",
    "connectedAt": null,
    "isConnected": false
  },

  "bots": {
    "neuralXTrend": {
      "displayName": "Neural-X Trend",
      "style": "Trend Following",
      "riskLevel": "Medium Risk",
      "isActive": false,
      "settings": {
        "stopLossPercent": 1.5,
        "takeProfitPercent": 3.0,
        "maxDrawdownPercent": 10.0,
        "dailyLossLimitPercent": 5.0,
        "lotSize": 0.5
      },
      "activatedAt": null
    },
    "scalpAlpha": {
      "displayName": "Scalp Alpha",
      "style": "Scalping",
      "riskLevel": "High Risk",
      "isActive": false,
      "settings": {
        "stopLossPercent": 0.5,
        "takeProfitPercent": 1.0,
        "maxDrawdownPercent": 6.0,
        "dailyLossLimitPercent": 4.0,
        "lotSize": 0.2
      },
      "activatedAt": null
    },
    "gridSentinel": {
      "displayName": "Grid Sentinel",
      "style": "Grid",
      "riskLevel": "Low Risk",
      "isActive": false,
      "settings": {
        "stopLossPercent": 2.0,
        "takeProfitPercent": 4.0,
        "maxDrawdownPercent": 15.0,
        "dailyLossLimitPercent": 6.0,
        "lotSize": 0.1
      },
      "activatedAt": null
    }
  }
}
```

---

## 3. USERS INDEX — `users:index`

Used only on the admin dashboard to list all users. Lightweight — no MT5 credentials here. When the admin needs a user's MT5 details, fetch the full `user:{userId}` document.

```json
[
  {
    "userId": "usr_8f3a91bc",
    "username": "Rick Jerret",
    "email": "rick@gmail.com",
    "subscriptionStatus": "active",
    "approvalStatus": "approved",
    "expiryDate": "2025-07-01",
    "isAdmin": false
  },
  {
    "userId": "usr_2c7e14ad",
    "username": "Jane Smith",
    "email": "jane@gmail.com",
    "subscriptionStatus": "expired",
    "approvalStatus": "approved",
    "expiryDate": "2025-05-15",
    "isAdmin": false
  }
]
```

---

## RedisJSON Commands Reference

### Register a new user (on signup)
```js
await redis.json.set(`user:${userId}`, "$", userObject);
await redis.json.arrappend("users:index", "$", indexEntry);
```

### Get full user document
```js
await redis.json.get(`user:${userId}`);
```

### Get all users (admin dashboard)
```js
await redis.json.get("users:index");
```

### User updates their MT5 credentials
```js
await redis.json.set(`user:${userId}`, "$.mt5", {
  loginId: "10045231",
  password: "NewPass99",
  brokerServer: "ICMarketsSC-Live",
  connectedAt: new Date().toISOString(),
  isConnected: true
});
```

### User toggles a bot on/off
```js
// isActive is the only bot field the user controls
await redis.json.set(`user:${userId}`, "$.bots.scalpAlpha.isActive", true);
```

### User updates bot settings
```js
await redis.json.set(`user:${userId}`, "$.bots.neuralXTrend.settings", {
  stopLossPercent: 2.0,
  takeProfitPercent: 4.0,
  maxDrawdownPercent: 12.0,
  dailyLossLimitPercent: 6.0,
  lotSize: 0.3
});
```

### User submits a payment
```js
await redis.json.arrappend(`user:${userId}`, "$.subscription.payments", {
  paymentId: "pay_002",
  amount: 49.99,
  method: "AirtelMoney",
  network: "MTN Mobile Money",
  transactionRef: "AM_XYZ789",
  status: "pending",
  submittedAt: new Date().toISOString()
});
```

### Admin approves a subscription
```js
await redis.json.set(`user:${userId}`, "$.subscription.status", "active");
await redis.json.set(`user:${userId}`, "$.subscription.approvalStatus", "approved");
await redis.json.set(`user:${userId}`, "$.subscription.approvedAt", new Date().toISOString());
await redis.json.set(`user:${userId}`, "$.subscription.expiryDate", "2025-07-11");

const index = await redis.json.get("users:index");
const i = index.findIndex(u => u.userId === userId);
index[i].subscriptionStatus = "active";
index[i].approvalStatus = "approved";
index[i].expiryDate = "2025-07-11";
await redis.json.set("users:index", "$", index);
```

### Admin rejects a subscription
```js
await redis.json.set(`user:${userId}`, "$.subscription.status", "inactive");
await redis.json.set(`user:${userId}`, "$.subscription.approvalStatus", "rejected");

const index = await redis.json.get("users:index");
const i = index.findIndex(u => u.userId === userId);
index[i].subscriptionStatus = "inactive";
index[i].approvalStatus = "rejected";
await redis.json.set("users:index", "$", index);
```

### Admin changes subscription expiry date
```js
await redis.json.set(`user:${userId}`, "$.subscription.expiryDate", "2025-08-01");

const index = await redis.json.get("users:index");
const i = index.findIndex(u => u.userId === userId);
index[i].expiryDate = "2025-08-01";
await redis.json.set("users:index", "$", index);
```

### Admin resets a user's password
```js
const bcrypt = require("bcrypt");
const newHash = await bcrypt.hash("NewPasswordHere", 12);
await redis.json.set(`user:${userId}`, "$.account.passwordHash", newHash);
```

### Admin reads a user's MT5 credentials
```js
const user = await redis.json.get(`user:${userId}`);
console.log(user.mt5.loginId, user.mt5.password);
```

### Admin deletes a user
```js
// Both steps must always happen together
await redis.del(`user:${userId}`);

const index = await redis.json.get("users:index");
const updated = index.filter(u => u.userId !== userId);
await redis.json.set("users:index", "$", updated);
```

---

## What the Admin Can and Cannot Do

| Action | Admin Can? |
|---|---|
| View all users | ✅ Yes — via `users:index` |
| View a user's full document | ✅ Yes — via `user:{userId}` |
| See MT5 login + password | ✅ Yes — plain text in the user document |
| Approve / reject subscription | ✅ Yes |
| Change subscription expiry date | ✅ Yes |
| Reset a user's password | ✅ Yes — bcrypt hash first, never plain text |
| Delete a user | ✅ Yes — must also remove from `users:index` |
| Change a user's email | ❌ No |
| Change a user's MT5 credentials | ❌ No |
| Change a user's bot settings | ❌ No |
| Toggle a user's bot on/off | ❌ No |

---

## Bot System

Each bot has a fixed style and risk level. They never change. The user only toggles `isActive`.

| Bot Key | Display Name | Style | Risk Level |
|---|---|---|---|
| `neuralXTrend` | Neural-X Trend | Trend Following | Medium Risk |
| `scalpAlpha` | Scalp Alpha | Scalping | High Risk |
| `gridSentinel` | Grid Sentinel | Grid | Low Risk |

---

## Field Reference

```
user:{userId}
├── userId                            string    "usr_8f3a91bc"
├── isAdmin                           boolean   false
│
├── account
│   ├── username                      string
│   ├── email                         string
│   ├── passwordHash                  string    bcrypt hash — never plain text
│   ├── createdAt                     string    ISO datetime
│   └── lastLoginAt                   string    ISO datetime
│
├── subscription
│   ├── status                        string    "active" | "expired" | "pending" | "inactive"
│   ├── approvalStatus                string    "approved" | "pending" | "rejected"
│   ├── planName                      string
│   ├── priceUSD                      number
│   ├── billingCycle                  string    "monthly" | "lifetime"
│   ├── startDate                     string    "YYYY-MM-DD"
│   ├── expiryDate                    string    "YYYY-MM-DD"
│   ├── approvedAt                    string    ISO datetime | null
│   └── payments[]
│       ├── paymentId                 string
│       ├── amount                    number
│       ├── method                    string    "USDT" | "AirtelMoney" | "MTNMobileMoney"
│       ├── network                   string    "TRON (TRC20)" | "MTN" | "Airtel"
│       ├── transactionRef            string
│       ├── status                    string    "pending" | "confirmed" | "rejected"
│       └── submittedAt               string    ISO datetime
│
├── mt5
│   ├── loginId                       string    plain text
│   ├── password                      string    plain text (admin needs this)
│   ├── brokerServer                  string
│   ├── connectedAt                   string    ISO datetime | null
│   └── isConnected                   boolean
│
└── bots
    ├── neuralXTrend
    │   ├── displayName               string    fixed
    │   ├── style                     string    fixed
    │   ├── riskLevel                 string    fixed
    │   ├── isActive                  boolean   only field the user controls
    │   ├── settings
    │   │   ├── stopLossPercent       number
    │   │   ├── takeProfitPercent     number
    │   │   ├── maxDrawdownPercent    number
    │   │   ├── dailyLossLimitPercent number
    │   │   └── lotSize               number
    │   └── activatedAt               string | null
    ├── scalpAlpha                    (same shape)
    └── gridSentinel                  (same shape)
```

---

## Security Notes

- `account.passwordHash` — bcrypt only, never plain text
- `mt5.password` — plain text intentionally, admin needs it for manual trading
- `users:index` — server-side only, never expose to a regular user's session
- Enforce admin write restrictions at the API route level, not just by convention