'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
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
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      if (data.user.isAdmin) {
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
      <div className="rounded-2xl p-6 sm:p-8 border border-white/[0.1] bg-dark-secondary/40 backdrop-blur-xl shadow-2xl">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
          Log in to Phantompip
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-gray-400">
          Welcome back. Enter your credentials to access your trading terminal.
        </p>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3"
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
              <div className="mt-4 rounded-md border border-cyan-500/30 bg-cyan-500/10 p-3 flex justify-between items-start">
                <p className="text-xs text-cyan-400 leading-relaxed">
                  For account security, automated password resets are restricted. Please{' '}
                  <Link href="/support" className="underline font-semibold hover:text-cyan-300 transition-colors">
                    contact support
                  </Link>{' '}
                  directly to reset your credentials.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotMessage(false)}
                  className="text-cyan-400 hover:text-white font-mono text-[11px] ml-2 select-none"
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
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">Email</span>
            <input
              type="email"
              placeholder="you@trader.io"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              required
              className="mt-2 h-11 w-full rounded-md border border-white/[0.1] bg-dark-tertiary/50 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-cyan-500 focus:bg-dark-tertiary"
            />
          </label>

          {/* Password Input with Toggle */}
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">Password</span>
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
                className="h-11 w-full rounded-md border border-white/[0.1] bg-dark-tertiary/50 pl-3 pr-12 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-cyan-500 focus:bg-dark-tertiary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] font-semibold tracking-wider text-gray-400 transition-colors hover:text-cyan-400 select-none"
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
              className="text-cyan-400 hover:underline transition-colors hover:text-cyan-300 outline-none select-none"
            >
              Forgot password?
            </button>
            <Link href="/support" className="text-cyan-400 hover:underline transition-colors hover:text-cyan-300">
              Need help?
            </Link>
          </div>

          <p className="text-[10px] text-gray-400 leading-relaxed pt-2">
            By logging in you agree to our Terms of Service and Privacy Policy. Trading involves substantial risk of loss.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-md bg-cyan-500 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 mt-6"
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        No account?{' '}
        <Link href="/signup" className="text-cyan-400 hover:underline transition-colors hover:text-cyan-300">
          Sign up
        </Link>
      </p>
    </motion.div>
  );
}