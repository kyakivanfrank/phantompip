'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSpotlight } from '@/lib/hooks';

export default function SignupPage() {
  const spotlight = useSpotlight<HTMLDivElement>();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Visibility states for password fields
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Password validation logic
  const requirements = useMemo(() => [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'One number', met: /[0-9]/.test(formData.password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(formData.password) },
  ], [formData.password]);

  const allMet = requirements.every(r => r.met);
  const showRequirements = isPasswordFocused || (formData.password.length > 0 && !allMet);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allMet) {
      setError('Please meet all password requirements');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        setIsLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred during signup');
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
          Join Phantompip
        </h1>
        <p className="mt-2 text-sm text-[--text-2]">
          Create an account to get started.
        </p>


        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 rounded-md ring-1 ring-red-500/25 bg-red-500/10 p-3"
          >
            <p className="text-xs text-red-400">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4">
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[--text-2]">Full Name</span>
            <input
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="mt-2 h-11 w-full rounded-md bg-white/[0.04] px-3 text-sm text-[--text-1] placeholder:text-[--text-3] shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(255,255,255,.10)] outline-none transition-all duration-150 hover:shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(255,255,255,.18)] focus:bg-white/[0.06] focus:shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(99,102,241,.9),0_0_0_4px_rgba(99,102,241,.15)] aria-[invalid=true]:shadow-[0_0_0_1px_rgba(239,68,68,.9),0_0_0_4px_rgba(239,68,68,.15)] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>

          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[--text-2]">Email</span>
            <input
              type="email"
              name="email"
              placeholder="you@trader.io"
              value={formData.email}
              onChange={handleChange}
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
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
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

          {/* Dynamic Password Requirements */}
          <AnimatePresence>
            {showRequirements && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-md border border-white/[0.05] bg-dark-tertiary/20 p-3 space-y-2">
                  <p className="text-[11px] text-light-muted font-mono uppercase">Security Check</p>
                  <div className="space-y-1">
                    {requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] transition-colors">
                        <div className={`size-1 rounded-full ${req.met ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-zinc-600'}`} />
                        <span className={req.met ? 'text-light-primary' : 'text-light-muted'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirm Password Input with Toggle */}
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[--text-2]">Confirm Password</span>
            <div className="relative mt-2">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-md bg-white/[0.04] pl-3 pr-12 text-sm text-[--text-1] placeholder:text-[--text-3] shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(255,255,255,.10)] outline-none transition-all duration-150 hover:shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(255,255,255,.18)] focus:bg-white/[0.06] focus:shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(99,102,241,.9),0_0_0_4px_rgba(99,102,241,.15)] aria-[invalid=true]:shadow-[0_0_0_1px_rgba(239,68,68,.9),0_0_0_4px_rgba(239,68,68,.15)] disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded font-mono text-[11px] font-semibold tracking-wider text-[--text-2] transition-colors hover:text-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 select-none"
              >
                {showConfirmPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </label>

          <p className="text-[11px] text-light-secondary leading-relaxed pt-2">
            By signing up, you accept our Terms & Privacy Policy. Trading involves risk.
          </p>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 relative inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold text-white bg-indigo-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.4)] transition-all duration-150 hover:bg-indigo-500 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_3px_rgba(0,0,0,0.5)] active:translate-y-px active:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
      </div>

      <div className="mt-8 flex justify-center">
        <Link 
          href="/login" 
          className="group inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-[--text-2] bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,.07),0_0_0_1px_rgba(255,255,255,.10)] transition-all duration-150 hover:text-white hover:bg-indigo-500/10 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_0_0_1px_rgba(99,102,241,.35)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
        >
          <span>Already a member?</span>
          <span className="text-indigo-400 font-semibold group-hover:text-indigo-300 transition-colors">Log in</span>
          <svg className="h-4 w-4 text-indigo-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
}
