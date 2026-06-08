'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, TrendingUp, CheckCircle, Clock, Zap } from 'lucide-react';

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      const meData = await meRes.json();
      setUserData(meData.user);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="h-12 w-12 rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const daysRemaining = userData
    ? Math.ceil((userData.subscriptionExpiresAt - Date.now()) / (24 * 60 * 60 * 1000))
    : 0;

  const statusColor =
    userData?.accountStatus === 'Active'
      ? 'text-green-400'
      : userData?.accountStatus === 'Pending Approval'
        ? 'text-yellow-400'
        : 'text-red-400';

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-2xl font-semibold text-white">Welcome back,</h1>
        <h1 className="text-3xl font-semibold text-white">{userData?.fullName}</h1>
        <p className="text-gray-400">
          Manage your MT5 account and subscription below
        </p>
      </motion.div>

      {/* Status Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {/* Account Status */}
        <div className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">Account Status</p>
              <p className={`mt-2 text-2xl font-bold ${statusColor}`}>
                {userData?.accountStatus}
              </p>
            </div>
            <CheckCircle className={`h-8 w-8 ${statusColor}`} />
          </div>
        </div>

        {/* Days Remaining */}
        <div className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">Days Remaining</p>
              <p className={`mt-2 text-2xl font-bold ${
                daysRemaining > 7 ? 'text-green-400' : daysRemaining > 0 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {daysRemaining > 0 ? daysRemaining : 0}
              </p>
            </div>
            <Calendar className={`h-8 w-8 ${
              daysRemaining > 7 ? 'text-green-400' : daysRemaining > 0 ? 'text-yellow-400' : 'text-red-400'
            }`} />
          </div>
        </div>

        {/* MT5 Status */}
        <div className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">MT5 Account</p>
              <p className={`mt-2 text-2xl font-bold ${userData?.mt5Connected ? 'text-green-400' : 'text-gray-400'}`}>
                {userData?.mt5Connected ? 'Connected' : 'Not Connected'}
              </p>
            </div>
            <Zap className={`h-8 w-8 ${userData?.mt5Connected ? 'text-green-400' : 'text-gray-400'}`} />
          </div>
        </div>

        {/* Trading Style */}
        <div className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">Trading Style</p>
              <p className="mt-2 text-2xl font-bold text-cyan-400">
                {userData?.tradingStyle || 'Not set'}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-cyan-400" />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2"
      >
        {/* Connect MT5 Card */}
        {!userData?.mt5Connected ? (
          <Link
            href="/dashboard/mt5"
            className="group rounded-xl border-2 border-dashed border-cyan-500/30 bg-cyan-500/5 p-6 transition-all hover:border-cyan-500/50 hover:bg-cyan-500/10"
          >
            <div className="flex items-center gap-4">
              <Zap className="h-8 w-8 text-cyan-400" />
              <div>
                <h3 className="font-semibold text-white">Connect MT5 Account</h3>
                <p className="text-sm text-gray-400">
                  Link your MetaTrader 5 credentials to get started
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <div>
                <h3 className="font-semibold text-white">MT5 Connected</h3>
                <p className="text-sm text-gray-400">
                  Your trading account is active and ready
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Card */}
        {userData?.accountStatus !== 'Active' ? (
          <Link
            href="/dashboard/subscription"
            className="group rounded-xl border-2 border-dashed border-purple-500/30 bg-purple-500/5 p-6 transition-all hover:border-purple-500/50 hover:bg-purple-500/10"
          >
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-purple-400" />
              <div>
                <h3 className="font-semibold text-white">Activate Subscription</h3>
                <p className="text-sm text-gray-400">
                  Submit payment to activate your account
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-purple-400" />
              <div>
                <h3 className="font-semibold text-white">Subscription Active</h3>
                <p className="text-sm text-gray-400">
                  Your subscription is active until {new Date(userData?.subscriptionExpiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl"
      >
        <h3 className="font-semibold text-white mb-4">Getting Started</h3>
        <ol className="space-y-3 text-sm text-gray-400">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-medium">1</span>
            <span>
              <strong className="text-white">Connect your MT5 account</strong> - Go to the MT5 Account section and enter your credentials
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-medium">2</span>
            <span>
              <strong className="text-white">Submit your payment</strong> - Send your payment and submit a receipt in the Subscription section
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-medium">3</span>
            <span>
              <strong className="text-white">Wait for approval</strong> - Our admin will review and activate your account
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-medium">4</span>
            <span>
              <strong className="text-white">Start trading</strong> - Once approved, our algorithmic bot will start trading on your behalf
            </span>
          </li>
        </ol>
      </motion.div>
    </div>
  );
}
