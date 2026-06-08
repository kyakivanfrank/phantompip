'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageCircle, Copy, ChevronRight } from 'lucide-react';

const supportTopics = [
  {
    title: 'Payment sent but account not activated',
    content: 'Head to /subscribe, paste your transaction ID, and click "I\'ve sent payment". An admin will activate your account within a few hours.',
    link: '/subscribe'
  },
  {
    title: 'MT5 won\'t connect',
    content: 'Double-check broker, login (account number), server name, and that the investor/master password is correct. You can re-link the account from your dashboard under the MT5 tab.',
  },
  {
    title: 'Forgot password',
    content: 'Use the password reset flow to receive a reset link by email.',
    link: '/forgot-password'
  },
  {
    title: 'Wrong network for crypto payment',
    content: 'USDT must be sent on Tron (TRC20) only. Sending on ERC20, BEP20, Polygon, Solana, or any other network results in permanent loss of funds.',
  },
];

export default function Support() {
  const [openTopic, setOpenTopic] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@phantompip.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    // form submission handling goes here
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Navigation - Sticky */}
      <nav className="sticky top-0 z-40 transition-colors duration-300 border-b border-white/[0.06] bg-dark/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center active" aria-current="page">
            <img src="/phantompip-logo.png" alt="Phantompip" className="h-10 w-auto" />
          </Link>
          <div className="hidden items-center gap-9 md:flex">
            <a href="/#strategies" className="text-xs font-medium text-gray-400 hover:text-white transition">
              Strategies
            </a>
            <a href="/#terminal" className="text-xs font-medium text-gray-400 hover:text-white transition">
              Terminal
            </a>
            <a href="/#pricing" className="text-xs font-medium text-gray-400 hover:text-white transition">
              Pricing
            </a>
            <a href="/#faq" className="text-xs font-medium text-gray-400 hover:text-white transition">
              FAQ
            </a>
            <a href="/support" className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition">
              Support
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-xs font-medium text-gray-400 hover:text-white sm:inline transition">
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-8 items-center rounded-md bg-cyan-500 px-3.5 text-xs font-medium text-white hover:opacity-90 transition"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-20"></div>

        <div className="mx-auto max-w-2xl px-6 py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex items-center justify-between"
          >
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition">
              <ArrowLeft className="size-3.5" />
              Back
            </Link>
            <Link href="/" className="flex items-center">
              <img src="/phantompip-logo.png" alt="Phantompip" className="h-8 w-auto" />
            </Link>
            <div className="w-12"></div>
          </motion.div>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12 text-center"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400">Support</p>
            <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-white">How can we help?</h1>
            <p className="mt-2 text-sm text-gray-400">Chat live with our team below. Typical reply within a few hours.</p>
          </motion.div>

          {/* Live Chat Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 overflow-hidden rounded-2xl border border-white/[0.1] bg-dark-secondary/40 backdrop-blur"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-white/[0.1] bg-cyan-500/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-white">Live chat</span>
              </div>
            </div>

            {/* Chat Form */}
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <p className="text-xs text-gray-400">Start a conversation with our support team. Replies appear here in real time.</p>
              
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-gray-400">Your name</label>
                <input
                  required
                  maxLength={80}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 w-full rounded-md border border-white/[0.1] bg-dark px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-500 transition"
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-gray-400">Email (optional)</label>
                <input
                  type="email"
                  maxLength={255}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2 w-full rounded-md border border-white/[0.1] bg-dark px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-500 transition"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={!formData.name}
                className="w-full rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition"
              >
                Start chat
              </button>
            </form>
          </motion.div>

          {/* Direct Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-4">Or reach us directly</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Email */}
              <a
                href="mailto:support@phantompip.com"
                className="group rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-4 hover:border-cyan-500/30 transition"
              >
                <div className="flex items-center gap-2 text-cyan-400">
                  <Mail className="size-4" />
                  <span className="font-mono text-[10px] uppercase tracking-widest">Email</span>
                </div>
                <p className="mt-3 font-mono text-xs text-white break-all">support@phantompip.com</p>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="mt-2 inline-flex items-center gap-1 text-[10px] text-gray-400 hover:text-white transition"
                >
                  <Copy className="size-3" />
                  {copied ? 'copied' : 'copy'}
                </button>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/phantompip"
                target="_blank"
                rel="noreferrer"
                className="group rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-4 hover:border-cyan-500/30 transition"
              >
                <div className="flex items-center gap-2 text-cyan-400">
                  <MessageCircle className="size-4" />
                  <span className="font-mono text-[10px] uppercase tracking-widest">Telegram</span>
                </div>
                <p className="mt-3 font-mono text-xs text-white">@phantompip</p>
                <p className="mt-2 text-[10px] text-gray-400">Join our community for updates</p>
              </a>
            </div>
          </motion.div>

          {/* Common Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-4">Common topics</p>
            <div className="space-y-3">
              {supportTopics.map((topic, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="rounded-lg border border-white/[0.1] bg-dark-secondary/40 overflow-hidden hover:border-white/[0.2] transition"
                >
                  <button
                    onClick={() => setOpenTopic(openTopic === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition"
                  >
                    <span className="text-sm font-medium text-white">{topic.title}</span>
                    <ChevronRight
                      className={`w-4 h-4 text-cyan-400 transition-transform ${openTopic === i ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {openTopic === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/[0.1] px-4 py-3 text-sm leading-relaxed text-gray-400"
                    >
                      {topic.content}
                      {topic.link && (
                        <Link href={topic.link} className="text-cyan-400 hover:text-cyan-300 ml-1">
                          {topic.link}
                        </Link>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 text-center text-xs text-gray-400"
          >
            Have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition">
              Log in
            </Link>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
