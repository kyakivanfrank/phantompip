import { getSupabase } from "@/lib/server/supabase";

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
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("app_admin_stats");

  if (error) {
    throw new Error(`Failed to calculate admin stats: ${error.message}`);
  }

  return {
    totalUsers: Number(data?.totalUsers ?? 0),
    activeUsers: Number(data?.activeUsers ?? 0),
    pendingApprovalUsers: Number(data?.pendingApprovalUsers ?? 0),
    expiredUsers: Number(data?.expiredUsers ?? 0),
    mt5ConnectedUsers: Number(data?.mt5ConnectedUsers ?? 0),
    totalRevenue: Number(data?.totalRevenue ?? 0),
    activeSubscriptions: Number(data?.activeSubscriptions ?? 0),
    expiringSubscriptions: Number(data?.expiringSubscriptions ?? 0),
  };
}