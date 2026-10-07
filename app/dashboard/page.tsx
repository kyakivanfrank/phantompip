'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Clock,
  ShieldCheck,
  Activity,
  UserCircle,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Plug,
  Check,
  Lock,
  Eye,
  EyeOff,
  Zap,
  Pencil
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
    password?: string;
    brokerServer: string;
    connectedAt: string | null;
  };
};

export default function DashboardPage() {
  const [userData, setUserData] = useState<DashboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // MT5 state
  const [formData, setFormData] = useState({
    mt5LoginId: '',
    mt5Password: '',
    brokerServer: '',
  });
  const [isEditingMt5, setIsEditingMt5] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [botRunning, setBotRunning] = useState(true);
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [isMt5Loading, setIsMt5Loading] = useState(false);
  const [mt5Success, setMt5Success] = useState(false);
  const [mt5Error, setMt5Error] = useState('');
  const [showWarningOverlay, setShowWarningOverlay] = useState(false);

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

  const handleMt5Change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const isSubscriptionActive = userData?.subscription?.isActive === true;

  const handleMt5Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSubscriptionActive) {
      // User must be subscribed
      window.location.href = '/dashboard/activate';
      return;
    }

    setIsMt5Loading(true);
    setMt5Error('');

    try {
      const res = await fetch('/api/mt5/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMt5Success(true);
        // Update user data locally
        if (userData) {
          setUserData({
            ...userData,
            mt5: {
              isConnected: true,
              loginId: formData.mt5LoginId,
              password: formData.mt5Password,
              brokerServer: formData.brokerServer,
              connectedAt: new Date().toISOString(),
            }
          });
        }
        setFormData({
          mt5LoginId: '',
          mt5Password: '',
          brokerServer: '',
        });
        setTimeout(() => setMt5Success(false), 5000);
      } else {
        if (res.status === 403 && data?.details?.redirectTo) {
          window.location.href = data.details.redirectTo;
          return;
        }
        setMt5Error(data.error || 'Failed to update bot');
      }
    } catch (_err) {
      setMt5Error('Error activating bot');
    } finally {
      setIsMt5Loading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  const isPending = userData?.subscription?.latestPaymentStatus === 'pending';
  const hasMt5 = userData?.mt5?.isConnected && userData?.mt5?.loginId;

  const hasActivePlan = userData?.subscription?.status === 'active' && userData?.subscription?.approvalStatus === 'approved' && userData?.subscription?.remainingDays > 0;
  const displayBillingCycle = hasActivePlan ? userData?.subscription?.billingCycle : 'N/A';
  const displayPaidAmount = hasActivePlan ? userData?.subscription?.paidAmount : null;
  const displayExpiryDate = hasActivePlan ? (userData?.subscription?.billingCycle === 'lifetime' ? 'Lifetime' : userData?.subscription?.expiryDate) : 'N/A';
  const displayRemainingDays = hasActivePlan ? (userData?.subscription?.billingCycle === 'lifetime' ? Infinity : (userData?.subscription?.remainingDays ?? 0)) : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* 1. Personalized Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.1] pb-6"
      >
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
            <UserCircle className="h-8 w-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white">
              {userData?.username ? userData.username : 'Trader'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">{userData?.email}</p>
          </div>
        </div>

        {/* Master Account Status Badge */}
        <div className="flex items-center gap-2">
          {isPending ? (
            <span className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium">
              <Clock className="h-4 w-4" /> Awaiting Payment Approval
            </span>
          ) : isSubscriptionActive ? (
            <span className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" /> Premium Access Active
            </span>
          ) : (
            <span className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-medium">
              <ShieldCheck className="h-4 w-4" /> Subscription Required
            </span>
          )}
        </div>
      </motion.div>


      <div className="grid gap-8 md:grid-cols-12">

        {/* 2. Personal Board (Subscription & Info Panel) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-6 space-y-6"
        >
          <div>
            <h2 className="text-lg font-medium text-white mb-4">Account Overview</h2>

            <div className="bg-dark-secondary/20 border border-white/[0.05] rounded-2xl p-6 space-y-6">
              {userData?.subscription ? (
                <>
                  <div className="grid grid-cols-2 gap-6">

                    <div className="col-span-2 flex flex-col justify-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Billing Cycle</p>
                      <p className="text-base font-medium text-white capitalize">{displayBillingCycle}</p>

                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 mt-4">
                        {displayBillingCycle === 'lifetime' ? 'One-time Payment' : 'Monthly Payment'}
                      </p>
                      <p className="text-base font-medium text-white capitalize">
                        {displayPaidAmount !== null ? `$${displayPaidAmount}${displayBillingCycle === 'lifetime' ? '' : '/mo'}` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="h-px w-full bg-white/[0.05]" />

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Expiry Date</p>
                      <p className="text-base font-medium text-white flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gray-400" /> {displayExpiryDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Time Remaining</p>
                      <p className={`text-base font-medium ${displayRemainingDays === Infinity || displayRemainingDays > 7 ? 'text-green-400' :
                          (displayRemainingDays > 0 ? 'text-yellow-400' : 'text-gray-400')
                        }`}>
                        {displayRemainingDays === Infinity ? 'Forever' : (displayRemainingDays > 0 ? `${displayRemainingDays} Days` : '0 Days')}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">No subscription record found. Please activate your account.</p>
              )}

              <div className="pt-2">
                <span className="text-sm text-cyan-400 font-medium flex items-center gap-1">
                  Active Subscription
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3. Live Trading Engine Card (MT5) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-6"
        >
          <h2 className="text-lg font-medium text-white mb-4">Trading Engine</h2>

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl">
            {/* Background glowing effect if active */}
            {hasMt5 && (
              <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-green-500/10 blur-3xl pointer-events-none" />
            )}

            <div className="relative z-10 space-y-6">

              {/* Header / Status */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium text-white">MT5 Connection</h3>
                  {hasMt5 ? (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-400 font-medium">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      System is actively trading
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-400">Engine currently offline</p>
                  )}
                </div>
                <Activity className={`h-6 w-6 ${hasMt5 ? 'text-green-400' : 'text-gray-500'}`} />
              </div>

              {/* Existing Credentials Display */}
              {hasMt5 && (
                <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 backdrop-blur-xl">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Login ID */}
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Login ID</p>
                      <div className="rounded-lg border border-green-500/20 bg-dark-tertiary/50 px-3 py-2 font-mono text-sm text-green-400">
                        {userData?.mt5?.loginId}
                      </div>
                    </div>

                    {/* Broker Server */}
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Broker Server</p>
                      <div className="rounded-lg border border-green-500/20 bg-dark-tertiary/50 px-3 py-2 font-mono text-sm text-green-400">
                        {userData?.mt5?.brokerServer}
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Password</p>
                      <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-dark-tertiary/50 px-3 py-2">
                        <span className="flex-1 font-mono text-sm text-green-400 truncate">
                          {showPassword ? (userData?.mt5?.password || '••••••••') : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-green-400 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Connected Since */}
                    {userData?.mt5?.connectedAt && (
                      <div>
                        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Connected Since</p>
                        <div className="rounded-lg border border-green-500/20 bg-dark-tertiary/50 px-3 py-2 text-sm text-green-400">
                          {new Date(userData.mt5.connectedAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bot Controls */}
                  <div className="mt-4 pt-4 border-t border-green-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-1">Bot Engine Status</h4>
                      <p className="text-xs text-green-400/80">
                        {botRunning ? 'Engine is actively trading on this account.' : 'Engine is currently paused.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsEditingMt5(!isEditingMt5)}
                        disabled={botRunning}
                        title={botRunning ? "Stop the bot to edit credentials" : "Edit Credentials"}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          botRunning 
                            ? 'border-white/5 text-gray-500 cursor-not-allowed bg-transparent' 
                            : 'border-white/10 text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        {isEditingMt5 ? 'Cancel' : <Pencil className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setBotRunning(!botRunning);
                          if (!botRunning) setIsEditingMt5(false);
                        }}
                      className={`relative flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold shadow-lg transition-all active:scale-95 ${
                        botRunning 
                          ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' 
                          : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20'
                      }`}
                    >
                      {botRunning ? (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                          Stop Bot
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Start Bot
                        </>
                      )}
                    </button>
                    </div>
                  </div>
                </div>
              )}

              {(!hasMt5 || isEditingMt5) && (
                <>
                  {/* Form Section Header */}
                  <div className="border-t border-white/[0.1] pt-6">
                <h3 className="text-sm font-semibold text-white mb-4">
                  {hasMt5 ? 'Update Credentials' : 'Add MT5 Credentials'}
                </h3>
              </div>

              {/* Form Container with Relative Positioning */}
              <div className="relative">
                {/* Conditional Intercept Layer & Glassmorphic Box */}
                {!isSubscriptionActive && (
                  <div
                    className={`absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl transition-all duration-500 ${showWarningOverlay
                      ? 'border border-white/[0.15] bg-slate-900/70 p-6 text-center backdrop-blur-md'
                      : 'cursor-pointer bg-transparent'
                      }`}
                    onClick={() => {
                      if (!showWarningOverlay) setShowWarningOverlay(true);
                    }}
                  >
                    <AnimatePresence>
                      {showWarningOverlay && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex flex-col items-center"
                        >
                          <Lock className="mb-4 h-12 w-12 text-cyan-400 drop-shadow-lg" />
                          <h3 className="mb-2 text-xl font-semibold text-white">Subscription Required</h3>
                          <p className="mb-2 max-w-sm text-sm text-gray-300">
                            Activate your subscription to activate trading automation on your MT5 account.
                          </p>
                          <Link
                            href="/dashboard/activate"
                            className="rounded-lg bg-cyan-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.3)] mt-2 inline-block"
                          >
                            Activate Account
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Success Message */}
                {mt5Success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 mb-4"
                  >
                    <div className="flex gap-3">
                      <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-400">Connected Successfully</p>
                        <p className="text-sm text-gray-400">
                          Your MT5 account has been securely connected. Your credentials are now encrypted and stored.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {mt5Error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 mb-4"
                  >
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-400">Connection Failed</p>
                        <p className="text-sm text-gray-400">{mt5Error}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Form */}
                <form
                  onSubmit={handleMt5Submit}
                  className={`space-y-4 transition-all duration-500 ${(!isSubscriptionActive && showWarningOverlay) ? 'pointer-events-none opacity-30 select-none blur-[2px]' : ''
                    }`}
                >
                  {/* MT5 Login ID */}
                  <div>
                    <label htmlFor="mt5LoginId" className="block text-sm font-medium text-gray-300">
                      MT5 Login ID
                    </label>
                    <input
                      type="text"
                      id="mt5LoginId"
                      name="mt5LoginId"
                      value={formData.mt5LoginId}
                      onChange={handleMt5Change}
                      placeholder="e.g., 1234567"
                      required
                      tabIndex={!isSubscriptionActive ? -1 : 0}
                      className="mt-2 w-full rounded-lg border border-white/[0.1] bg-dark-tertiary/50 px-4 py-2.5 text-white placeholder:text-gray-500 outline-none focus:border-cyan-500/50 transition-colors"
                    />
                    <p className="mt-1 text-xs text-gray-400">Your MT5 account number</p>
                  </div>

                  {/* MT5 Password */}
                  <div>
                    <label htmlFor="mt5Password" className="block text-sm font-medium text-gray-300">
                      MT5 Password
                    </label>
                    <div className="relative mt-2">
                      <input
                        type={showFormPassword ? 'text' : 'password'}
                        id="mt5Password"
                        name="mt5Password"
                        value={formData.mt5Password}
                        onChange={handleMt5Change}
                        placeholder="••••••••••"
                        required
                        tabIndex={!isSubscriptionActive ? -1 : 0}
                        className="w-full rounded-lg border border-white/[0.1] bg-dark-tertiary/50 pl-4 pr-12 py-2.5 text-white placeholder:text-gray-500 outline-none focus:border-cyan-500/50 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        tabIndex={!isSubscriptionActive ? -1 : 0}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1 text-gray-400 hover:text-cyan-400 transition-colors"
                      >
                        {showFormPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">Your MT5 trading password</p>
                  </div>

                  {/* Broker Server */}
                  <div>
                    <label htmlFor="brokerServer" className="block text-sm font-medium text-gray-300">
                      Broker Server
                    </label>
                    <input
                      type="text"
                      id="brokerServer"
                      name="brokerServer"
                      value={formData.brokerServer}
                      onChange={handleMt5Change}
                      placeholder="e.g., ICMarketsSC-Demo"
                      required
                      tabIndex={!isSubscriptionActive ? -1 : 0}
                      className="mt-2 w-full rounded-lg border border-white/[0.1] bg-dark-tertiary/50 px-4 py-2.5 text-white placeholder:text-gray-500 outline-none focus:border-cyan-500/50 transition-colors"
                    />
                    <p className="mt-1 text-xs text-gray-400">Your broker's MT5 server name</p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isMt5Loading || !isSubscriptionActive}
                    tabIndex={!isSubscriptionActive ? -1 : 0}
                    className="mt-6 w-full rounded-lg bg-cyan-500 px-4 py-2.5 font-medium text-white hover:bg-cyan-600 transition-colors disabled:opacity-50"
                  >
                    {isMt5Loading ? (
                      <span className="inline-flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                        Connecting...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <Plug className="h-4 w-4" />
                        {hasMt5 ? 'Update Credentials' : 'update bot'}
                      </span>
                    )}
                  </button>
                </form>
              </div>

              {/* Help Section Below Form */}
              <div className="mt-8 rounded-xl border border-white/[0.1] bg-dark-secondary/20 p-5">
                <h3 className="font-semibold text-white mb-4">How to find your credentials</h3>
                <ol className="space-y-3 text-sm text-gray-400">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-medium">1</span>
                    <span>Open MetaTrader 5 and go to <strong className="text-white">File → Account Settings</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-medium">2</span>
                    <span>Find your <strong className="text-white">Login ID</strong> (account number) and <strong className="text-white">Server</strong> name</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-medium">3</span>
                    <span>Use your <strong className="text-white">trading password</strong> (not your investor password)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-medium">4</span>
                    <span>Enter the details above and click <strong className="text-white">update bot</strong></span>
                  </li>
                </ol>
              </div>
              </>
            )}

            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
