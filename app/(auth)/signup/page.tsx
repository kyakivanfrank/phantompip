'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        setIsLoading(false);
        return;
      }

      // Success - redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred during signup');
      setIsLoading(false);
    }
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
          <h1 className="text-2xl font-semibold tracking-tight text-white">Join Phantompip</h1>
          <p className="mt-2 text-sm text-gray-400">Create your account to access professional AI trading</p>

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Full Name Input */}
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">Full Name</span>
              <input
                type="text"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="mt-2 h-11 w-full rounded-md border border-white/[0.1] bg-dark-tertiary/50 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-cyan-500 focus:bg-dark-tertiary"
              />
            </label>

            {/* Email Input */}
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">Email</span>
              <input
                type="email"
                name="email"
                placeholder="you@trader.io"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-2 h-11 w-full rounded-md border border-white/[0.1] bg-dark-tertiary/50 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-cyan-500 focus:bg-dark-tertiary"
              />
            </label>

            {/* Password Input */}
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">Password</span>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-2 h-11 w-full rounded-md border border-white/[0.1] bg-dark-tertiary/50 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-cyan-500 focus:bg-dark-tertiary"
              />
            </label>

            {/* Confirm Password Input */}
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">Confirm Password</span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="mt-2 h-11 w-full rounded-md border border-white/[0.1] bg-dark-tertiary/50 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-cyan-500 focus:bg-dark-tertiary"
              />
            </label>

            {/* Password Requirements */}
            <div className="rounded-md border border-white/[0.05] bg-dark-tertiary/20 p-3 space-y-2">
              <p className="text-xs text-gray-400 font-mono">Password requirements:</p>
              <div className="space-y-1 text-xs">
                <div className="text-gray-400">✓ At least 8 characters</div>
                <div className="text-gray-400">✓ One uppercase letter</div>
                <div className="text-gray-400">✓ One number</div>
                <div className="text-gray-400">✓ One special character</div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-md bg-cyan-500 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 mt-6"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Already a member?{' '}
          <Link href="/login" className="text-cyan-400 hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
