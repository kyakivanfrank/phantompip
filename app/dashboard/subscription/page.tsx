'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Check, AlertCircle, Copy as CopyIcon, Smartphone, Coins } from 'lucide-react';

type PaymentMethod = 'USDT-TRC20' | 'MTN-MoMo' | 'Airtel-Money';

export default function SubscriptionPage() {
  const [formData, setFormData] = useState({
    transactionId: '',
    method: 'USDT-TRC20' as PaymentMethod,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<PaymentMethod | null>(null);

  // Payment Details Configuration
  const PAYMENT_DETAILS = {
    'USDT-TRC20': {
      label: 'USDT (TRON/TRC20)',
      amount: '$49.99 USDT',
      address: 'TCmyVHKK8G8GYJBvQmDvZW9KCXAXSYyJAV',
      accountName: 'Network: TRON (TRC20)',
      helperText: 'Provide the blockchain transaction hash/ID below after completing your transfer.',
    },
    'MTN-MoMo': {
      label: 'MTN Mobile Money',
      amount: 'UGX 180,000',
      address: '+256 770 000 000', // Replace with actual MTN agent/merchant/personal number
      accountName: 'Account Name: PHANTOMPIP TRADING',
      helperText: 'Send the exact UGX amount to the mobile number above. Verify the account name matches before sending.',
    },
    'Airtel-Money': {
      label: 'Airtel Money',
      amount: 'UGX 180,000',
      address: '+256 700 000 000', // Replace with actual Airtel agent/merchant/personal number
      accountName: 'Account Name: PHANTOMPIP TRADING',
      helperText: 'Send the exact UGX amount to the mobile number above. Verify the account name matches before sending.',
    },
  };

  const handleMethodChange = (method: PaymentMethod) => {
    setFormData(prev => ({
      ...prev,
      method,
      transactionId: '', // Reset transaction ID on tab switch to avoid errors
    }));
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      transactionId: e.target.value,
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
        setFormData(prev => ({ ...prev, transactionId: '' }));
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

  const copyToClipboard = (text: string, method: PaymentMethod) => {
    navigator.clipboard.writeText(text);
    setCopied(method);
    setTimeout(() => setCopied(null), 2000);
  };

  const currentDetails = PAYMENT_DETAILS[formData.method];
  const isCrypto = formData.method === 'USDT-TRC20';

  return (
    <div className="space-y-6">
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
          Select your preferred gateway to activate your 30-day trading access session.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {/* Three-Way Payment Option Selector */}
        <div className="grid gap-4 sm:grid-cols-3">
          {(Object.keys(PAYMENT_DETAILS) as PaymentMethod[]).map((method) => {
            const isSelected = formData.method === method;
            const details = PAYMENT_DETAILS[method];
            const IsCryptoTab = method === 'USDT-TRC20';

            return (
              <div
                key={method}
                onClick={() => handleMethodChange(method)}
                className={`rounded-xl border p-5 backdrop-blur-xl transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? IsCryptoTab
                      ? 'border-cyan-500/50 bg-cyan-500/10'
                      : 'border-purple-500/50 bg-purple-500/10'
                    : 'border-white/[0.1] opacity-[0.3] bg-dark-secondary/40 hover:border-white/[0.2]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400">Gateway</span>
                    {isSelected && (
                      <Check className={`h-4 w-4 ${IsCryptoTab ? 'text-cyan-400' : 'text-purple-400'}`} />
                    )}
                  </div>
                  <h3 className="font-semibold text-white flex items-center gap-2 text-base">
                    {IsCryptoTab ? (
                      <Coins className="h-5 w-5 text-cyan-400" />
                    ) : (
                      <Smartphone className="h-5 w-5 text-purple-400" />
                    )}
                    {details.label}
                  </h3>
                </div>
                <p className={`mt-4 text-lg font-mono font-semibold ${IsCryptoTab ? 'text-cyan-400' : 'text-purple-400'}`}>
                  {details.amount}
                </p>
              </div>
            );
          })}
        </div>

        {/* Dynamic Payment Details Panel & Submission Form */}
        <div className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/[0.1] bg-white/[0.01]">
            <h3 className="font-semibold text-white text-lg mb-4">
              Step 1: Send Payment via {currentDetails.label}
            </h3>
            
            <div className="grid gap-6 md:grid-cols-2 items-start">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Required Amount</p>
                  <p className={`text-2xl font-mono font-bold mt-1 ${isCrypto ? 'text-cyan-400' : 'text-purple-400'}`}>
                    {currentDetails.amount}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    {isCrypto ? 'Wallet Address (TRON Network)' : 'Recipient Mobile Number'}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentDetails.address}
                      readOnly
                      className="flex-1 rounded-lg border border-white/[0.1] bg-dark-tertiary/50 px-3 py-2 font-mono text-sm text-gray-300 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentDetails.address, formData.method)}
                      className={`px-3 py-2 rounded-lg border transition-colors ${
                        isCrypto 
                          ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20' 
                          : 'border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                      }`}
                    >
                      {copied === formData.method ? <Check className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-300 font-medium mt-1.5 bg-white/[0.03] inline-block px-2 py-0.5 rounded border border-white/[0.05]">
                    {currentDetails.accountName}
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-sm text-gray-400">
                <p className="font-medium text-white text-xs uppercase tracking-wider">Instructions:</p>
                <p>{currentDetails.helperText}</p>
                <p>
                  Once transaction is confirmed by your network, capture the tracking reference ID or TxHash generated by the system.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <h3 className="font-semibold text-white text-lg">Step 2: Submit Verification Receipt</h3>

            <AnimatePresence mode="wait">
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-lg border border-green-500/20 bg-green-500/5 p-4"
                >
                  <div className="flex gap-3">
                    <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-400">Payment Metadata Submitted</p>
                      <p className="text-sm text-gray-400">
                        Your proof of reference has been queued. Verification updates will finalize within 24 operational hours.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-lg border border-red-500/20 bg-red-500/5 p-4"
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
            </AnimatePresence>

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
                placeholder={isCrypto ? "e.g., 0x7a4d... or TRC20 TxHash" : "e.g., ID240101.1402.C00001 or Money Ref"}
                required
                className="mt-2 w-full rounded-lg border border-white/[0.1] bg-dark-tertiary/50 px-4 py-2.5 text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 transition-colors font-mono text-sm"
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Input the precise system-generated identifier from your payment logs.
              </p>
            </div>

            {/* Informational Guidance Notice */}
            <div className={`rounded-lg border p-4 ${isCrypto ? 'border-cyan-500/20 bg-cyan-500/5' : 'border-purple-500/20 bg-purple-500/5'}`}>
              <div className="flex gap-3">
                <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${isCrypto ? 'text-cyan-400' : 'text-purple-400'}`} />
                <div className="text-sm">
                  <p className={`font-medium ${isCrypto ? 'text-cyan-400' : 'text-purple-400'}`}>Verification Processing</p>
                  <p className="mt-1 text-gray-400 leading-relaxed">
                    {!isCrypto ? (
                      <span>
                        To optimize and speed up the activation workflow, please consider contacting the administrative desk directly. Forwarding your mobile payment confirmation screenshot alongside these exact transaction identifiers will facilitate accelerated clearance.
                      </span>
                    ) : (
                      <span>
                        Cryptocurrency processing updates automatically upon reaching the required consensus validations on the TRON network ledger. Ensure network fees are covered on your side.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-lg px-4 py-2.5 font-medium text-white transition-colors disabled:opacity-50 ${
                isCrypto ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  Verifying Receipt...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Submit Payment Records
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Payment History Log */}
        <div className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl">
          <h3 className="font-semibold text-white mb-2">Payment History Ledger</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Historical allocations, target operational gateway endpoints, tracking balances, and validation status reports will register dynamically upon recording your initial settlement sequence.
          </p>
        </div>
      </motion.div>
    </div>
  );
}