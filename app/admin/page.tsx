'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, CreditCard, TrendingUp, AlertCircle, ShieldCheck, TimerReset, KeyRound } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingPayments: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    activeMt5Channels: 0,
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
      const usersRes = await fetch('/api/admin/users', { cache: 'no-store' });
      const paymentsRes = await fetch('/api/admin/payments/pending', { cache: 'no-store' });
      const mt5VaultRes = await fetch('/api/admin/mt5-vault', { cache: 'no-store' });

      const usersData = await usersRes.json();
      const paymentsData = await paymentsRes.json();
      const mt5VaultData = await mt5VaultRes.json();

      const users = usersData.data?.users || [];
      const pendingPayments = paymentsData.data?.pendingPayments || [];
      const mt5Vault = mt5VaultData.data?.mt5Vault || [];

      const activeCount = users.filter((user: any) => user.accountStatus === 'Active').length;
      const totalRevenue = users.reduce((sum: number, user: any) => sum + (user.paidAmount || 0), 0);
      const pendingUsers = users.filter((user: any) => user.accountStatus === 'Pending Approval').slice(0, 5);
      const expiringUsers = users
        .filter((user: any) => user.accountStatus === 'Active' && user.daysRemaining <= 7)
        .sort((left: any, right: any) => left.daysRemaining - right.daysRemaining)
        .slice(0, 5);

      setStats({
        totalUsers: users.length,
        pendingPayments: pendingPayments.length,
        activeSubscriptions: activeCount,
        totalRevenue,
        activeMt5Channels: mt5Vault.length,
      });

      setOpsQueues({
        pendingUsers,
        expiringUsers,
        pendingPayments: pendingPayments.slice(0, 5),
        mt5Channels: mt5Vault.slice(0, 5),
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          color="text-cyan-400"
        />
        <StatCard
          icon={CreditCard}
          label="Pending Payments"
          value={stats.pendingPayments}
          color="text-yellow-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Subscriptions"
          value={stats.activeSubscriptions}
          color="text-green-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Cleared User Value"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          color="text-purple-400"
        />
        <StatCard
          icon={KeyRound}
          label="Active MT5 Channels"
          value={stats.activeMt5Channels}
          color="text-cyan-400"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">Needs Review</h2>
          </div>
          <div className="space-y-3">
            {opsQueues.pendingUsers.length > 0 ? opsQueues.pendingUsers.map((user) => (
              <Link key={user.id} href={`/admin/users?userId=${user.id}`} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-dark-tertiary/30 px-4 py-3 hover:bg-white/[0.03] transition-colors">
                <div>
                  <p className="font-medium text-white">{user.fullName}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
                <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">Pending</span>
              </Link>
            )) : <p className="text-sm text-gray-400">No users waiting for approval.</p>}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center gap-2">
            <TimerReset className="h-5 w-5 text-violet-400" />
            <h2 className="text-lg font-semibold text-white">Expiring Soon</h2>
          </div>
          <div className="space-y-3">
            {opsQueues.expiringUsers.length > 0 ? opsQueues.expiringUsers.map((user) => (
              <Link key={user.id} href={`/admin/users?userId=${user.id}`} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-dark-tertiary/30 px-4 py-3 hover:bg-white/[0.03] transition-colors">
                <div>
                  <p className="font-medium text-white">{user.fullName}</p>
                  <p className="text-sm text-gray-400">{user.daysRemaining} day(s) left</p>
                </div>
                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">Renewal Watch</span>
              </Link>
            )) : <p className="text-sm text-gray-400">No subscriptions are near expiry.</p>}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-2xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl"
      >
        <div className="mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">Quick Navigation</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/users"
            className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4 hover:bg-cyan-500/20 transition-colors"
          >
            <p className="font-medium text-cyan-400">View All Users</p>
            <p className="mt-1 text-xs text-gray-400">Manage user accounts and subscriptions</p>
          </a>
          <a
            href="/admin/payments"
            className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 hover:bg-yellow-500/20 transition-colors"
          >
            <p className="font-medium text-yellow-400">Review Payments</p>
            <p className="mt-1 text-xs text-gray-400">Approve or reject payment submissions</p>
          </a>
          <a
            href="/admin/mt5-vault"
            className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-4 hover:bg-purple-500/20 transition-colors"
          >
            <p className="font-medium text-purple-400">MT5 Vault</p>
            <p className="mt-1 text-xs text-gray-400">Access encrypted MT5 credentials</p>
          </a>
        </div>
      </motion.div>

      <div className="grid gap-4 xl:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="rounded-2xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Pending Payments Queue</h2>
          </div>
          <div className="space-y-3">
            {opsQueues.pendingPayments.length > 0 ? opsQueues.pendingPayments.map((payment) => (
              <Link key={payment.id} href={`/admin/users?userId=${payment.userId}`} className="block rounded-xl border border-white/[0.06] bg-dark-tertiary/30 px-4 py-3 hover:bg-white/[0.03] transition-colors">
                <p className="font-medium text-white">{payment.userFullName}</p>
                <p className="mt-1 text-sm text-gray-400">{payment.method} • ${payment.amount.toFixed(2)}</p>
              </Link>
            )) : <p className="text-sm text-gray-400">No pending payments need action.</p>}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Live MT5 Channels</h2>
          </div>
          <div className="space-y-3">
            {opsQueues.mt5Channels.length > 0 ? opsQueues.mt5Channels.map((entry) => (
              <Link key={entry.userId} href={`/admin/users?userId=${entry.userId}`} className="block rounded-xl border border-white/[0.06] bg-dark-tertiary/30 px-4 py-3 hover:bg-white/[0.03] transition-colors">
                <p className="font-medium text-white">{entry.userFullName}</p>
                <p className="mt-1 text-sm text-gray-400">{entry.brokerServer}</p>
              </Link>
            )) : <p className="text-sm text-gray-400">No active MT5 channels yet.</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
