'use client';

import { motion } from 'framer-motion';
import { Copy, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function SubscriptionPage() {
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'other'>('crypto');
  const [selectedCountry, setSelectedCountry] = useState('UG');
  const [txHash, setTxHash] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  const paymentMethods: Record<string, { methods: Array<{ name: string; description: string; code: string }> }> = {
    UG: {
      methods: [
        {
          name: 'MTN MoMo Pay',
          description:
            'Send UGX 180,000 (or UGX 126,000 with promo PHANTOMPIP) via MTN MoMo Pay to merchant code 745979 (Wire 24 Services Ltd). Then paste the MoMo transaction ID below.',
          code: '745979',
        },
        {
          name: 'Airtel Pay',
          description:
            'Send UGX 180,000 (or UGX 126,000 with promo PHANTOMPIP) via Airtel Money Pay to merchant code 7104191 (Phantompip). Then paste the Airtel transaction ID below.',
          code: '7104191',
        },
      ],
    },
    NG: {
      methods: [
        {
          name: 'Bank Transfer',
          description: 'Transfer NGN to your local bank account. Contact support for details.',
          code: 'BANK-NG',
        },
      ],
    },
    US: {
      methods: [
        {
          name: 'Bank Transfer',
          description: 'ACH transfer to US bank account. Contact support for details.',
          code: 'ACH-US',
        },
      ],
    },
    EU: {
      methods: [
        {
          name: 'SEPA Transfer',
          description: 'SEPA bank transfer available for Eurozone countries.',
          code: 'SEPA-EU',
        },
      ],
    },
  };

  const currentMethods = paymentMethods[selectedCountry]?.methods || paymentMethods['UG'].methods;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subscription</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your plan and payment. Bots auto-disable on expiry.
        </p>
      </div>

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-xl p-6 border border-white/[0.05] bg-dark-secondary/40 backdrop-blur-sm"
      >
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-gray-400">
              Current plan
            </p>
            <p className="mt-2 font-mono text-2xl text-blue-400">
              Starter · $50
              <span className="text-sm text-gray-400">/month</span>
            </p>
            <span className="mt-2 inline-block rounded-full bg-purple-500/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-purple-400">
              Assigned by admin
            </span>
          </div>
        </div>
      </motion.div>

      {/* Subscribe / Renew */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-white">Subscribe / renew</h2>
        <div className="mt-4 rounded-xl border border-blue-500/50 bg-dark-secondary/40 p-6 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-400">Starter</p>
          <p className="mt-4 font-mono text-2xl text-blue-400">
            $50
            <span className="text-xs text-gray-400">/mo</span>
          </p>
          <p className="mt-2 text-xs text-gray-400">
            For traders validating their first automated strategy.
          </p>
        </div>
      </motion.div>

      {/* Payment Section with Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass rounded-xl p-6 border border-white/[0.05] bg-dark-secondary/40 backdrop-blur-sm"
      >
        <h2 className="text-lg font-semibold text-white">Pay</h2>
        <p className="mt-1 text-sm text-gray-400">
          Choose how you want to pay. Subscription activates after confirmation.
        </p>

        {/* Payment Method Tabs */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setPaymentMethod('crypto')}
            className={`flex-1 rounded-md border px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
              paymentMethod === 'crypto'
                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                : 'border-white/[0.1] bg-dark-tertiary/30 text-gray-400 hover:text-white'
            }`}
          >
            Crypto
          </button>
          <button
            onClick={() => setPaymentMethod('other')}
            className={`flex-1 rounded-md border px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
              paymentMethod === 'other'
                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                : 'border-white/[0.1] bg-dark-tertiary/30 text-gray-400 hover:text-white'
            }`}
          >
            Other payment methods
          </button>
        </div>

        {/* CRYPTO TAB */}
        {paymentMethod === 'crypto' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-5 space-y-4"
          >
            {/* Warning */}
            <div className="rounded-md border-2 border-red-500/50 bg-red-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-400" />
                <div className="text-xs leading-relaxed">
                  <p className="font-semibold uppercase tracking-wider text-red-400">
                    Send on Tron (TRC20) network ONLY
                  </p>
                  <p className="mt-1 text-gray-300">
                    Sending USDT on <strong>Ethereum (ERC20)</strong>, <strong>BSC (BEP20)</strong>,
                    Polygon, Solana, or any other network will result in{' '}
                    <strong className="text-red-400">permanent loss of funds</strong>. Payments sent on
                    the wrong network <strong>cannot be recovered or refunded.</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="rounded-md border border-white/[0.1] bg-dark-tertiary/30 p-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
                Send USDT to
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <code className="break-all font-mono text-xs text-blue-400">
                  TRrASGdHZxGAVEjot5QEZsz7YjrKCsm16a
                </code>
                <button className="grid size-8 shrink-0 place-items-center rounded-md border border-white/[0.1] hover:bg-dark-tertiary/50 transition-colors">
                  <Copy className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Amount and Network */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-white/[0.05] bg-dark-tertiary/30 px-4 py-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
                  Amount due
                </p>
                <p className="mt-1 font-mono text-lg text-white">$50.00</p>
              </div>
              <div className="rounded-md border border-white/[0.05] bg-dark-tertiary/30 px-4 py-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
                  Network
                </p>
                <p className="mt-1 font-mono text-sm text-red-400">Tron (TRC20) only</p>
              </div>
            </div>

            {/* Transaction ID Input */}
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">
                Transaction ID (after sending)
              </span>
              <input
                placeholder="TRC20 tx hash"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-white/[0.1] bg-dark-tertiary/30 px-3 font-mono text-xs text-white outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
              />
            </label>

            {/* Verify Button */}
            <button
              disabled={!txHash}
              className="h-11 w-full rounded-md bg-blue-500 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify & activate
            </button>
          </motion.div>
        )}

        {/* OTHER PAYMENT METHODS TAB */}
        {paymentMethod === 'other' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-5 space-y-4"
          >
            {/* Country Selector */}
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">
                Your country
              </span>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-white/[0.1] bg-dark-tertiary/30 px-3 text-sm text-white outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">Select your country…</option>
                <option value="US">United States</option>
                <option value="EU">Eurozone (DE, FR, ES, IT, NL, …)</option>
                <option value="UK">United Kingdom</option>
                <option value="NG">Nigeria</option>
                <option value="IN">India</option>
                <option value="BR">Brazil</option>
                <option value="AE">UAE / Saudi Arabia</option>
                <option value="UG">Uganda</option>
                <option value="OTHER">Other country</option>
              </select>
            </label>

            {/* Payment Methods for Selected Country */}
            {selectedCountry && selectedCountry !== 'OTHER' && (
              <div className="space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">
                  Supported methods · {selectedCountry}
                </p>

                {currentMethods.map((method, idx) => (
                  <div
                    key={idx}
                    className="rounded-md border border-white/[0.05] bg-dark-tertiary/30 p-4"
                  >
                    <p className="text-sm font-medium text-blue-400">{method.name}</p>
                    <p className="mt-1 text-xs text-gray-300">{method.description}</p>
                    <p className="mt-2 text-[11px] text-gray-400">
                      Need help? Contact support — support@ghosttrader.ai or Telegram @ghosttraderai.
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Reference */}
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">
                Payment reference / receipt note
              </span>
              <textarea
                rows={3}
                placeholder="e.g. SEPA reference number, last 4 of sender account, screenshot link…"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="mt-2 w-full rounded-md border border-white/[0.1] bg-dark-tertiary/30 p-3 font-mono text-xs text-white outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
              />
            </label>

            {/* Submit Button */}
            <button
              disabled={!selectedCountry || selectedCountry === 'OTHER'}
              className="h-11 w-full rounded-md bg-blue-500 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit payment
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
