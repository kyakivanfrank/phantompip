'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plug, Check, AlertCircle } from 'lucide-react';

export default function Mt5Page() {
  const [formData, setFormData] = useState({
    mt5LoginId: '',
    mt5Password: '',
    brokerServer: '',
    tradingStyle: 'Conservative',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setFormData({
          mt5LoginId: '',
          mt5Password: '',
          brokerServer: '',
          tradingStyle: 'Conservative',
        });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.error || 'Failed to connect MT5 account');
      }
    } catch (_err) {
      setError('Error connecting to MT5 account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <Plug className="h-8 w-8 text-cyan-400" />
          <h1 className="text-3xl font-semibold text-white">Connect MT5 Account</h1>
        </div>
        <p className="text-gray-400">
          Enter your MetaTrader 5 credentials to connect your trading account
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl space-y-6"
      >
        {/* Info Box */}
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-cyan-400">Secure Connection</p>
              <p className="mt-1 text-gray-400">
                Your MT5 password is encrypted with AES-256-GCM and never transmitted in plaintext. Our admin can only access decrypted credentials server-side.
              </p>
            </div>
          </div>
        </div>

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

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl">
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
                className="mt-2 w-full rounded-lg border border-white/[0.1] bg-dark-tertiary/50 px-4 py-2.5 text-white placeholder:text-gray-500 outline-none focus:border-cyan-500/50 transition-colors"
              />
              <p className="mt-1 text-xs text-gray-400">Your MT5 account number</p>
            </div>

            {/* MT5 Password */}
            <div>
              <label htmlFor="mt5Password" className="block text-sm font-medium text-gray-300">
                MT5 Password
              </label>
              <input
                type="password"
                id="mt5Password"
                name="mt5Password"
                value={formData.mt5Password}
                onChange={handleChange}
                placeholder="••••••••••"
                required
                className="mt-2 w-full rounded-lg border border-white/[0.1] bg-dark-tertiary/50 px-4 py-2.5 text-white placeholder:text-gray-500 outline-none focus:border-cyan-500/50 transition-colors"
              />
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
            disabled={isLoading}
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
                Connect MT5 Account
              </span>
            )}
          </button>
        </form>

        {/* Help Section */}
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
      </motion.div>
    </div>
  );
}
