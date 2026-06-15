'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users, CreditCard, AlertCircle,
  TimerReset, KeyRound, ArrowRight, Activity
} from 'lucide-react';

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

  const [queues, setQueues] = useState({
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
      const [statsRes, usersRes, paymentsRes, mt5VaultRes] = await Promise.all([
        fetch('/api/admin/stats', { cache: 'no-store' }),
        fetch('/api/admin/users', { cache: 'no-store' }),
        fetch('/api/admin/payments/pending', { cache: 'no-store' }),
        fetch('/api/admin/mt5-vault', { cache: 'no-store' })
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const paymentsData = await paymentsRes.json();
      const mt5VaultData = await mt5VaultRes.json();

      const dashboardStats = statsData.data || {};
      const users = usersData.data?.users || [];
      const pendingPayments = paymentsData.data?.pendingPayments || [];
      const mt5Vault = mt5VaultData.data?.users || [];

      setStats(dashboardStats);

      setQueues({
        pendingUsers: users.filter((u: any) => u.accountStatus === 'Pending Approval').slice(0, 4),
        expiringUsers: users.filter((u: any) => u.accountStatus === 'Active' && u.daysRemaining <= 7)
          .sort((a: any, b: any) => a.daysRemaining - b.daysRemaining).slice(0, 4),
        pendingPayments: pendingPayments.slice(0, 4),
        mt5Channels: mt5Vault.filter((u: any) => u.hasCredentials).slice(0, 4),
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  // Helper component for mini-stats inside the domain blocks
  const MiniStat = ({ label, value, colorClass }: { label: string, value: string | number, colorClass: string }) => (
    <div className="rounded-lg bg-white/[0.03] p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${colorClass}`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold text-white">Admin Hub</h1>
        <p className="mt-1 text-gray-400">System overview and pending actions</p>
      </motion.div>

      {/* Domain-Driven Grid */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* 1. MT5 VAULT & INFRASTRUCTURE BLOCK */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-dark-secondary/40 backdrop-blur-xl"
        >
          <div className="border-b border-white/[0.1] p-5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-cyan-500/20 p-2"><Activity className="h-5 w-5 text-cyan-400" /></div>
              <h2 className="font-semibold text-white">MT5 Vault</h2>
            </div>
            <Link href="/admin/mt5-vault" className="group flex items-center text-sm text-gray-400 hover:text-white transition-colors">
              Manage Vault <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="p-5 flex-1 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Connected Accounts" value={stats.mt5ConnectedUsers} colorClass="text-cyan-400" />
              <MiniStat label="Disconnected" value={stats.totalUsers - stats.mt5ConnectedUsers} colorClass="text-gray-400" />
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-300">
                <KeyRound className="h-4 w-4 text-cyan-400" /> Recent Connections
              </h3>
              <div className="space-y-2">
                {queues.mt5Channels.length > 0 ? queues.mt5Channels.map((vault: any) => (
                  <Link key={vault.userId} href={`/admin/mt5-vault?search=${vault.mt5LoginId}`} className="flex justify-between items-center rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 hover:bg-white/[0.05] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">{vault.userFullName || 'Unknown'}</p>
                      <p className="text-xs text-gray-400 uppercase">{vault.brokerServer}</p>
                    </div>
                    <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-full">{vault.mt5LoginId}</span>
                  </Link>
                )) : <p className="text-sm text-gray-500">No active MT5 credentials stored.</p>}
              </div>
            </div>
          </div>
        </motion.div>


        {/* 2. USERS & ACCOUNTS BLOCK */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-dark-secondary/40 backdrop-blur-xl"
        >
          <div className="border-b border-white/[0.1] p-5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/20 p-2"><Users className="h-5 w-5 text-blue-400" /></div>
              <h2 className="font-semibold text-white">User Management</h2>
            </div>
            <Link href="/admin/users" className="group flex items-center text-sm text-gray-400 hover:text-white transition-colors">
              View All <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="p-5 flex-1 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Total Users" value={stats.totalUsers} colorClass="text-white" />
              <MiniStat label="Active" value={stats.activeUsers} colorClass="text-green-400" />
              <MiniStat label="Expiring (≤7d)" value={stats.expiringSubscriptions} colorClass="text-orange-400" />
              <MiniStat label="Pending" value={stats.pendingApprovalUsers} colorClass="text-yellow-400" />
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-300">
                <AlertCircle className="h-4 w-4 text-yellow-400" /> Action Required: Approvals
              </h3>
              <div className="space-y-2">
                {queues.pendingUsers.length > 0 ? queues.pendingUsers.map((user: any) => (
                  <Link key={user.userId || user.id} href={`/admin/payments`} className="block rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 hover:bg-white/[0.05] transition-colors">
                    <p className="text-sm font-medium text-white">{user.fullName || user.username}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </Link>
                )) : <p className="text-sm text-gray-500">No pending user approvals.</p>}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3. REVENUE & PAYMENTS BLOCK */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-dark-secondary/40 backdrop-blur-xl"
        >
          <div className="border-b border-white/[0.1] p-5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/20 p-2"><CreditCard className="h-5 w-5 text-purple-400" /></div>
              <h2 className="font-semibold text-white">Financials</h2>
            </div>
            <Link href="/admin/payments" className="group flex items-center text-sm text-gray-400 hover:text-white transition-colors">
              View Ledger <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="p-5 flex-1 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} colorClass="text-purple-400" />
              <MiniStat label="Active Subs" value={stats.activeSubscriptions} colorClass="text-green-400" />
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-300">
                <TimerReset className="h-4 w-4 text-purple-400" /> Pending Payments
              </h3>
              <div className="space-y-2">
                {queues.pendingPayments.length > 0 ? queues.pendingPayments.map((payment: any) => (
                  <Link key={payment.paymentId} href={`/admin/payments?highlight=${payment.paymentId}`} className="flex justify-between items-center rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 hover:bg-white/[0.05] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">{payment.username || 'Unknown User'}</p>
                      <p className="text-xs text-gray-400">{payment.method}</p>
                    </div>
                    <span className="text-sm font-medium text-purple-400">${payment.amount}</span>
                  </Link>
                )) : <p className="text-sm text-gray-500">No unconfirmed payments.</p>}
              </div>
            </div>
          </div>
        </motion.div>


      </div>
    </div>
  );
}