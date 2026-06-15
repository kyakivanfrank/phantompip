'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, CreditCard, TrendingUp, AlertCircle, ShieldCheck, TimerReset, KeyRound } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovalUsers: 0,
    expiredUsers: 0,
    mt5ConnectedUsers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    expiringSubscriptions: 0,
  });
  const [opsQueues, setOpsQueues] = useState({
    pendingUsers: [] as any[],
    expiringUsers: [] as any[],
    pendingPayments: [] as any[],
    mt5Channels: [] as any[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const statsRes = await fetch('/api/admin/stats', { cache: 'no-store' });
      const usersRes = await fetch('/api/admin/users', { cache: 'no-store' });
      const paymentsRes = await fetch('/api/admin/payments/pending', { cache: 'no-store' });
      const mt5VaultRes = await fetch('/api/admin/mt5-vault', { cache: 'no-store' });

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const paymentsData = await paymentsRes.json();
      const mt5VaultData = await mt5VaultRes.json();

      const dashboardStats = statsData.data || {};
      const users = usersData.data?.users || [];
      const pendingPayments = paymentsData.data?.pendingPayments || [];
      const mt5Vault = mt5VaultData.data?.users || [];

      const pendingUsers = users.filter((user: any) => user.accountStatus === 'Pending Approval').slice(0, 5);
      const expiringUsers = users
        .filter((user: any) => user.accountStatus === 'Active' && user.daysRemaining <= 7)
        .sort((left: any, right: any) => left.daysRemaining - right.daysRemaining)
        .slice(0, 5);

      setStats(dashboardStats);

      setOpsQueues({
        pendingUsers,
        expiringUsers,
        pendingPayments: pendingPayments.slice(0, 5),
        mt5Channels: mt5Vault.filter((u: any) => u.hasCredentials).slice(0, 5),
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">{label}</p>
          <p className={`mt-2 text-3xl font-semibold ${color}`}>{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${color.replace('text', 'bg').replace('cyan-400', 'cyan-500/20')}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="h-12 w-12 rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-semibold text-white">Admin Dashboard</h1>
        <p className="text-gray-400">Platform overview and management</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="text-blue-400" />
        <StatCard icon={ShieldCheck} label="Active Users" value={stats.activeUsers} color="text-green-400" />
        <StatCard icon={AlertCircle} label="Pending Approval" value={stats.pendingApprovalUsers} color="text-yellow-400" />
        <StatCard icon={KeyRound} label="MT5 Connected" value={stats.mt5ConnectedUsers} color="text-cyan-400" />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={CreditCard} label="Active Subscriptions" value={stats.activeSubscriptions} color="text-green-400" />
        <StatCard icon={TimerReset} label="Expiring Soon" value={stats.expiringSubscriptions} color="text-orange-400" />
        <StatCard icon={TrendingUp} label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} color="text-purple-400" />
      </div>

      {/* Operational Queues */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            Pending Approvals
          </h3>
          <div className="space-y-3">
            {opsQueues.pendingUsers.length > 0 ? (
              opsQueues.pendingUsers.map((user: any) => (
                <Link key={user.id} href={`/admin/users/${user.id}`} className="block p-3 rounded-lg border border-yellow-500/20 hover:bg-yellow-500/5 transition-colors">
                  <p className="text-sm font-medium text-white">{user.fullName}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-400">No pending approvals</p>
            )}
          </div>
        </motion.div>

        {/* Expiring Subscriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TimerReset className="h-5 w-5 text-orange-400" />
            Expiring Soon (≤7 days)
          </h3>
          <div className="space-y-3">
            {opsQueues.expiringUsers.length > 0 ? (
              opsQueues.expiringUsers.map((user: any) => (
                <Link key={user.id} href={`/admin/users/${user.id}`} className="block p-3 rounded-lg border border-orange-500/20 hover:bg-orange-500/5 transition-colors">
                  <p className="text-sm font-medium text-white">{user.fullName}</p>
                  <p className="text-xs text-gray-400">{user.daysRemaining} days remaining</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-400">No expiring subscriptions</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
