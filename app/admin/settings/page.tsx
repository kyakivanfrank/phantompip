'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export default function AdminSettingsPage() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSaving(true);

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to update password');
      }

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Admin password updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Unable to update password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold text-white">Admin Settings</h1>
        <p className="mt-1 text-gray-400">Update admin account settings from one place.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="glass rounded-xl border border-white/[0.08] bg-dark-secondary/40 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-cyan-500/10 p-3 text-cyan-400">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Change Admin Password</p>
            <p className="text-sm text-gray-400">Use your current password to update the admin login.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            className="w-full rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-400 transition disabled:cursor-not-allowed disabled:bg-cyan-500/60"
          >
            {isSaving ? 'Saving...' : 'Update password'}
          </button>

          {message && <p className="text-sm text-emerald-400">{message}</p>}
          {error && <p className="text-sm text-rose-400">{error}</p>}
        </form>
      </motion.div>
    </div>
  );
}
