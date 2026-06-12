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
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          Trader Control Centre
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-2">
            <h1 className="text-lg font-semibold text-white">Welcome back,</h1>
            <h1 className="text-3xl font-semibold text-white">{userData?.username}</h1>
            <p className="max-w-2xl text-gray-400">
              Monitor your premium status, MT5 trading channel, and account readiness from one trader-focused workspace.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.18),_transparent_45%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(17,24,39,0.75))] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Account Posture</p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Subscription</p>
                <p className="mt-1 text-xl font-semibold text-white">{subscriptionLabel}</p>
              </div>
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${isSubscriptionActive ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                <span className={`size-2 rounded-full ${isSubscriptionActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {isSubscriptionActive ? 'Premium' : 'Action Needed'}
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              {isSubscriptionActive
                ? `${userData?.subscription?.remainingDays ?? 0} day(s) remain before renewal.`
                : 'Subscription activation is required before MT5 credentials can be stored.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Status Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            label: 'Subscription Status',
            value: subscriptionLabel,
            hint: userData?.subscription?.approvalStatus === 'pending' ? 'Awaiting internal approval' : 'Verified against account record',
            icon: ShieldCheck,
            tone: isSubscriptionActive ? 'text-emerald-300' : 'text-amber-300',
          },
          {
            label: 'Paid Amount',
            value: formatMoney(userData?.subscription?.paidAmount ?? 0),
            hint: userData?.subscription?.latestPaymentMethod ?? 'No confirmed payment yet',
            icon: BadgeDollarSign,
            tone: 'text-cyan-300',
          },
          {
            label: 'Days Remaining',
            value: `${userData?.subscription?.remainingDays ?? 0} days`,
            hint: `Expires ${formatDate(userData?.subscription?.expiryTimestamp ?? null)}`,
            icon: TimerReset,
            tone: 'text-violet-300',
          },
          {
            label: 'MT5 Channel',
            value: userData?.mt5?.isConnected ? 'Connected' : 'Not Connected',
            hint: userData?.mt5?.brokerServer || 'No broker server linked yet',
            icon: Zap,
            tone: userData?.mt5?.isConnected ? 'text-emerald-300' : 'text-gray-300',
          },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/[0.08] bg-dark-secondary/50 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{card.label}</p>
              <card.icon className={`h-4 w-4 ${card.tone}`} />
            </div>
            <p className="mt-4 text-2xl font-semibold text-white">{card.value}</p>
            <p className="mt-2 text-sm text-gray-400">{card.hint}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 md:grid-cols-2"
      >
        {/* Connect MT5 Card */}
        {showConnectMt5 ? (
          <Link
            href={mt5ActionHref}
            className="group rounded-2xl border border-cyan-500/20 bg-[linear-gradient(135deg,rgba(6,182,212,0.14),rgba(8,145,178,0.05))] p-6 transition-all hover:border-cyan-500/40 hover:bg-cyan-500/10"
          >
            <div className="flex items-center gap-4">
              <Zap className="h-8 w-8 text-cyan-400" />
              <div>
                <h3 className="font-semibold text-white">{isSubscriptionActive ? 'Connect MT5 Account' : 'Activate Subscription First'}</h3>
                <p className="text-sm text-gray-400">
                  {isSubscriptionActive
                    ? 'Link your MetaTrader 5 credentials and push your channel live.'
                    : 'MT5 credential storage is locked until premium access is approved.'}
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="rounded-2xl border border-emerald-500/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(5,150,105,0.05))] p-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <div>
                <h3 className="font-semibold text-white">MT5 Connected</h3>
                <p className="text-sm text-gray-400">
                  Trading channel live on {userData?.mt5?.brokerServer || 'your linked server'}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Card */}
        {!isSubscriptionActive ? (
          <Link
            href="/dashboard/subscription"
            className="group rounded-2xl border border-violet-500/20 bg-[linear-gradient(135deg,rgba(168,85,247,0.16),rgba(109,40,217,0.06))] p-6 transition-all hover:border-violet-500/40 hover:bg-violet-500/10"
          >
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-purple-400" />
              <div>
                <h3 className="font-semibold text-white">Activate Subscription</h3>
                <p className="text-sm text-gray-400">
                  Submit and verify payment to unlock premium execution and MT5 onboarding.
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="rounded-2xl border border-violet-500/20 bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(76,29,149,0.06))] p-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-purple-400" />
              <div>
                <h3 className="font-semibold text-white">Subscription Active</h3>
                <p className="text-sm text-gray-400">
                  Premium access runs until {formatDate(userData?.subscription?.expiryTimestamp ?? null)}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {userData?.mt5?.isConnected ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="rounded-2xl border border-white/[0.08] bg-dark-secondary/50 p-6 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">MT5 Trading Channel</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Connected Account Credentials</h3>
              <p className="mt-1 text-sm text-gray-400">Verified trading channel details currently attached to your premium account.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-400" />
              Live Channel
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07111f]">
            <div className="grid gap-px bg-white/[0.06] md:grid-cols-3">
              {[
                { label: 'Login Number', value: userData.mt5.loginId || 'Not available' },
                { label: 'Broker Server', value: userData.mt5.brokerServer || 'Not available' },
                { label: 'Connected Since', value: formatDate(userData.mt5.connectedAt) },
              ].map((item) => (
                <div key={item.label} className="bg-[#081624] p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-300/65">{item.label}</p>
                  <p className="mt-3 break-all font-mono text-base text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="rounded-2xl border border-white/[0.08] bg-dark-secondary/50 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-violet-300" />
            <div>
              <h3 className="font-semibold text-white">Subscription Ledger</h3>
              <p className="text-sm text-gray-400">Commercial status, payment clearance, and renewal visibility.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] md:grid-cols-2">
            {[
              ['Plan', userData?.subscription?.planName || 'Premium Access'],
              ['Billing Cycle', userData?.subscription?.billingCycle || 'monthly'],
              ['Payment Cleared', formatMoney(userData?.subscription?.paidAmount ?? 0)],
              ['Approval Status', userData?.subscription?.approvalStatus || 'pending'],
              ['Latest Payment', userData?.subscription?.latestPaymentMethod || 'No payment submitted'],
              ['Expiry Date', formatDate(userData?.subscription?.expiryTimestamp ?? null)],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#0a1422] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">{label}</p>
                <p className="mt-2 text-sm font-medium text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-dark-secondary/50 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-5 w-5 text-cyan-300" />
            <div>
              <h3 className="font-semibold text-white">Operational Checklist</h3>
              <p className="text-sm text-gray-400">What must be true before the system can trade on your behalf.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            {[
              {
                title: 'Premium subscription approved',
                done: isSubscriptionActive,
                detail: isSubscriptionActive ? 'Your premium access is active.' : 'Go to Subscription and complete payment approval.',
              },
              {
                title: 'MT5 credentials connected',
                done: userData?.mt5?.isConnected === true,
                detail: userData?.mt5?.isConnected ? 'Trading channel is already linked.' : 'Link your MT5 login, password, and broker server.',
              },
              {
                title: 'Bots ready to route orders',
                done: isSubscriptionActive && userData?.mt5?.isConnected === true,
                detail: isSubscriptionActive && userData?.mt5?.isConnected
                  ? 'Your trading workspace is ready for live bot configuration.'
                  : 'Complete both premium activation and MT5 connection first.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-white/[0.06] bg-[#0a1422] p-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${item.done ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-gray-400">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
              <strong className="text-white">Activate subscription first</strong> - Premium approval must be active before MT5 credentials can be saved
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-medium">2</span>
            <span>
              <strong className="text-white">Connect your MT5 account</strong> - Once approved, link your login number and broker server
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-medium">3</span>
            <span>
              <strong className="text-white">Review bot account mapping</strong> - Confirm each bot is attached to the connected MT5 channel
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-medium">4</span>
            <span>
              <strong className="text-white">Start trading</strong> - Premium status plus MT5 connection unlock live execution readiness
            </span>
          </li>
        </ol>
      </motion.div>

    </div>
  );
}
