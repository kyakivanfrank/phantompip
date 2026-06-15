import { getAllUsers, getUser } from "@/lib/server/db";

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovalUsers: number;
  expiredUsers: number;
  mt5ConnectedUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  expiringSubscriptions: number; // Expiring within 7 days
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const userIndex = await getAllUsers();
  
  let totalUsers = 0;
  let activeUsers = 0;
  let pendingApprovalUsers = 0;
  let expiredUsers = 0;
  let mt5ConnectedUsers = 0;
  let totalRevenue = 0;
  let activeSubscriptions = 0;
  let expiringSubscriptions = 0;

  const now = Date.now();

  for (const userSummary of userIndex) {
    // Skip admin users
    if (userSummary.isAdmin) continue;

    totalUsers++;

    // Get full user data
    const fullUser = await getUser(userSummary.userId);
    if (!fullUser) continue;

    // Account status breakdown
    const expiryTimestamp = new Date(fullUser.subscription.expiryDate).getTime();
    const isExpired = expiryTimestamp < now;
    const isActive = fullUser.subscription.status === "active" && fullUser.subscription.approvalStatus === "approved" && !isExpired;
    const isPendingApproval = fullUser.subscription.approvalStatus === "pending";

    if (isActive) {
      activeUsers++;
      activeSubscriptions++;
    } else if (isPendingApproval) {
      pendingApprovalUsers++;
    } else if (isExpired) {
      expiredUsers++;
    }

    // MT5 connection check
    if (fullUser.mt5?.isConnected) {
      mt5ConnectedUsers++;
    }

    // Revenue calculation (sum of paid amounts)
    const paidAmount = fullUser.subscription.payments?.reduce((sum, payment) => {
      // FIX: Changed from "approved" to "confirmed" to match your Payment status type
      if (payment.status === "confirmed") {
        return sum + (payment.amount || 0);
      }
      return sum;
    }, 0) || 0;
    
    totalRevenue += paidAmount;

    // Expiring subscriptions check (within 7 days and active)
    if (isActive) {
      const daysUntilExpiry = Math.ceil((expiryTimestamp - now) / (24 * 60 * 60 * 1000));
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        expiringSubscriptions++;
      }
    }
  }

  return {
    totalUsers,
    activeUsers,
    pendingApprovalUsers,
    expiredUsers,
    mt5ConnectedUsers,
    totalRevenue,
    activeSubscriptions,
    expiringSubscriptions,
  };
}