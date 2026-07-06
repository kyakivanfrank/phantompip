import { getAllUsers, getUser, mapWithConcurrency } from "@/lib/server/db";

function summarizeUser(user: any, now: number) {
  const expiryTimestamp = new Date(user.subscription.expiryDate).getTime();
  const isExpired = expiryTimestamp < now;
  const isActive = user.subscription.status === "active" && user.subscription.approvalStatus === "approved" && !isExpired;
  const isPendingApproval = user.subscription.approvalStatus === "pending";

  return {
    expiryTimestamp,
    isExpired,
    isActive,
    isPendingApproval,
    paidAmount: (user.subscription.payments || []).reduce((sum: number, payment: any) => {
      if (payment.status === "confirmed") {
        return sum + (payment.amount || 0);
      }
      return sum;
    }, 0) || 0,
    mt5Connected: Boolean(user.mt5?.isConnected),
  };
}

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
  const nonAdminUsers = userIndex.filter((userSummary) => !userSummary.isAdmin);

  let totalUsers = nonAdminUsers.length;
  let activeUsers = 0;
  let pendingApprovalUsers = 0;
  let expiredUsers = 0;
  let mt5ConnectedUsers = 0;
  let totalRevenue = 0;
  let activeSubscriptions = 0;
  let expiringSubscriptions = 0;

  const now = Date.now();
  const userSummaries = await mapWithConcurrency(nonAdminUsers.slice(0, 60), async (userSummary) => {
    const fullUser = await getUser(userSummary.userId);
    if (!fullUser) {
      return null;
    }

    return summarizeUser(fullUser, now);
  }, 12);

  for (const summary of userSummaries) {
    if (!summary) continue;

    if (summary.isActive) {
      activeUsers++;
      activeSubscriptions++;
    } else if (summary.isPendingApproval) {
      pendingApprovalUsers++;
    } else if (summary.isExpired) {
      expiredUsers++;
    }

    if (summary.mt5Connected) {
      mt5ConnectedUsers++;
    }

    totalRevenue += summary.paidAmount;

    if (summary.isActive) {
      const daysUntilExpiry = Math.ceil((summary.expiryTimestamp - now) / (24 * 60 * 60 * 1000));
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