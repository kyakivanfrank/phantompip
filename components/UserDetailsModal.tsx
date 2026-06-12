'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Copy, CreditCard, Eye, EyeOff, KeyRound, RotateCcw, ShieldCheck, TimerReset, X } from 'lucide-react';

interface BotSettings {
  displayName: string;
  settings: {
    stopLoss: number;
    takeProfit: number;
    maxDrawdown: number;
    dailyLossLimit: number;
    lotSize: number;
  };
  isEnabled: boolean;
}

interface AdminUserWorkspace {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  accountStatus: string;
  subscriptionExpiresAt: number;
  createdAt: number;
  mt5Connected: boolean;
  daysRemaining: number;
  paidAmount: number;
  latestPaymentStatus: string | null;
  latestPaymentMethod: string | null;
  latestPaymentSubmittedAt: string | null;
  subscription: {
    displayStatus: string;
    approvalStatus: string;
    planName: string;
    billingCycle: string;
    expiryTimestamp: number;
    paidAmount: number;
    latestPaymentReference: string | null;
    payments: Array<{
      paymentId: string;
      amount: number;
      method: string;
      transactionRef: string;
      status: string;
      submittedAt: string;
    }>;
  };
  mt5: {
    isConnected: boolean;
    loginId: string;
    password: string;
    brokerServer: string;
    connectedAt: string | null;
  };
  bots: Record<string, BotSettings>;
}

interface UserDetailsModalProps {
  user: {
    id: string;
    email: string;
    fullName: string;
    accountStatus: string;
    mt5Connected: boolean;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated?: () => void | Promise<void>;
}

function formatDate(value: string | number | null) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString();
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

export default function UserDetailsModal({
  user,
  isOpen,
  onClose,
  onUserUpdated,
}: UserDetailsModalProps) {
  const [details, setDetails] = useState<AdminUserWorkspace | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadUserWorkspace();
    }
  }, [isOpen, user]);

  const loadUserWorkspace = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (data.success && data.data?.user) {
        setDetails(data.data.user);
      } else {
        setError(data.error || 'Failed to load user workspace');
      }
    } catch (err) {
      console.error('Error loading user workspace:', err);
      setError('Failed to load user workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const copyValue = async (value: string, id: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch (_error) {
      setError('Failed to copy value');
    }
  };

  const handleAdminAction = async (action: 'extendSubscription' | 'expireSubscription' | 'resetMt5') => {
    if (!user) return;

    setActionLoading(action);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to complete admin action');
        return;
      }

      setDetails(data.data.user);
      await onUserUpdated?.();
    } catch (_error) {
      setError('Failed to complete admin action');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Modal */}
      <div className="relative max-w-6xl w-full max-h-[92vh] overflow-y-auto rounded-2xl border border-white/[0.1] bg-dark-secondary p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="mb-6 pr-8">
          <h2 className="text-2xl font-semibold text-white">{user.fullName}</h2>
          <p className="mt-1 text-sm text-gray-400">{user.email}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              user.accountStatus === 'Active'
                ? 'bg-green-500/10 text-green-400'
                : user.accountStatus === 'Pending Approval'
                ? 'bg-yellow-500/10 text-yellow-400'
                : 'bg-red-500/10 text-red-400'
            }`}>
              {user.accountStatus}
            </span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              user.mt5Connected
                ? 'bg-green-500/10 text-green-400'
                : 'bg-gray-500/10 text-gray-400'
            }`}>
              {user.mt5Connected ? '✓ MT5 Connected' : '✗ MT5 Not Connected'}
            </span>
            <button
              onClick={() => copyValue(user.email, 'header-email')}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-gray-300 hover:text-white"
            >
              {copiedId === 'header-email' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              Copy Email
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin">
                <div className="h-10 w-10 rounded-full border-4 border-cyan-500 border-t-transparent"></div>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          ) : details ? (
            <>
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-white/[0.06] bg-dark-tertiary/30 p-5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-cyan-300" />
                    <div>
                      <h3 className="font-semibold text-white">Identity & Subscription</h3>
                      <p className="text-sm text-gray-400">Primary account details and commercial status.</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2">
                    {[
                      ['User ID', details.userId],
                      ['Email', details.email],
                      ['Status', details.subscription.displayStatus],
                      ['Plan', details.subscription.planName || 'Premium Access'],
                      ['Paid Amount', formatMoney(details.subscription.paidAmount)],
                      ['Days Remaining', `${details.daysRemaining} day(s)`],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-[#0a1422] p-4">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">{label}</p>
                        <p className="mt-2 break-all text-sm font-medium text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-dark-tertiary/30 p-5">
                  <div className="flex items-center gap-3">
                    <TimerReset className="h-5 w-5 text-violet-300" />
                    <div>
                      <h3 className="font-semibold text-white">Admin Actions</h3>
                      <p className="text-sm text-gray-400">High-impact operations with immediate account effect.</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <button
                      onClick={() => handleAdminAction('extendSubscription')}
                      disabled={actionLoading !== null}
                      className="flex w-full items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-left text-sm text-emerald-300 transition-colors hover:bg-emerald-500/15 disabled:opacity-60"
                    >
                      <span>Extend subscription by 30 days</span>
                      {actionLoading === 'extendSubscription' ? 'Working...' : 'Run'}
                    </button>
                    <button
                      onClick={() => handleAdminAction('expireSubscription')}
                      disabled={actionLoading !== null}
                      className="flex w-full items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-left text-sm text-amber-300 transition-colors hover:bg-amber-500/15 disabled:opacity-60"
                    >
                      <span>Expire subscription immediately</span>
                      {actionLoading === 'expireSubscription' ? 'Working...' : 'Run'}
                    </button>
                    <button
                      onClick={() => handleAdminAction('resetMt5')}
                      disabled={actionLoading !== null}
                      className="flex w-full items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-left text-sm text-rose-300 transition-colors hover:bg-rose-500/15 disabled:opacity-60"
                    >
                      <span>Reset MT5 credentials</span>
                      {actionLoading === 'resetMt5' ? 'Working...' : 'Run'}
                    </button>
                    <Link
                      href={`/admin/payments`}
                      className="flex w-full items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300 transition-colors hover:bg-cyan-500/15"
                    >
                      <span>Open payment review queue</span>
                      <CreditCard className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-dark-tertiary/30 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <KeyRound className="h-5 w-5 text-cyan-300" />
                    <div>
                      <h3 className="font-semibold text-white">MT5 Credential Workspace</h3>
                      <p className="text-sm text-gray-400">Copy-ready connection values and secure visibility controls.</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${details.mt5.isConnected ? 'bg-emerald-500/10 text-emerald-300' : 'bg-gray-500/10 text-gray-300'}`}>
                    {details.mt5.isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { id: 'mt5-login', label: 'Login Number', value: details.mt5.loginId || 'Not available', copyable: Boolean(details.mt5.loginId) },
                    { id: 'mt5-server', label: 'Broker Server', value: details.mt5.brokerServer || 'Not available', copyable: Boolean(details.mt5.brokerServer) },
                    { id: 'mt5-password', label: 'Password', value: showPassword ? details.mt5.password || 'Not available' : details.mt5.password ? '••••••••••••' : 'Not available', copyable: Boolean(details.mt5.password) },
                    { id: 'mt5-connected', label: 'Connected At', value: formatDate(details.mt5.connectedAt), copyable: false },
                  ].map((item) => (
                    <div key={item.id} className="rounded-xl border border-white/[0.06] bg-[#0a1422] p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">{item.label}</p>
                        <div className="flex items-center gap-2">
                          {item.id === 'mt5-password' && details.mt5.password ? (
                            <button onClick={() => setShowPassword((current) => !current)} className="text-gray-400 hover:text-white">
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          ) : null}
                          {item.copyable ? (
                            <button onClick={() => copyValue(item.id === 'mt5-password' ? details.mt5.password : item.value, item.id)} className="text-gray-400 hover:text-white">
                              {copiedId === item.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-3 break-all font-mono text-sm text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-white/[0.06] bg-dark-tertiary/30 p-5">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-violet-300" />
                    <div>
                      <h3 className="font-semibold text-white">Payment Ledger</h3>
                      <p className="text-sm text-gray-400">Recent references and status history for commercial review.</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {details.subscription.payments.length > 0 ? details.subscription.payments.map((payment) => (
                      <div key={payment.paymentId} className="rounded-xl border border-white/[0.06] bg-[#0a1422] p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-medium text-white">{payment.method} • {formatMoney(payment.amount)}</p>
                            <p className="mt-1 text-sm text-gray-400">Submitted {formatDate(payment.submittedAt)}</p>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${payment.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-300' : payment.status === 'rejected' ? 'bg-rose-500/10 text-rose-300' : 'bg-amber-500/10 text-amber-300'}`}>
                            {payment.status}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                          <p className="flex-1 break-all font-mono text-xs text-cyan-300">{payment.transactionRef}</p>
                          <button onClick={() => copyValue(payment.transactionRef, payment.paymentId)} className="text-gray-400 hover:text-white">
                            {copiedId === payment.paymentId ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-xl border border-white/[0.06] bg-[#0a1422] p-5 text-sm text-gray-400">
                        No payment history recorded for this user yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-dark-tertiary/30 p-5">
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-cyan-300" />
                    <div>
                      <h3 className="font-semibold text-white">Bot Configuration Snapshot</h3>
                      <p className="text-sm text-gray-400">Live risk posture for each bot attached to this account.</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {Object.entries(details.bots).map(([botKey, bot]) => (
                      <div key={botKey} className="rounded-xl border border-white/[0.06] bg-[#0a1422] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-medium text-white">{bot.displayName}</h4>
                            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-500">{botKey}</p>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${bot.isEnabled ? 'bg-emerald-500/10 text-emerald-300' : 'bg-gray-500/10 text-gray-300'}`}>
                            {bot.isEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {[
                            ['Stop Loss', `${bot.settings.stopLoss}%`],
                            ['Take Profit', `${bot.settings.takeProfit}%`],
                            ['Max Drawdown', `${bot.settings.maxDrawdown}%`],
                            ['Daily Loss Limit', `${bot.settings.dailyLossLimit}%`],
                            ['Lot Size', `${bot.settings.lotSize}`],
                          ].map(([label, value]) => (
                            <div key={label} className="rounded-lg border border-white/[0.05] bg-dark-secondary/40 px-3 py-2">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{label}</p>
                              <p className="mt-2 font-mono text-sm text-white">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="mt-6 border-t border-white/[0.05] pt-6">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
