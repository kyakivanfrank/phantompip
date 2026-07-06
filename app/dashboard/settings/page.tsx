'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Visibility states for password fields
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);

  // Password validation logic
  const passwordRequirements = useMemo(() => [
    { label: 'At least 8 characters', met: passwordForm.newPassword.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(passwordForm.newPassword) },
    { label: 'One lowercase letter', met: /[a-z]/.test(passwordForm.newPassword) },
    { label: 'One number', met: /[0-9]/.test(passwordForm.newPassword) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(passwordForm.newPassword) },
  ], [passwordForm.newPassword]);

  const allRequirementsMet = passwordRequirements.every(r => r.met);
  const showRequirements = isNewPasswordFocused || (passwordForm.newPassword.length > 0 && !allRequirementsMet);
  const passwordsMatch = passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.newPassword.length > 0;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation
    if (!passwordForm.currentPassword) {
      setError('Current password is required');
      return;
    }

    if (!passwordForm.newPassword) {
      setError('New password is required');
      return;
    }

    if (!allRequirementsMet) {
      setError('New password does not meet all security requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('New password and confirm password do not match');
      return;
    }

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
          {/* Current Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Current password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                  setError('');
                }}
                className="w-full rounded-lg border border-white/[0.1] bg-dark px-3 py-2 pr-12 text-sm text-white outline-none focus:border-cyan-500 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">New password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                  setError('');
                }}
                onFocus={() => setIsNewPasswordFocused(true)}
                onBlur={() => setIsNewPasswordFocused(false)}
                className="w-full rounded-lg border border-white/[0.1] bg-dark px-3 py-2 pr-12 text-sm text-white outline-none focus:border-cyan-500 transition"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <AnimatePresence>
            {showRequirements && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-md border border-white/[0.05] bg-dark-tertiary/20 p-3 space-y-2">
                  <p className="text-[10px] text-gray-500 font-mono uppercase">Security Requirements</p>
                  <div className="space-y-1.5">
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] transition-colors">
                        <div className={`size-1.5 rounded-full ${req.met ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-gray-600'}`} />
                        <span className={req.met ? 'text-gray-200' : 'text-gray-500'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Confirm new password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                  setError('');
                }}
                className="w-full rounded-lg border border-white/[0.1] bg-dark px-3 py-2 pr-12 text-sm text-white outline-none focus:border-cyan-500 transition"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordForm.confirmPassword && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-xs mt-1 ${passwordsMatch ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </motion.p>
            )}
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