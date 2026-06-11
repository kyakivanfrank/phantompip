/**
 * Common types used throughout the application
 */

// -----------------------------------------------------------------------------
// REDIS JSON SCHEMA TYPES
// -----------------------------------------------------------------------------

export interface Payment {
  paymentId: string;
  amount: number;
  method: "USDT" | "AirtelMoney" | "MTNMobileMoney";
  network: "TRON (TRC20)" | "MTN" | "Airtel" | string;
  transactionRef: string;
  status: "pending" | "confirmed" | "rejected";
  submittedAt: string; // ISO datetime
}

export interface Subscription {
  status: "active" | "expired" | "pending" | "inactive";
  approvalStatus: "approved" | "pending" | "rejected";
  planName: string;
  priceUSD: number;
  billingCycle: "monthly" | "lifetime";
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  approvedAt: string | null; // ISO datetime
  payments: Payment[];
}

export interface Account {
  username: string;
  email: string;
  passwordHash: string; // bcrypt hash - NEVER plain text
  createdAt: string; // ISO datetime
  lastLoginAt: string; // ISO datetime
}

export interface Mt5Details {
  loginId: string; // plain text account number
  password: string; // plain text (admin needs this)
  brokerServer: string;
  connectedAt: string | null; // ISO datetime
  isConnected: boolean;
}

export interface BotSettingsDetails {
  stopLossPercent: number;
  takeProfitPercent: number;
  maxDrawdownPercent: number;
  dailyLossLimitPercent: number;
  lotSize: number;
}

export interface Bot {
  displayName: string; // fixed, never change
  style: string; // fixed, never change
  riskLevel: string; // fixed, never change
  isActive: boolean; // ONLY field user controls
  settings: BotSettingsDetails;
  activatedAt: string | null;
}

export interface Bots {
  neuralXTrend: Bot;
  scalpAlpha: Bot;
  gridSentinel: Bot;
}

/**
 * The unified User document structure (`user:{userId}`)
 */
export interface UserDocument {
  userId: string;
  isAdmin: boolean;
  account: Account;
  subscription: Subscription;
  mt5: Mt5Details | null;
  bots: Partial<Bots>;
}

/**
 * Lightweight index object for `users:index`
 */
export interface UserIndexEntry {
  userId: string;
  username: string;
  email: string;
  subscriptionStatus: "active" | "expired" | "pending" | "inactive";
  approvalStatus: "approved" | "pending" | "rejected";
  expiryDate: string;
  isAdmin: boolean;
}

// -----------------------------------------------------------------------------
// LEGACY / OTHER TYPES
// -----------------------------------------------------------------------------

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UiState {
  isLoading: boolean;
  error?: string;
  success?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  defaultTimeframe: string;
  defaultSymbols: string[];
}
