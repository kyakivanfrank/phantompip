'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSupportContact } from '@/lib/hooks';
import { useSpotlight } from '@/lib/hooks';

export default function LoginPage() {
  const spotlight = useSpotlight<HTMLDivElement>();
  const supportContactNumber = useSupportContact();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotMessage, setShowForgotMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShowForgotMessage(false);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      console.log(data)

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      if (data.data.user.isAdmin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred during login');
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="glass glass-edge spotlight p-6 sm:p-8" {...spotlight}>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[--text-1]">
          Log in to Phantompip
        </h1>
        <p className="mt-2 text-sm text-[--text-2]">
          Welcome back! Please enter your details.
        </p>
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 rounded-md ring-1 ring-red-500/25 bg-red-500/10 p-3"
          >
            <p className="text-xs text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Dynamic Forgot Password / Support Message */}
        <AnimatePresence>
          {showForgotMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-md ring-1 ring-indigo-500/25 bg-indigo-500/10 p-3 flex justify-between items-start">
                <p className="text-xs text-indigo-400 leading-relaxed">
                  For account security, automated password resets are restricted. Please{' '}
                  <Link href="/support" className="underline font-semibold hover:text-indigo-300 transition-colors">
                    contact support
                  </Link>{' '}
                  directly to reset your credentials.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotMessage(false)}
                  className="text-indigo-400 hover:text-white font-mono text-[11px] ml-2 select-none"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4">
          {/* Email Input */}
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[--text-2]">Email</span>
            <input
              type="email"
              placeholder="you@trader.io"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              required
              className="mt-2 h-11 w-full rounded-md bg-white/[0.04] px-3 text-sm text-[--text-1] placeholder:text-[--text-3] shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(255,255,255,.10)] outline-none transition-all duration-150 hover:shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(255,255,255,.18)] focus:bg-white/[0.06] focus:shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(99,102,241,.9),0_0_0_4px_rgba(99,102,241,.15)] aria-[invalid=true]:shadow-[0_0_0_1px_rgba(239,68,68,.9),0_0_0_4px_rgba(239,68,68,.15)] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>

          {/* Password Input with Toggle */}
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[--text-2]">Password</span>
            <div className="relative mt-2">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                required
                className="h-11 w-full rounded-md bg-white/[0.04] pl-3 pr-12 text-sm text-[--text-1] placeholder:text-[--text-3] shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(255,255,255,.10)] outline-none transition-all duration-150 hover:shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(255,255,255,.18)] focus:bg-white/[0.06] focus:shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(99,102,241,.9),0_0_0_4px_rgba(99,102,241,.15)] aria-[invalid=true]:shadow-[0_0_0_1px_rgba(239,68,68,.9),0_0_0_4px_rgba(239,68,68,.15)] disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded font-mono text-[11px] font-semibold tracking-wider text-[--text-2] transition-colors hover:text-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 select-none"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </label>

          {/* Account Links */}
          <div className="flex items-center justify-between text-xs pt-1">
            {/* Turned into a text button to trigger inline disclosure notice safely */}
            <button
              type="button"
              onClick={() => {
                setShowForgotMessage(true);
                setError('');
              }}
              className="rounded text-indigo-400 hover:underline transition-colors hover:text-indigo-300 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 select-none"
            >
              Forgot password?
            </button>
          </div>


          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 relative inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold text-white bg-indigo-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.4)] transition-all duration-150 hover:bg-indigo-500 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_3px_rgba(0,0,0,0.5)] active:translate-y-px active:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>

      <div className="mt-8 flex justify-center">
        <Link 
          href="/signup" 
          className="group inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-[--text-2] bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,.07),0_0_0_1px_rgba(255,255,255,.10)] transition-all duration-150 hover:text-white hover:bg-indigo-500/10 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_0_0_1px_rgba(99,102,241,.35)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
        >
          <span>No account?</span>
          <span className="text-indigo-400 font-semibold group-hover:text-indigo-300 transition-colors">Sign up</span>
          <svg className="h-4 w-4 text-indigo-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
}
