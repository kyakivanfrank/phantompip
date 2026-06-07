'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, AlertCircle, Copy as CopyIcon } from 'lucide-react';

export default function SubscriptionPage() {
  const [formData, setFormData] = useState({
    transactionId: '',
    couponCode: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'wallet' | 'mtn' | null>(null);

  const USDT_WALLET = 'TCmyVHKK8G8GYJBvQmDvZW9KCXAXSYyJAV';
  const MTN_MERCHANT_CODE = '745979';
  const AMOUNT_UGX = 180000;
  const DISCOUNTED_AMOUNT_UGX = 126000;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setFormData({ transactionId: '', couponCode: '' });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.error || 'Failed to submit payment');
      }
    } catch (_err) {
      setError('Error submitting payment');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'wallet' | 'mtn') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
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
          <CreditCard className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-semibold text-white">Subscription & Payment</h1>
        </div>
        <p className="text-gray-400">
          Pay to activate your account and get 30 days of trading access
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl space-y-6"
      >
        {/* Payment Options */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* USDT Wallet */}
          <div className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              💎 USDT (Crypto)
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase">Amount</p>
                <p className="mt-1 text-lg font-mono text-cyan-400">$49.99 USDT</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase mb-2">Wallet Address (TRON/TRC20)</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={USDT_WALLET}
                    readOnly
                    className="flex-1 rounded-lg border border-white/[0.1] bg-dark-tertiary/50 px-3 py-2 font-mono text-xs text-gray-300 outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(USDT_WALLET, 'wallet')}
                    className="px-3 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                  >
                    {copied === 'wallet' ? <Check className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MTN Mobile Money */}
          <div className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              📱 MTN MoMo (Uganda)
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase">Amount</p>
                <p className="mt-1 text-lg font-mono text-purple-400">UGX {AMOUNT_UGX.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">or UGX {DISCOUNTED_AMOUNT_UGX.toLocaleString()} with code <strong className="text-cyan-400">PHANTOMPIP</strong></p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase mb-2">Merchant Code</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={MTN_MERCHANT_CODE}
                    readOnly
                    className="flex-1 rounded-lg border border-white/[0.1] bg-dark-tertiary/50 px-3 py-2 font-mono text-xs text-gray-300 outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(MTN_MERCHANT_CODE, 'mtn')}
                    className="px-3 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                  >
                    {copied === 'mtn' ? <Check className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Submission Form */}
        <form onSubmit={handleSubmit} className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl">
          <h3 className="font-semibold text-white mb-4">Submit Payment Receipt</h3>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg border border-green-500/20 bg-green-500/5 p-4"
            >
              <div className="flex gap-3">
                <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-400">Payment Submitted</p>
                  <p className="text-sm text-gray-400">
                    Your payment receipt has been submitted. Our admin will review and activate your account within 24 hours.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4"
            >
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-400">Submission Failed</p>
                  <p className="text-sm text-gray-400">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            {/* Transaction ID */}
            <div>
              <label htmlFor="transactionId" className="block text-sm font-medium text-gray-300">
                Transaction ID / Reference Code
              </label>
              <input
                type="text"
                id="transactionId"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                placeholder="e.g., TX123456789 or MOMO-2024-01-001"
                required
                className="mt-2 w-full rounded-lg border border-white/[0.1] bg-dark-tertiary/50 px-4 py-2.5 text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 transition-colors"
              />
              <p className="mt-1 text-xs text-gray-400">Your payment reference from USDT or MTN receipt</p>
            </div>

            {/* Coupon Code */}
            <div>
              <label htmlFor="couponCode" className="block text-sm font-medium text-gray-300">
                Coupon Code (Optional)
              </label>
              <input
                type="text"
                id="couponCode"
                name="couponCode"
                value={formData.couponCode}
                onChange={handleChange}
                placeholder="e.g., PHANTOMPIP"
                className="mt-2 w-full rounded-lg border border-white/[0.1] bg-dark-tertiary/50 px-4 py-2.5 text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 transition-colors"
              />
              <p className="mt-1 text-xs text-gray-400">Apply a promo code for discount (if applicable)</p>
            </div>

            {/* Info Box */}
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-400">Important</p>
                  <p className="mt-1 text-gray-400">
                    After submitting your payment receipt, our admin will verify and activate your account within 24 hours. Your subscription will be valid for 30 days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-lg bg-purple-500 px-4 py-2.5 font-medium text-white hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                Submitting...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Submit Payment
              </span>
            )}
          </button>
        </form>

        {/* Payment History */}
        <div className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl">
          <h3 className="font-semibold text-white mb-4">Payment History</h3>
          {/* Payments table would go here - fetch from /api/payments/list */}
          <p className="text-sm text-gray-400">Payment history will appear here once you submit your first payment.</p>
        </div>
      </motion.div>
    </div>
  );
}
