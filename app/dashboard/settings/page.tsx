'use client';

import { motion } from 'framer-motion';
import { LogOut, Mail } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-semibold text-white">Settings</h1>
        <p className="text-gray-400">
          Manage your account support and sessions.
        </p>
      </motion.div>

      {/* Support Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-xl p-6 border border-white/[0.05] bg-dark-secondary/40 backdrop-blur-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
          Support
        </h2>
        <div className="mt-5 space-y-4">
          <div className="flex flex-col items-start justify-between gap-3 rounded-md border border-white/[0.05] bg-dark-tertiary/30 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-white">Contact Administrator</p>
              <p className="mt-1 text-xs text-gray-400">
                Need help changing your profile or account settings? Reach out to the admin for assistance.
              </p>
            </div>
            <a 
              href="mailto:phantompip4@gmail.com"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-500/40 bg-cyan-500/10 px-4 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 transition-colors whitespace-nowrap"
            >
              <Mail className="size-4" />
              Contact Admin
            </a>
          </div>
        </div>
      </motion.div>

      {/* Session Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass rounded-xl p-6 border border-white/[0.05] bg-dark-secondary/40 backdrop-blur-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
          Session
        </h2>
        <div className="mt-5 space-y-4">
          {/* Logout */}
          <div className="flex flex-col items-start justify-between gap-3 rounded-md border border-white/[0.05] bg-dark-tertiary/30 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-white">Log out of Phantompip</p>
              <p className="mt-1 text-xs text-gray-400">
                You'll need to sign in again to access the terminal.
              </p>
            </div>
            <button className="inline-flex h-10 items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-4 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors whitespace-nowrap">
              <LogOut className="size-4" />
              Log out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}