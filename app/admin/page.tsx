'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingPayments: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const usersRes = await fetch('/api/admin/users');
      const paymentsRes = await fetch('/api/admin/payments/pending');

      const usersData = await usersRes.json();
      const paymentsData = await paymentsRes.json();

      let activeCount = 0;
      let totalRevenue = 0;

      usersData.users?.forEach((user: any) => {
        if (user.accountStatus === 'Active') {
          activeCount++;
        }
      });

      paymentsData.pendingPayments?.forEach((payment: any) => {
        if (payment.status === 'Approved') {
          totalRevenue += payment.amount;
        }
      });

      setStats({
        totalUsers: usersData.users?.length || 0,
        pendingPayments: paymentsData.pendingPayments?.length || 0,
        activeSubscriptions: activeCount,
        totalRevenue,
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
          label="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          color="text-purple-400"
        />
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
    </div>
  );
}
