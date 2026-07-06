'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Mail, Lock } from 'lucide-react';

export default function SettingsPage() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to update password');
      }

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Password updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Unable to update password');
    } finally {
      setIsSaving(false);
    }
  };
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

      {/* Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-xl p-6 border border-white/[0.05] bg-dark-secondary/40 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Password</h2>
            <p className="mt-1 text-sm text-gray-400">Change your account password securely.</p>
          </div>
          <Lock className="size-5 text-cyan-400" />
        </div>

        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400">Current password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="mt-2 w-full rounded-lg border border-white/[0.1] bg-dark px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400">New password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="mt-2 w-full rounded-lg border border-white/[0.1] bg-dark px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 transition"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400">Confirm new password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="mt-2 w-full rounded-lg border border-white/[0.1] bg-dark px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 transition"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-cyan-500 px-4 text-sm font-medium text-white hover:bg-cyan-400 transition disabled:cursor-not-allowed disabled:bg-cyan-500/60"
          >
            {isSaving ? 'Saving...' : 'Update password'}
          </button>

          {message && <p className="text-sm text-emerald-400">{message}</p>}
          {error && <p className="text-sm text-rose-400">{error}</p>}
        </form>
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