export interface AuthSession {
  userId: string;
  email: string;
  isAdmin: boolean;
  expiresAt: number;
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  accountStatus: "Pending Approval" | "Active" | "Expired";
  subscriptionExpiresAt: number;
  createdAt: number;
  isAdmin: boolean;
  mt5Connected: boolean;
}

export interface Mt5Credentials {
  mt5LoginId: string;
  mt5PasswordEncrypted: string;
  mt5PasswordAuthTag: string;
  mt5PasswordIV: string;
  brokerServer: string;
  tradingStyle: "Scalping" | "Conservative" | "Aggressive";
  connectionStatus: "Connected" | "Disconnected";
  connectedAt: number;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  method: "USDT-TRC20" | "MTN-MoMo" | "Airtel" | "Coupon";
  transactionId: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: number;
  approvedAt?: number;
  couponCode?: string;
  originalAmount?: number; // Amount before coupon discount
}

export interface CouponRecord {
  code: string;
  discountPercent: number;
  maxUses: number;
  currentUses: number;
  expiresAt: number;
  description: string;
  isActive: boolean;
}
