'use client';

import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [username, setUsername] = useState('Mukisamicheal088');
  const [email, setEmail] = useState('Mukisamicheal088@gmail.com');


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
          Manage your profile, security, and sessions.
        </p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-xl p-6 border border-white/[0.05] bg-dark-secondary/40 backdrop-blur-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
          Profile
        </h2>
        <div className="mt-5 space-y-4">
          {/* Username */}
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">
              Username
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-white/[0.1] bg-dark-tertiary/30 px-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors"
            />
          </label>

          {/* Email */}
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">
              Email
            </span>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-white/[0.1] bg-dark-tertiary/30 px-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors"
            />
          </label>

          {/* Save Button */}
          {/* <button className="h-10 rounded-md bg-cyan-500 px-4 text-sm font-medium text-white hover:opacity-90 transition-opacity">
            Save changes
          </button> */}
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
