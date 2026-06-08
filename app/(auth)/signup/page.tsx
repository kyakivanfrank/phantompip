'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
      <div className="rounded-2xl p-6 sm:p-8 border border-white/[0.1] bg-dark-secondary/40 backdrop-blur-xl shadow-2xl">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
          Join Phantompip
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-gray-400 leading-relaxed">
          Step 1 of 2 — next, activate your subscription (or wait for admin activation).
        </p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3"
          >
            <p className="text-xs text-red-400">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">Full Name</span>
            <input
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="mt-2 h-11 w-full rounded-md border border-white/[0.1] bg-dark-tertiary/50 px-3 text-sm text-white outline-none transition-colors focus:border-cyan-500 focus:bg-dark-tertiary"
            />
          </label>

          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">Email</span>
            <input
              type="email"
              name="email"
              placeholder="you@trader.io"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-2 h-11 w-full rounded-md border border-white/[0.1] bg-dark-tertiary/50 px-3 text-sm text-white outline-none transition-colors focus:border-cyan-500 focus:bg-dark-tertiary"
            />
          </label>

          {/* Password Input with Toggle */}
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">Password</span>
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
                className="h-11 w-full rounded-md border border-white/[0.1] bg-dark-tertiary/50 pl-3 pr-12 text-sm text-white outline-none transition-colors focus:border-cyan-500 focus:bg-dark-tertiary"
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
                  <p className="text-[10px] text-gray-500 font-mono uppercase">Security Check</p>
                  <div className="space-y-1">
                    {requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] transition-colors">
                        <div className={`size-1 rounded-full ${req.met ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-gray-600'}`} />
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

          {/* Confirm Password Input with Toggle */}
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">Confirm Password</span>
            <div className="relative mt-2">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-md border border-white/[0.1] bg-dark-tertiary/50 pl-3 pr-12 text-sm text-white outline-none transition-colors focus:border-cyan-500 focus:bg-dark-tertiary"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] font-semibold tracking-wider text-gray-400 transition-colors hover:text-cyan-400 select-none"
              >
                {showConfirmPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </label>

          <p className="text-[10px] text-gray-400 leading-relaxed pt-2">
            By signing up you agree to our Terms of Service and Privacy Policy. Trading involves substantial risk of loss.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-md bg-cyan-500 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 mt-6"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        Already a member?{' '}
        <Link href="/login" className="text-cyan-400 hover:underline transition-colors hover:text-cyan-300">
          Log in
        </Link>
      </p>
    </motion.div>
  );
}