'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Copy, Check, ShieldCheck, Clock, ExternalLink,
  AlertCircle, Send, XCircle, RefreshCw, MessageCircle
} from 'lucide-react';
import { useSpotlight } from '@/lib/hooks';

/* ━━━ Constants ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type NetworkId = 'BTC' | 'BEP20' | 'ERC20';

const ACTIVATION_FEE = 150;
const TELEGRAM_LINK = 'https://t.me/phantompip_community';

const NETWORKS: Record<NetworkId, {
  name: string;
  fullName: string;
  symbol: string;
  description: string;
}> = {
  BTC: {
    name: 'BTC',
    fullName: 'Bitcoin',
    symbol: '₿',
    description: 'Send the displayed payment amount using the Bitcoin network.',
  },
  BEP20: {
    name: 'BEP20',
    fullName: 'BNB Smart Chain (BEP20)',
    symbol: 'B',
    description: 'Send the displayed payment amount using the BEP20 (BSC) network.',
  },
  ERC20: {
    name: 'ERC20',
    fullName: 'Ethereum (ERC20)',
    symbol: 'Ξ',
    description: 'Send the displayed payment amount using the ERC20 network.',
  },
};

const NETWORK_ORDER: NetworkId[] = ['BTC', 'BEP20', 'ERC20'];

/* ━━━ Animation presets ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const fadeUp: any = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

/* ━━━ Helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function timeAgo(isoString: string | null): string {
  if (!isoString) return '';
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDate(isoString: string | null): string {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch { return ''; }
}

/* ━━━ Sub-components ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function PageHeader() {
  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-6 py-4">
      <Link href="/dashboard/activate" className="flex items-center gap-3">
        <img src="/phantompip-logo.png" alt="PhantomPip" className="h-10 w-10 rounded-full object-cover" />
        <span className="text-sm font-semibold tracking-tight text-[--text-1] hidden sm:inline">PHANTOMPIP</span>
      </Link>
      <a
        href={TELEGRAM_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[--text-2]
          bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,.07),0_0_0_1px_rgba(255,255,255,.10)]
          transition-all duration-150 hover:text-white hover:bg-cyan-500/10 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_0_0_1px_rgba(34,211,238,.35),0_0_24px_-6px_rgba(34,211,238,.35)]"
      >
        Telegram
        <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </a>
    </header>
  );
}

/* ── Pending approval view ─────────────────────────────────────── */

function PendingView({ userData, isChecking, onRefresh, activationFee }: {
  userData: any;
  isChecking: boolean;
  onRefresh: () => void;
  activationFee: string | number;
}) {
  const spotlight = useSpotlight();
  const sub = userData?.subscription;

  return (
    <motion.div
      key="pending"
      initial={{ opacity: 0, scale: 0.97, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="glass glass-edge spotlight p-6 md:p-8 space-y-8" {...spotlight}>
        <div className="flex justify-center">
          <img src="/phantompip-logo.png" alt="PhantomPip" className="h-14 w-14 rounded-full object-cover ring-1 ring-white/15" />
        </div>

        {/* Animated pulse rings */}
        <div className="relative mx-auto h-16 w-16">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-cyan-400/25"
              animate={{
                scale: [0.6, 1.6],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.9,
                ease: 'easeOut',
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center ring-2 ring-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,.25)]"
              style={{ height: '2.5rem', width: '2.5rem' }}
            >
              <Clock className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gradient">
            Payment Under Review
          </h1>
          <p className="text-sm text-[--text-2] leading-relaxed max-w-sm mx-auto">
            Your activation payment is being reviewed by our team. This typically takes 1–24 hours.
          </p>
        </div>

        {/* Progress timeline */}
        <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5 space-y-0">

          {/* Step 1: Submitted ✓ */}
          <div className="flex items-start gap-3.5">
            <div className="flex flex-col items-center shrink-0">
              <div className="h-7 w-7 rounded-full bg-green-500/15 flex items-center justify-center ring-1 ring-green-500/40">
                <Check className="h-3.5 w-3.5 text-green-400" />
              </div>
              <div className="w-px h-8 bg-gradient-to-b from-green-500/40 to-cyan-500/40" />
            </div>
            <div className="pb-6 pt-0.5">
              <p className="text-sm font-semibold text-green-400">Payment Submitted</p>
              <p className="text-xs text-[--text-3] mt-0.5">
                {sub?.latestPaymentSubmittedAt ? formatDate(sub.latestPaymentSubmittedAt) : 'Submitted'}
              </p>
            </div>
          </div>

          {/* Step 2: Under Review (active) */}
          <div className="flex items-start gap-3.5">
            <div className="flex flex-col items-center shrink-0">
              <div className="h-7 w-7 rounded-full bg-cyan-500/15 flex items-center justify-center ring-1 ring-cyan-500/40">
                <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <div className="w-px h-8 bg-gradient-to-b from-cyan-500/30 to-white/[0.06]" />
            </div>
            <div className="pb-6 pt-0.5">
              <p className="text-sm font-semibold text-cyan-400">Under Review</p>
              <p className="text-xs text-[--text-3] mt-0.5">Our team is verifying your transaction</p>
            </div>
          </div>

          {/* Step 3: Approved (waiting) */}
          <div className="flex items-start gap-3.5">
            <div className="flex flex-col items-center shrink-0">
              <div className="h-7 w-7 rounded-full bg-white/[0.04] flex items-center justify-center ring-1 ring-white/[0.08]">
                <ShieldCheck className="h-3.5 w-3.5 text-[--text-3]" />
              </div>
            </div>
            <div className="pt-0.5">
              <p className="text-sm font-medium text-[--text-3]">Approved</p>
              <p className="text-xs text-[--text-3] mt-0.5">Awaiting confirmation</p>
            </div>
          </div>
        </div>

        {/* Payment details summary */}
        {(sub?.latestPaymentMethod || sub?.latestPaymentTransactionRef) && (
          <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06] p-4 space-y-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[--text-2]">Payment Details</span>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {sub.latestPaymentMethod && (
                <div>
                  <p className="text-[--text-3] text-xs">Network</p>
                  <p className="font-semibold text-[--text-1]">{sub.latestPaymentMethod}</p>
                </div>
              )}
              <div>
                <p className="text-[--text-3] text-xs">Amount</p>
                <p className="font-mono font-bold tabular-nums text-[--text-1]">${activationFee}</p>
              </div>
              {sub.latestPaymentTransactionRef && (
                <div className="col-span-2">
                  <p className="text-[--text-3] text-xs">Transaction ID</p>
                  <p className="font-mono text-xs text-cyan-400 break-all mt-0.5">{sub.latestPaymentTransactionRef}</p>
                </div>
              )}
              {sub.latestPaymentSubmittedAt && (
                <div className="col-span-2">
                  <p className="text-[--text-3] text-xs">Submitted</p>
                  <p className="text-[--text-2] text-xs">{timeAgo(sub.latestPaymentSubmittedAt)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Telegram support */}
        <div className="text-center space-y-3">
          <p className="text-xs text-[--text-3]">Need help? Join our community for support.</p>
          <a
            href={TELEGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-[--text-2]
              bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,.07),0_0_0_1px_rgba(255,255,255,.10)]
              transition-all duration-150 hover:text-white hover:bg-cyan-500/10 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_0_0_1px_rgba(34,211,238,.35),0_0_24px_-6px_rgba(34,211,238,.35)]
              active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" />
            Join Telegram Community
            <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Auto-refresh indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-[--text-3]">
          <motion.div
            animate={{ rotate: isChecking ? 360 : 0 }}
            transition={{ duration: 0.8, repeat: isChecking ? Infinity : 0, ease: 'linear' }}
          >
            <RefreshCw className="h-3 w-3" />
          </motion.div>
          <span>{isChecking ? 'Checking status...' : 'Auto-checking every 30s'}</span>
          <button
            onClick={onRefresh}
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors ml-1"
          >
            Check now
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Rejected view ─────────────────────────────────────────────── */

function RejectedView({ onRetry }: { onRetry: () => void }) {
  const spotlight = useSpotlight();

  return (
    <motion.div
      key="rejected"
      initial={{ opacity: 0, scale: 0.97, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="glass spotlight p-6 md:p-8 space-y-6" {...spotlight}>
        {/* Icon */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center ring-2 ring-red-500/30 shadow-[0_0_30px_rgba(239,68,68,.2)]">
            <XCircle className="h-10 w-10 text-red-400" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Payment Not Approved
          </h1>
          <p className="text-sm text-[--text-2] leading-relaxed max-w-sm mx-auto">
            Your previous payment could not be verified. This may be due to an incorrect transaction ID or the payment was not received. Please try again with a new payment.
          </p>
        </div>

        {/* Alert */}
        <div className="flex items-start gap-3 rounded-lg bg-red-500/5 ring-1 ring-red-500/20 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-400">What to do next</p>
            <p className="text-[--text-2] mt-1">
              Double-check your payment details and submit a new transaction. If you believe this is an error, contact our support team on Telegram.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRetry}
            className="relative w-full inline-flex h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold text-zinc-950
              bg-gradient-to-b from-cyan-300 to-cyan-500
              shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_0_0_1px_rgba(34,211,238,.5),0_10px_30px_-8px_rgba(6,182,212,.6)]
              transition-all duration-150 hover:from-cyan-200 hover:to-cyan-400 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.5),0_0_0_1px_rgba(103,232,249,.7),0_14px_40px_-8px_rgba(6,182,212,.75)]
              active:translate-y-px active:from-cyan-400 active:to-cyan-600
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <a
            href={TELEGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-[--text-2]
              bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,.07),0_0_0_1px_rgba(255,255,255,.10)]
              transition-all duration-150 hover:text-white hover:bg-cyan-500/10 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_0_0_1px_rgba(34,211,238,.35),0_0_24px_-6px_rgba(34,211,238,.35)]
              active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" />
            Contact Support
            <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

/* ━━━ Main Component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function ActivatePage() {
  const router = useRouter();
  const spotlight = useSpotlight();

  const [pageState, setPageState] = useState<'loading' | 'form' | 'pending' | 'rejected'>('loading');
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkId>('ERC20');
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Fetch user status ──────────────────────────────────────── */

  const fetchStatus = useCallback(async (silent = false) => {
    if (!silent) setIsChecking(true);
    try {
      const [authRes, settingsRes] = await Promise.all([
        fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' }),
        fetch('/api/settings/public', { cache: 'no-store' })
      ]);

      if (!authRes.ok) { router.push('/login'); return; }
      
      const authData = await authRes.json();
      const user = authData?.data?.user;
      
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData?.data || null);
      }
      if (!user) { router.push('/login'); return; }
      if (user.isAdmin) { router.push('/admin'); return; }

      setUserData(user);

      if (user.subscription?.isActive) {
        router.push('/dashboard');
        return;
      }

      const approval = user.subscription?.approvalStatus;
      if (approval === 'pending') {
        setPageState('pending');
      } else if (approval === 'rejected') {
        setPageState('rejected');
      } else {
        setPageState('form');
      }
    } catch {
      router.push('/login');
    } finally {
      setIsChecking(false);
    }
  }, [router]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  /* ── Auto-poll while pending ────────────────────────────────── */

  useEffect(() => {
    if (pageState === 'pending') {
      pollRef.current = setInterval(() => fetchStatus(true), 30000);
      return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }
    return undefined;
  }, [pageState, fetchStatus]);

  /* ── Copy address ───────────────────────────────────────────── */

  const getAddress = (network: NetworkId) => {
    if (network === 'BTC') return settings?.cryptoBtcAddress || '';
    if (network === 'BEP20') return settings?.cryptoBep20Address || '';
    if (network === 'ERC20') return settings?.cryptoErc20Address || '';
    return '';
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(getAddress(selectedNetwork));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Submit payment ─────────────────────────────────────────── */

  const handleSubmit = async () => {
    if (!transactionId.trim()) {
      setError('Please enter your transaction ID');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          transactionId: transactionId.trim(),
          method: selectedNetwork,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setPageState('pending');
          fetchStatus();
        }, 2500);
      } else {
        setError(data.error || 'Failed to submit payment');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Loading ────────────────────────────────────────────────── */

  if (pageState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const net = NETWORKS[selectedNetwork];
  const dynamicAddress = getAddress(selectedNetwork);
  const dynamicFee = settings?.activationFee || ACTIVATION_FEE;

  /* ── Render ─────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen flex flex-col">
      {/* Atmosphere */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-violet-600/[0.12] blur-[100px] md:h-[820px] md:w-[820px] md:blur-[130px]" />
        <div className="absolute -bottom-40 left-[-10%] h-[520px] w-[520px] rounded-full bg-cyan-500/[0.11] blur-[100px] md:h-[820px] md:w-[820px] md:blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,#000_30%,transparent_100%)]" />
        <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_40%,rgba(9,9,11,.85)_100%)]" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <PageHeader />

        <main className="flex-1 flex items-start justify-center px-4 sm:px-6 py-6 sm:py-10 overflow-y-auto">
          <div className="w-full max-w-2xl pb-10">
            <AnimatePresence mode="wait">

              {/* ── Pending ──────────────────────────────────── */}
              {pageState === 'pending' && (
                <PendingView
                  userData={userData}
                  isChecking={isChecking}
                  onRefresh={() => fetchStatus(false)}
                  activationFee={dynamicFee}
                />
              )}

              {/* ── Rejected ─────────────────────────────────── */}
              {pageState === 'rejected' && (
                <RejectedView
                  onRetry={() => {
                    setPageState('form');
                    setTransactionId('');
                    setSubmitSuccess(false);
                    setError('');
                  }}
                />
              )}

              {/* ── Payment form ─────────────────────────────── */}
              {pageState === 'form' && (
                <motion.div
                  key="form"
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                  variants={stagger}
                  className="space-y-6"
                >
                  {/* Welcome */}
                  <motion.div variants={fadeUp} className="text-center sm:text-left">
                    <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[--text-2] mb-2">
                      Phantompip Terminal
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient">
                      Activate your bot
                    </h1>
                    <p className="mt-2 text-sm md:text-base text-[--text-2] leading-relaxed">
                      Choose your payment network and complete your PhantomPip activation.
                    </p>
                  </motion.div>

                  {/* Bot info card */}
                  <motion.section
                    variants={fadeUp}
                    className="glass glass-edge spotlight p-5 md:p-6"
                    {...spotlight}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <img src="/phantompip-logo.png" alt="PhantomPip" className="h-12 w-12 rounded-full object-cover ring-1 ring-white/15" />
                        <div>
                          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[--text-2]">Phantompip</div>
                          <h2 className="text-xl font-semibold tracking-tight">Bot Access</h2>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[--text-2]">Price</div>
                        <div className="text-2xl font-mono font-bold tabular-nums tracking-tight text-brand-glow">${dynamicFee}</div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        'PhantomPip bot access',
                        'Account activation',
                        'Telegram support',
                        'BTC, BEP20 & ERC20',
                      ].map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm text-[--text-2]">
                          <div className="h-5 w-5 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 ring-1 ring-cyan-500/25">
                            <Check className="h-3 w-3 text-cyan-400" />
                          </div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </motion.section>

                  {/* Payment section */}
                  <motion.section
                    variants={fadeUp}
                    className="glass spotlight p-5 md:p-6 space-y-5"
                    {...spotlight}
                  >
                    {/* Section heading */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[--text-2]">Payment</div>
                        <h2 className="text-xl font-semibold tracking-tight mt-0.5">Choose a network</h2>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider ring-1 bg-cyan-500/10 text-cyan-400 ring-cyan-500/25">
                        <ShieldCheck className="h-3 w-3" />
                        Secure
                      </span>
                    </div>

                    {/* Network segmented control */}
                    <div className="flex rounded-full bg-white/[0.04] p-1 ring-1 ring-white/10">
                      {NETWORK_ORDER.map((id) => (
                        <button
                          key={id}
                          onClick={() => setSelectedNetwork(id)}
                          className={`relative flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-150 z-10
                            ${selectedNetwork === id ? 'text-white' : 'text-[--text-2] hover:text-white'}`}
                        >
                          {selectedNetwork === id && (
                            <motion.div
                              layoutId="network-thumb"
                              className="absolute inset-0 rounded-full bg-white/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,.1)]"
                              transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                            />
                          )}
                          <span className="relative z-10">{id}</span>
                        </button>
                      ))}
                    </div>

                    {/* Network details panel */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedNetwork}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-4"
                      >
                        {/* Network info tile */}
                        <div className="flex items-center gap-4 rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06] p-4">
                          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-lg font-bold text-cyan-400 ring-1 ring-white/10 shrink-0">
                            {net.symbol}
                          </div>
                          <div className="min-w-0">
                            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[--text-2]">{net.name}</div>
                            <h3 className="text-base font-semibold">{net.fullName}</h3>
                            <p className="text-sm text-[--text-2] mt-0.5">{net.description}</p>
                          </div>
                        </div>

                        {/* Payment address */}
                        <div className="space-y-2">
                          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[--text-2]">Payment address</span>
                          <div className="flex gap-2">
                            <div className="flex-1 overflow-hidden rounded-md bg-white/[0.04] px-3 py-2.5 font-mono text-sm text-[--text-1] ring-1 ring-white/[0.10] select-all break-all leading-relaxed">
                              {dynamicAddress}
                            </div>
                            <button
                              onClick={copyAddress}
                              type="button"
                              className="shrink-0 rounded-md px-3.5 text-[--text-2] hover:bg-white/[0.06] hover:text-white transition-all duration-150 ring-1 ring-white/[0.10]
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]"
                            >
                              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="flex items-center justify-between rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06] px-4 py-3">
                          <span className="text-sm text-[--text-2]">Amount to pay</span>
                          <span className="text-lg font-mono font-bold tabular-nums tracking-tight">${dynamicFee}</span>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Transaction ID */}
                    <div className="space-y-2">
                      <label htmlFor="activate-tx-id" className="font-mono text-[11px] uppercase tracking-[0.18em] text-[--text-2]">
                        Transaction ID
                      </label>
                      <input
                        id="activate-tx-id"
                        type="text"
                        value={transactionId}
                        onChange={(e) => { setTransactionId(e.target.value); setError(''); }}
                        placeholder="Paste your transaction ID here"
                        autoComplete="off"
                        className="h-11 w-full rounded-md bg-white/[0.04] px-3 text-sm text-[--text-1] placeholder:text-[--text-3] font-mono
                          shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(255,255,255,.10)]
                          outline-none transition-all duration-150
                          hover:shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(255,255,255,.18)]
                          focus:bg-white/[0.06] focus:shadow-[inset_0_1px_2px_rgba(0,0,0,.4),0_0_0_1px_rgba(34,211,238,.9),0_0_0_4px_rgba(34,211,238,.15)]"
                      />
                    </div>

                    {/* Error alert */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-center gap-2 rounded-md bg-red-500/10 px-3 py-2.5 text-sm text-red-400 ring-1 ring-red-500/25">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Success alert */}
                    <AnimatePresence>
                      {submitSuccess && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-center gap-2 rounded-md bg-green-500/10 px-3 py-2.5 text-sm text-green-400 ring-1 ring-green-500/25">
                            <Check className="h-4 w-4 shrink-0" />
                            Payment submitted successfully. Redirecting to review status...
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit button */}
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || submitSuccess}
                      type="button"
                      className="relative w-full inline-flex h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold text-zinc-950
                        bg-gradient-to-b from-cyan-300 to-cyan-500
                        shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_0_0_1px_rgba(34,211,238,.5),0_10px_30px_-8px_rgba(6,182,212,.6)]
                        transition-all duration-150 hover:from-cyan-200 hover:to-cyan-400 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.5),0_0_0_1px_rgba(103,232,249,.7),0_14px_40px_-8px_rgba(6,182,212,.75)]
                        active:translate-y-px active:from-cyan-400 active:to-cyan-600
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]
                        disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 rounded-full border-2 border-zinc-950/30 border-t-zinc-950 animate-spin" />
                          Submitting...
                        </>
                      ) : submitSuccess ? (
                        <>
                          <Check className="h-4 w-4" />
                          Submitted
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          I&apos;ve made the payment
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-[--text-3]">
                      Select a network above to view its payment address.
                    </p>
                  </motion.section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
