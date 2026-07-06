import { getAllUsers, getUser, mapWithConcurrency } from "@/lib/server/db";

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

  const totalUsers = nonAdminUsers.length;
  let activeUsers = 0;
  let pendingApprovalUsers = 0;
  let expiredUsers = 0;
  let mt5ConnectedUsers = 0;
  let totalRevenue = 0;
  let activeSubscriptions = 0;
  let expiringSubscriptions = 0;

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  // --- Phase 1: Subscription-status metrics from the lightweight index ---------------------
  // The users:index already carries subscriptionStatus / approvalStatus / expiryDate, so every
  // status count is computed here WITHOUT fetching a single full user document. This keeps the
  // dashboard fast and, unlike the previous 60-user cap, accurate at any scale.
  for (const entry of nonAdminUsers) {
    const expiryTimestamp = entry.expiryDate ? new Date(entry.expiryDate).getTime() : 0;
    const isExpired = !expiryTimestamp || expiryTimestamp < now;
    const isActive =
      entry.subscriptionStatus === "active" &&
      entry.approvalStatus === "approved" &&
      !isExpired;

    if (isActive) {
      activeUsers++;
      activeSubscriptions++;
      const daysUntilExpiry = Math.ceil((expiryTimestamp - now) / DAY_MS);
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        expiringSubscriptions++;
      }
    } else if (entry.approvalStatus === "pending") {
      pendingApprovalUsers++;
    } else if (isExpired) {
      expiredUsers++;
    }
  }

  // --- Phase 2: Revenue + MT5 connectivity from full documents -----------------------------
  // These two figures live inside the full user document (payments[] and mt5.isConnected) and
  // cannot be read from the index, so a scan is unavoidable. Bounded concurrency keeps Redis
  // from being throttled under load.
  const perUserFinancials = await mapWithConcurrency(nonAdminUsers, async (entry) => {
    const fullUser = await getUser(entry.userId);
    if (!fullUser) return null;

    const paidAmount = (fullUser.subscription?.payments || []).reduce((sum: number, payment: any) => {
      return payment.status === "confirmed" ? sum + (payment.amount || 0) : sum;
    }, 0);

    return { paidAmount, mt5Connected: Boolean(fullUser.mt5?.isConnected) };
  }, 12);

  for (const financials of perUserFinancials) {
    if (!financials) continue;
    totalRevenue += financials.paidAmount;
    if (financials.mt5Connected) mt5ConnectedUsers++;
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