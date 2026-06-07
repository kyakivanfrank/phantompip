'use client';

import { motion } from 'framer-motion';
import { Plug, Sparkles, Shield, Activity } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:space-y-8 md:p-8">
      {/* Portfolio section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl md:p-10"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              'radial-gradient(60% 80% at 78.5687% 20%, oklch(0.72 0.16 255 / 0.19952), transparent 60%), radial-gradient(50% 70% at 21.6699% 89.7614%, oklch(0.65 0.22 300 / 0.17952), transparent 60%)',
          }}
        ></div>

        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] px-3 py-1 bg-dark-tertiary/50">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full opacity-60 bg-gray-400"></span>
              <span className="relative inline-flex size-2 rounded-full bg-gray-400"></span>
            </span>
            <span className="text-[11px] font-medium text-gray-400">No MT5 account</span>
          </span>
        </div>

        {/* Portfolio value */}
        <p className="mt-6 text-xs uppercase tracking-[0.18em] text-gray-400">Total Portfolio</p>
        <h1 className="mt-2 text-5xl font-semibold tracking-tight md:text-6xl">—</h1>

        {/* Connect button */}
        <div className="mt-6">
          <a
            href="/dashboard/mt5"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-cyan-500 px-5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Plug className="size-4" />
            Connect your MT5 account
          </a>
          <p className="mt-3 text-xs text-gray-400">
            Your portfolio value comes directly from your connected trading account.
          </p>
        </div>
      </motion.section>

      {/* Configuration section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-3xl border border-white/[0.1] bg-dark-secondary/40 p-5 backdrop-blur-xl md:p-8"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Strategy */}
          <div className="rounded-2xl border border-white/[0.05] bg-dark-tertiary/30 p-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Sparkles className="size-4" />
              <span className="text-[10px] uppercase tracking-widest">Strategy</span>
            </div>
            <p className="mt-2 font-mono text-base text-white">—</p>
          </div>

          {/* Risk Level */}
          <div className="rounded-2xl border border-white/[0.05] bg-dark-tertiary/30 p-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Shield className="size-4" />
              <span className="text-[10px] uppercase tracking-widest">Risk Level</span>
            </div>
            <p className="mt-2 font-mono text-base text-white">—</p>
          </div>

          {/* MT5 Account */}
          <div className="rounded-2xl border border-white/[0.05] bg-dark-tertiary/30 p-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Activity className="size-4" />
              <span className="text-[10px] uppercase tracking-widest">MT5 Account</span>
            </div>
            <p className="mt-2 font-mono text-base text-white">Not connected</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          Bot configuration and trade history will appear here once the trading engine streams data for your account.
        </p>
      </motion.section>
    </div>
  );
}
