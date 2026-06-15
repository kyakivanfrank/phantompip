'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BadgeDollarSign,
  CalendarClock,
  CheckCircle,
  Clock,
  CreditCard,
  ShieldCheck,
  TimerReset,
  Zap,
} from 'lucide-react';

type DashboardUser = {
  id: string;
  email: string;
  username: string;
  accountStatus: string;
  subscriptionExpiresAt: number;
  mt5Connected: boolean;
  subscription: {
    status: string;
    approvalStatus: string;
    isActive: boolean;
    planName: string;
    billingCycle: string;
    expiryDate: string;
    expiryTimestamp: number;
    remainingDays: number;
    paidAmount: number;
    latestPaymentStatus: string | null;
    latestPaymentMethod: string | null;
    latestPaymentSubmittedAt: string | null;
  };
  mt5: {
    isConnected: boolean;
    loginId: string;
    brokerServer: string;
    connectedAt: string | null;
  };
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

function formatDate(value: string | number | null) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString();
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<DashboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const meRes = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' });
      const meData = await meRes.json();
      setUserData(meData.data?.user);
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

  const isSubscriptionActive = userData?.subscription?.isActive === true;
  const showConnectMt5 = !userData?.mt5?.isConnected;
  const mt5ActionHref = isSubscriptionActive ? '/dashboard/mt5' : '/dashboard/subscription';
  const subscriptionLabel = isSubscriptionActive ? 'Premium Access' : userData?.subscription?.approvalStatus === 'pending' ? 'Awaiting Approval' : 'Subscription Required';




  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-white">
            {`Welcome, ${userData?.username ? userData.username.split(' ')[0] : 'Trader'}`}
          </h1>
          <p className="text-gray-400">
            Manage your subscription and MT5 account settings
          </p>
        </div>
      </motion.div>

      {/* Status Cards Grid */}
      <div className="grid gap-6">
        {/* Subscription Status Card - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl md:col-span-2"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3">
              {isSubscriptionActive ? (
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-500/20">
                  <BadgeDollarSign className="h-5 w-5 text-green-400" />
                </div>
              ) : (
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-yellow-500/20">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Subscription Status
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {subscriptionLabel}
                </p>
              </div>
            </div>
          </div>

          {isSubscriptionActive && userData?.subscription && (
            <div className="space-y-3 border-t border-white/[0.1] pt-4">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Plan</p>
                  <p className="text-sm font-semibold text-green-300">{userData.subscription.planName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Billing Cycle</p>
                  <p className="text-sm font-semibold text-green-300 capitalize">{userData.subscription.billingCycle}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Expires</p>
                  <p className="text-sm font-semibold text-green-300">{userData.subscription.expiryDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Days Remaining</p>
                  <p className={`text-sm font-semibold ${userData.subscription.remainingDays > 7 ? 'text-green-300' : userData.subscription.remainingDays > 0 ? 'text-yellow-300' : 'text-red-300'}`}>
                    {userData.subscription.remainingDays} days
                  </p>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/dashboard/subscription"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/20 transition-colors"
          >
            {isSubscriptionActive ? 'Manage' : 'View Details'}
          </Link>
        </motion.div>

        {/* MT5 Account Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {userData?.mt5?.isConnected ? (
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-500/20">
                  <Zap className="h-5 w-5 text-green-400" />
                </div>
              ) : (
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-500/20">
                  <ShieldCheck className="h-5 w-5 text-orange-400" />
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  MT5 Account
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {userData?.mt5?.isConnected ? 'Connected' : 'Not Connected'}
                </p>
              </div>
            </div>
          </div>

          {userData?.mt5?.isConnected && userData?.mt5?.loginId && (
            <div className="mt-4 space-y-2 border-t border-white/[0.1] pt-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">Login ID</p>
                <p className="text-sm font-medium font-mono text-green-400">{userData.mt5.loginId}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">Server</p>
                <p className="text-sm font-medium text-green-400">{userData.mt5.brokerServer}</p>
              </div>
            </div>
          )}

          <Link
            href={mt5ActionHref}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/20 transition-colors"
          >
            {userData?.mt5?.isConnected ? 'Update' : isSubscriptionActive ? 'Connect' : 'Set Up Subscription'}
          </Link>
        </motion.div>
      </div>

      {/* Quick Action Suggestions */}
      {(!isSubscriptionActive || !userData?.mt5?.isConnected) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-6 backdrop-blur-xl"
        >
          <h3 className="font-semibold text-white mb-4">Next Steps</h3>
          <div className="space-y-3">
            {!isSubscriptionActive && (
              <Link
                href="/dashboard/subscription"
                className="block p-3 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/10 transition-colors text-cyan-300"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">Activate your subscription to get started</span>
                </div>
              </Link>
            )}
            {isSubscriptionActive && !userData?.mt5?.isConnected && (
              <Link
                href="/dashboard/mt5"
                className="block p-3 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/10 transition-colors text-cyan-300"
              >
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">Connect your MT5 account to start trading</span>
                </div>
              </Link>
            )}
            {isSubscriptionActive && userData?.mt5?.isConnected && (
              <Link
                href="/dashboard/bots"
                className="block p-3 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/10 transition-colors text-cyan-300"
              >
                <div className="flex items-center gap-3">
                  <TimerReset className="h-4 w-4" />
                  <span className="text-sm">Configure your trading bots</span>
                </div>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
