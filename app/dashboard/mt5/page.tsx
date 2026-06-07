'use client';

import { motion } from 'framer-motion';
import { Plus, Plug } from 'lucide-react';

export default function Mt5Page() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">MT5 Account</h1>
          <p className="mt-1 text-sm text-gray-400">
            Your live MetaTrader 5 account, in real time.
          </p>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan-500 px-4 text-sm font-medium text-white hover:opacity-90 transition-opacity">
          <Plus className="size-4" />
          Connect
        </button>
      </div>

      {/* Empty State */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-xl p-10 text-center border border-white/[0.05] bg-dark-secondary/40 backdrop-blur-sm"
      >
        <Plug className="mx-auto size-6 text-gray-400" />
        <p className="mt-3 text-sm text-gray-400">No MT5 account connected yet.</p>
        <button className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-cyan-500 px-4 text-sm font-medium text-white hover:opacity-90 transition-opacity">
          <Plus className="size-4" />
          Connect MT5 account
        </button>
      </motion.div>
    </div>
  );
}
