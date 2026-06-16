'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plug, Check, AlertCircle, Lock, Eye, EyeOff, Zap } from 'lucide-react';

interface ExistingCredentials {
  loginId: string;
  password: string;
  brokerServer: string;
  connectedAt: number | null;
}

export default function Mt5Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    mt5LoginId: '',
    mt5Password: '',
    brokerServer: '',
    tradingStyle: 'Conservative',
  });

  const [existingCredentials, setExistingCredentials] = useState<ExistingCredentials | null>(null);
  
  // State for the existing connection credentials card
  const [showPassword, setShowPassword] = useState(false);
  
  // State for the new credential submission form field
  const [showFormPassword, setShowFormPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [canConnect, setCanConnect] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showWarningOverlay, setShowWarningOverlay] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        });

        const data = await response.json();
        const isActive = data?.data?.user?.subscription?.isActive === true;
        setCanConnect(isActive);

        // Fetch existing credentials
        if (isActive || data?.data?.user?.mt5?.isConnected) {
          const mt5 = data?.data?.user?.mt5;
          if (mt5 && mt5.isConnected && mt5.loginId) {
            setExistingCredentials({
              loginId: mt5.loginId,
              password: mt5.password || '',
              brokerServer: mt5.brokerServer || '',
              connectedAt: mt5.connectedAt || null,
            });
          }
        }
      } catch (_error) {
        setError('Unable to verify subscription status');
        setCanConnect(false);
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkAccess();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canConnect) {
      router.replace('/dashboard/subscription');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/mt5/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Update existing credentials
        setExistingCredentials({
          loginId: formData.mt5LoginId,
          password: formData.mt5Password,
          brokerServer: formData.brokerServer,
          connectedAt: Date.now(),
        });
        setFormData({
          mt5LoginId: '',
          mt5Password: '',
          brokerServer: '',
          tradingStyle: 'Conservative',
        });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        if (res.status === 403 && data?.details?.redirectTo) {
          router.replace(data.details.redirectTo);
          return;
        }
        setError(data.error || 'Failed to connect MT5 account');
      }
    } catch (_err) {
      setError('Error connecting to MT5 account');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin">
          <div className="h-10 w-10 rounded-full border-4 border-cyan-500 border-t-transparent"></div>
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
        <div className="flex items-center gap-3">
          <Plug className="h-8 w-8 text-cyan-400" />
          <h1 className="text-3xl font-semibold text-white">MT5 Account Management</h1>
        </div>
        <p className="text-gray-400">
          Manage your MetaTrader 5 credentials securely
        </p>
      </motion.div>

      {/* Existing Credentials Display */}
      {existingCredentials && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-green-500/20 bg-green-500/10 p-6 backdrop-blur-xl"
        >
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-500/20">
              <Zap className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-4">Active MT5 Connection</h3>

              {/* Credentials Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Login ID */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Login ID</p>
                  <div className="rounded-lg border border-green-500/20 bg-dark-tertiary/50 px-3 py-2 font-mono text-sm text-green-400">
                    {existingCredentials.loginId}
                  </div>
                </div>

                {/* Broker Server */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Broker Server</p>
                  <div className="rounded-lg border border-green-500/20 bg-dark-tertiary/50 px-3 py-2 font-mono text-sm text-green-400">
                    {existingCredentials.brokerServer}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Password</p>
                  <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-dark-tertiary/50 px-3 py-2">
                    <span className="flex-1 font-mono text-sm text-green-400">
                      {showPassword ? existingCredentials.password : '•'.repeat(10)}
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
                {existingCredentials.connectedAt && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Connected Since</p>
                    <div className="rounded-lg border border-green-500/20 bg-dark-tertiary/50 px-3 py-2 text-sm text-green-400">
                      {new Date(existingCredentials.connectedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-green-500/20 bg-green-500/5 p-4"
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
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-red-500/20 bg-red-500/5 p-4"
          >
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-400">Connection Failed</p>
                <p className="text-sm text-gray-400">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form Section Header */}
        {existingCredentials && (
          <div className="border-t border-white/[0.1] pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Update Credentials</h3>
          </div>
        )}

        {/* Form Container with Relative Positioning */}
        <div className="relative">
          {/* Conditional Intercept Layer & Glassmorphic Box */}
          {!canConnect && !existingCredentials && (
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
                    <p className="mb-6 max-w-sm text-sm text-gray-300">
                      First make your subscription payment or contact support to approve your subscription to proceed on MT5.
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.replace('/dashboard/subscription');
                      }}
                      className="rounded-lg bg-cyan-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    >
                      Go to Subscription
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className={`rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 transition-all duration-500 ${(!canConnect && !existingCredentials && showWarningOverlay) ? 'pointer-events-none opacity-30 select-none blur-[2px]' : 'backdrop-blur-xl'
              }`}
          >
            <div className="space-y-4">
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
                  onChange={handleChange}
                  placeholder="e.g., 1234567"
                  required
                  tabIndex={!canConnect && !existingCredentials ? -1 : 0}
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
                    onChange={handleChange}
                    placeholder="••••••••••"
                    required
                    tabIndex={!canConnect && !existingCredentials ? -1 : 0}
                    className="w-full rounded-lg border border-white/[0.1] bg-dark-tertiary/50 pl-4 pr-12 py-2.5 text-white placeholder:text-gray-500 outline-none focus:border-cyan-500/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    tabIndex={!canConnect && !existingCredentials ? -1 : 0}
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
                  onChange={handleChange}
                  placeholder="e.g., ICMarketsSC-Demo or ICMarketsSC-Live"
                  required
                  tabIndex={!canConnect && !existingCredentials ? -1 : 0}
                  className="mt-2 w-full rounded-lg border border-white/[0.1] bg-dark-tertiary/50 px-4 py-2.5 text-white placeholder:text-gray-500 outline-none focus:border-cyan-500/50 transition-colors"
                />
                <p className="mt-1 text-xs text-gray-400">Your broker's MT5 server name (e.g., ICMarketsSC-Demo)</p>
              </div>

              {/* Trading Style */}
              <div>
                <label htmlFor="tradingStyle" className="block text-sm font-medium text-gray-300">
                  Trading Style
                </label>
                <select
                  id="tradingStyle"
                  name="tradingStyle"
                  value={formData.tradingStyle}
                  onChange={handleChange}
                  tabIndex={!canConnect && !existingCredentials ? -1 : 0}
                  className="mt-2 w-full rounded-lg border border-white/[0.1] bg-dark-tertiary/50 px-4 py-2.5 text-white outline-none focus:border-cyan-500/50 transition-colors"
                >
                  <option value="Scalping">Scalping (Quick trades, high frequency)</option>
                  <option value="Conservative">Conservative (Low risk, steady returns)</option>
                  <option value="Aggressive">Aggressive (High risk, high reward)</option>
                </select>
                <p className="mt-1 text-xs text-gray-400">Select your preferred trading strategy</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !canConnect}
              tabIndex={!canConnect && !existingCredentials ? -1 : 0}
              className="mt-6 w-full rounded-lg bg-cyan-500 px-4 py-2.5 font-medium text-white hover:bg-cyan-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  Connecting...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Plug className="h-4 w-4" />
                  {existingCredentials ? 'Update Credentials' : 'Connect MT5 Account'}
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Help Section */}
        {!existingCredentials && (
          <div className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl">
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
                <span>Enter the details above and click <strong className="text-white">Connect MT5 Account</strong></span>
              </li>
            </ol>
          </div>
        )}
      </motion.div>
    </div>
  );
}