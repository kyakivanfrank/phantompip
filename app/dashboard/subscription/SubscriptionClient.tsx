"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Check, AlertCircle, Copy as CopyIcon, Smartphone, Coins, Store } from 'lucide-react';

type PaymentDetail = {
  label: string;
  amount: string;
  address: string;
  accountName: string;
  helperText: string;
};

// Configuration profile mapping distinct visual parameters per gateway type
const gatewayStyles: Record<string, {
  borderClass: string;
  bgClass: string;
  textClass: string;
  btnClass: string;
  alertBgClass: string;
  alertBorderClass: string;
  badgeClass: string;
  icon: React.ReactNode;
}> = {
  'USDT-TRC20': {
    borderClass: 'border-cyan-500/50',
    bgClass: 'bg-cyan-500/10',
    textClass: 'text-cyan-400',
    btnClass: 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500/50',
    alertBgClass: 'bg-cyan-500/5',
    alertBorderClass: 'border-cyan-500/20',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    icon: <Coins className="h-5 w-5 text-cyan-400" />,
  },
  'Airtel-Merchant': {
    borderClass: 'border-emerald-500/50',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/50',
    alertBgClass: 'bg-emerald-500/5',
    alertBorderClass: 'border-emerald-500/20',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: <Store className="h-5 w-5 text-emerald-400" />,
  },
  'Airtel-Money': {
    borderClass: 'border-amber-500/50',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
    btnClass: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/50',
    alertBgClass: 'bg-amber-500/5',
    alertBorderClass: 'border-amber-500/20',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: <Smartphone className="h-5 w-5 text-amber-400" />,
  },
  'MTN-MoMo': {
    borderClass: 'border-yellow-500/50',
    bgClass: 'bg-yellow-500/10',
    textClass: 'text-yellow-400',
    btnClass: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500/50',
    alertBgClass: 'bg-yellow-500/5',
    alertBorderClass: 'border-yellow-500/20',
    badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    icon: <Smartphone className="h-5 w-5 text-yellow-400" />,
  }
};

export default function SubscriptionClient({ paymentDetails }: { paymentDetails: Record<string, PaymentDetail> }) {
  const availableMethods = Object.keys(paymentDetails);
  const initialMethod = availableMethods.length > 0 ? availableMethods[0] : '';

  const [formData, setFormData] = useState({
    transactionId: '',
    method: initialMethod,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  if (availableMethods.length === 0) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
        <div className="flex gap-3">
          <AlertCircle className="h-6 w-6 text-red-400 shrink-0" />
          <div>
            <h3 className="font-semibold text-red-400 mb-1">Secure Routing Error</h3>
            <p className="text-sm text-gray-400">Payment options are unavailable because environment configuration handles are missing. Support must resolve this configuration conflict.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleMethodChange = (method: string) => {
    setFormData(prev => ({
      ...prev,
      method,
      transactionId: '',
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

  // Create a helper to determine the exact Tailwind class string
  const getGridColsClass = (count: number) => {
    if (count >= 4) return 'lg:grid-cols-4';
    if (count === 3) return 'lg:grid-cols-3';
    if (count === 2) return 'lg:grid-cols-2';
    return 'lg:grid-cols-1';
  };

  const copyToClipboard = (text: string, method: string) => {
    navigator.clipboard.writeText(text);
    setCopied(method);
    setTimeout(() => setCopied(null), 2000);
  };

  const currentDetails = paymentDetails[formData.method];
  const activeStyle = gatewayStyles[formData.method] || gatewayStyles['USDT-TRC20'];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-semibold text-white">Subscription & Payment</h1>
        </div>
        <p className="text-gray-400">Choose your gateway destination below to allocate your 30-day active session license securely.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">

        {/* Gateway Card Selection Grid */}
        <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${getGridColsClass(availableMethods.length)}`}>
          {availableMethods.map((method) => {
            const isSelected = formData.method === method;
            const details = paymentDetails[method];
            const targetStyle = gatewayStyles[method] || gatewayStyles['USDT-TRC20'];

            return (
              <div
                key={method}
                onClick={() => handleMethodChange(method)}
                className={`rounded-xl border p-5 backdrop-blur-xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${isSelected
                    ? `${targetStyle.borderClass} ${targetStyle.bgClass} shadow-lg shadow-black/20`
                    : 'border-white/[0.06] opacity-[0.4] bg-dark-secondary/30 hover:border-white/[0.15] hover:opacity-[0.8]'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Gateway System</span>
                    {isSelected && (
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${targetStyle.badgeClass}`}>
                        <Check className="h-3 w-3" /> Selected
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white flex items-center gap-2.5 text-base relative z-10">
                    {targetStyle.icon}
                    {details.label}
                  </h3>
                </div>

                {/* Visual Highlight on Payable Value */}
                <p className={`mt-5 text-xl font-mono font-bold tracking-tight relative z-10 ${targetStyle.textClass}`}>
                  {details.amount}
                </p>
              </div>
            );
          })}
        </div>

        {/* Informational Interface Card */}
        <div className="rounded-xl border border-white/[0.08] bg-dark-secondary/40 backdrop-blur-xl overflow-hidden shadow-2xl">

          {/* Action Step 1 Panel */}
          <div className="p-6 border-b border-white/[0.08] bg-white/[0.01]">
            <h3 className="font-semibold text-white text-lg mb-5 flex items-center gap-2">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold bg-white/10 border border-white/20 text-white`}>1</span>
              Send Balance Allocation via {currentDetails.label}
            </h3>

            <div className="grid gap-6 md:grid-cols-2 items-start">
              <div className="space-y-4">

                {/* Required Funding Amount Block */}
                <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.02]">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Exact Amount Required</p>
                  <p className={`text-3xl font-mono font-black tracking-tight mt-1.5 ${activeStyle.textClass}`}>
                    {currentDetails.amount}
                  </p>
                </div>

                {/* Secure Target Endpoint Location Block */}
                <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] relative overflow-hidden">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                    {formData.method === 'USDT-TRC20' ? 'Wallet Destination (TRON Network Only)' : formData.method === 'Airtel-Merchant' ? 'Merchant Payment Code' : 'Target Recipient Mobile Handle'}
                  </p>

                  <div className="flex gap-2 relative z-10">
                    <input
                      type="text"
                      value={currentDetails.address}
                      readOnly
                      className={`flex-1 rounded-lg border px-3.5 py-3 font-mono font-bold text-base outline-none bg-black/40 text-white selection:bg-white/20 transition-all ${activeStyle.borderClass}`}
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentDetails.address, formData.method)}
                      className={`px-4 py-3 rounded-lg border font-medium transition-all flex items-center justify-center active:scale-95 ${activeStyle.borderClass} ${activeStyle.bgClass} ${activeStyle.textClass} hover:brightness-125`}
                    >
                      {copied === formData.method ? <Check className="h-5 w-5" /> : <CopyIcon className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Account Name Holder Display Tag */}
                  <div className="mt-3 flex items-center">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md border tracking-wide uppercase ${activeStyle.badgeClass}`}>
                      {currentDetails.accountName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructions and Core Directives Panel */}
              <div className="space-y-3 p-5 rounded-xl bg-black/20 border border-white/[0.04] text-sm text-gray-400 leading-relaxed self-stretch flex flex-col justify-center">
                <p className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className={`h-4 w-4 ${activeStyle.textClass}`} /> Operational Guide Instructions:
                </p>
                <p>{currentDetails.helperText}</p>
                <p className="border-t border-white/[0.05] pt-2.5 mt-1 text-xs">
                  Once your network updates clear the allocation balance, please ensure you record the exact processing reference token hash generated.
                </p>
              </div>
            </div>
          </div>

          {/* Action Step 2 Verification Panel */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-black/[0.08]">
            <h3 className="font-semibold text-white text-lg flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold bg-white/10 border border-white/20 text-white">2</span>
              Submit Verification Verification Receipt
            </h3>

            <AnimatePresence mode="wait">
              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                  <div className="flex gap-3">
                    <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-400">Payment Metadata Submitted</p>
                      <p className="text-sm text-gray-400">Your proof of reference has been queued. Verification updates will finalize within 24 operational hours.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
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
              <label htmlFor="transactionId" className="block text-sm font-medium text-gray-300">Transaction ID / Reference Code</label>
              <input
                type="text"
                id="transactionId"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                placeholder={formData.method === 'USDT-TRC20' ? "e.g., Blockchain TRC20 TxHash" : "e.g., Airtel Money Reference ID String"}
                required
                className="mt-2 w-full rounded-lg border border-white/[0.1] bg-dark-tertiary/50 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 transition-colors font-mono text-sm"
              />
              <p className="mt-1.5 text-xs text-gray-400">Input the precise system-generated identifier from your payment logs.</p>
            </div>

            {/* Dynamic Status Callout Alert based on explicit Selection */}
            <div className={`rounded-lg border p-4 transition-all ${activeStyle.alertBorderClass} ${activeStyle.alertBgClass}`}>
              <div className="flex gap-3">
                <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${activeStyle.textClass}`} />
                <div className="text-sm">
                  <p className={`font-semibold tracking-wide ${activeStyle.textClass}`}>Verification Processing Profile</p>
                  <p className="mt-1 text-gray-400 leading-relaxed">
                    {formData.method !== 'USDT-TRC20' ? (
                      <span>To optimize and speed up the activation workflow, please consider contacting the administrative desk directly. Forwarding your mobile payment confirmation screenshot alongside these exact transaction identifiers will facilitate accelerated clearance.</span>
                    ) : (
                      <span>Cryptocurrency processing updates automatically upon reaching the required consensus validations on the TRON network ledger. Ensure network fees are covered on your side.</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-lg px-4 py-3 font-semibold text-white transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-secondary disabled:opacity-50 active:scale-[0.99] ${activeStyle.btnClass}`}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  Verifying Transaction Reference...
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

        <div className="rounded-xl border border-white/[0.08] bg-dark-secondary/40 p-6 backdrop-blur-xl">
          <h3 className="font-semibold text-white mb-2">Payment History Ledger</h3>
          <p className="text-sm text-gray-400 leading-relaxed">Historical allocations, target operational gateway endpoints, tracking balances, and validation status reports will register dynamically upon recording your initial settlement sequence.</p>
        </div>
      </motion.div>
    </div>
  );
}