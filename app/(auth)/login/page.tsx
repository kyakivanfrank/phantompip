'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="relative grid min-h-screen place-items-center bg-dark px-4">
      {/* Grid background */}
      <div className="bg-grid absolute inset-0 -z-10 opacity-20"></div>
      
      {/* Radial gradient background */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-[500px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="mb-10 flex items-center justify-center">
          <img src="/phantompip-logo.png" alt="Phantompip" className="h-12 w-auto" />
        </Link>

        {/* Glass card */}
        <div className="rounded-2xl p-8 border border-white/[0.1] bg-dark-secondary/40 backdrop-blur-xl">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Log in to Phantompip</h1>
          <p className="mt-2 text-sm text-gray-400">Welcome back. Enter your credentials to access your trading terminal.</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Email Input */}
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">Email</span>
              <input
                type="email"
                placeholder="you@trader.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-white/[0.1] bg-dark-tertiary/50 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-cyan-500 focus:bg-dark-tertiary"
              />
            </label>

            {/* Password Input */}
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">Password</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-white/[0.1] bg-dark-tertiary/50 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-cyan-500 focus:bg-dark-tertiary"
              />
            </label>

            {/* Links */}
            <div className="flex items-center justify-between text-xs">
              <a href="/forgot-password" className="text-cyan-400 hover:underline">
                Forgot password?
              </a>
              <a href="/support" className="text-cyan-400 hover:underline">
                Need help?
              </a>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-gray-400 leading-relaxed">
              By logging in you agree to our Terms of Service and Privacy Policy. Trading involves substantial risk of loss.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-md bg-cyan-500 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 mt-6"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </div>

        {/* Signup Link */}
        <p className="mt-6 text-center text-xs text-gray-400">
          No account?{' '}
          <Link href="/signup" className="text-cyan-400 hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
