'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Plug, Cpu, Bot, TrendingUp, ChevronDown, Shield } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { month: 'D1', value: 120000 },
  { month: 'D5', value: 125000 },
  { month: 'D10', value: 118000 },
  { month: 'D15', value: 132000 },
  { month: 'D20', value: 142850 },
];

const strategies = [
  { name: 'Neural-X Trend', type: 'Trend Following', risk: 'Medium', roi: '+18.4%' },
  { name: 'Scalp Alpha', type: 'Scalping', risk: 'High', roi: '+32.1%' },
  { name: 'Grid Sentinel', type: 'Grid', risk: 'Low', roi: '+9.7%' },
  { name: 'Break Pulse', type: 'Breakout', risk: 'Medium', roi: '+21.2%' },
];

const faqItems = [
  {
    q: 'How does Phantompip connect to my MT5 account?',
    a: 'You provide your broker name, MT5 login, password, and server. Credentials are encrypted at rest and used solely to place trades the bot generates. You retain full custody — funds never leave your broker.',
  },
  {
    q: 'What strategies are available?',
    a: 'Trend following, scalping, grid, and breakout neural models. Each is parameterized — choose risk, stop loss, take profit, daily loss limit, and max drawdown.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'Manual crypto payments in USDT (TRC20), BTC, and our native NTR token. Subscriptions activate after on-chain confirmation.',
  },
  {
    q: 'What happens when my subscription expires?',
    a: 'Bots auto-disable. Open trades remain managed by your broker but no new orders are placed until you renew.',
  },
  {
    q: 'Is my data and capital safe?',
    a: 'Credentials are encrypted, sessions expire, and 2FA is supported. Capital stays at your broker — we never custody funds.',
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Navigation - Sticky */}
      <nav className="sticky top-0 z-40 transition-colors duration-300 border-b border-white/[0.06] bg-dark/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center active" aria-current="page">
            <img src="/phantompip-logo.png" alt="Phantompip" className="h-10 w-auto" />
          </Link>
          <div className="hidden items-center gap-9 md:flex">
            <a href="#strategies" className="text-xs font-medium text-gray-400 hover:text-white transition">
              Strategies
            </a>
            <a href="#terminal" className="text-xs font-medium text-gray-400 hover:text-white transition">
              Terminal
            </a>
            <a href="#pricing" className="text-xs font-medium text-gray-400 hover:text-white transition">
              Pricing
            </a>
            <a href="#faq" className="text-xs font-medium text-gray-400 hover:text-white transition">
              FAQ
            </a>
            <a href="/support" className="text-xs font-medium text-gray-400 hover:text-white transition">
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

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-20"></div>

        <div className="mx-auto grid max-w-6xl gap-16 px-6 pt-20 pb-24 md:pt-28 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pt-32 lg:pb-32">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 backdrop-blur"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex size-1.5 rounded-full bg-blue-500"></span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gray-400">
                Neural engine online · 4.2ms
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-7 text-5xl md:text-6xl font-semibold leading-tight text-white"
            >
              AI-Powered MT5
              <br />
              Trading{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400">
                Automation
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-7 max-w-md text-base leading-relaxed text-gray-400"
            >
              Connect your MT5 account and let neural strategies trade for you 24/7. Institutional execution, transparent performance, zero compromise.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/signup"
                className="group inline-flex h-12 items-center gap-2 rounded-md bg-blue-500 px-6 text-sm font-medium text-white hover:opacity-90 transition"
              >
                Connect MT5 & start trading
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </Link>
              <Link
                href="#terminal"
                className="inline-flex h-12 items-center rounded-md border border-white/[0.08] bg-white/[0.02] px-6 text-sm font-medium text-white hover:bg-white/[0.05] transition"
              >
                View live performance
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/[0.06] pt-6"
            >
              <div>
                <p className="font-mono text-lg font-medium text-white">+24.8%</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-gray-400">Avg ROI</p>
              </div>
              <div>
                <p className="font-mono text-lg font-medium text-white">4.2ms</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-gray-400">Latency</p>
              </div>
              <div>
                <p className="font-mono text-lg font-medium text-white">12,492</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-gray-400">Operators</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Terminal Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[440px]">
              <div className="absolute -inset-8 -z-10 bg-blue-500/10 blur-3xl"></div>
              <div className="border border-white/[0.1] rounded-2xl p-5 bg-white/[0.02] backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex size-2">
                      <span className="absolute size-full animate-ping rounded-full bg-blue-500/60"></span>
                      <span className="relative size-2 rounded-full bg-blue-500"></span>
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gray-400">Terminal · Live</span>
                  </div>
                  <span className="font-mono text-[10px] text-gray-400">04:21 UTC</span>
                </div>

                <div className="mt-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Account equity</p>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="font-mono text-2xl font-semibold">$142,850.22</span>
                    <span className="inline-flex items-center gap-0.5 font-mono text-xs text-blue-400">
                      <ArrowRight className="w-3 h-3 rotate-45" />
                      +4.2%
                    </span>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="mt-4 -mx-1">
                  <ResponsiveContainer width="100%" height={90}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="heroChart" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="#60a5fa" fill="url(#heroChart)" strokeWidth={1.5} />
                      <XAxis dataKey="month" hide />
                      <YAxis hide />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-white/[0.05] bg-dark-tertiary p-3">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400">Win rate</p>
                    <p className="mt-1 font-mono text-sm font-medium text-white">68.2%</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.05] bg-dark-tertiary p-3">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400">Daily PnL</p>
                    <p className="mt-1 font-mono text-sm font-medium text-white">+$2,401</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg border border-white/[0.05] bg-dark-tertiary px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="font-mono text-xs text-white">XAUUSD</span>
                    <span className="rounded-sm bg-blue-500/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-blue-400">
                      Buy
                    </span>
                  </div>
                  <span className="font-mono text-xs text-blue-400">+$412.00</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ticker */}
      <div className="overflow-hidden border-y border-white/[0.05] bg-dark-secondary/50 py-2.5">
        <div className="flex w-max gap-12 whitespace-nowrap px-6 animate-scroll">
          {[
            { symbol: 'BTC/USDT', price: '64,231.50', change: '+1.24%', positive: true },
            { symbol: 'ETH/USDT', price: '3,452.12', change: '+0.82%', positive: true },
            { symbol: 'EUR/USD', price: '1.084', change: '-0.05%', positive: false },
            { symbol: 'XAU/USD', price: '2,341.20', change: '+0.41%', positive: true },
            { symbol: 'SOL/USDT', price: '145.22', change: '-1.40%', positive: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">{item.symbol}</span>
              <span className="font-mono text-xs text-white/80">{item.price}</span>
              <span className={`font-mono text-[10px] ${item.positive ? 'text-blue-400' : 'text-red-400'}`}>
                {item.positive ? '+' : ''}{item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Brokers */}
      <section className="border-y border-white/[0.05] bg-black/30">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-7">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gray-400">Executes on</span>
          {['IC Markets', 'Exness', 'Pepperstone', 'FTMO', 'OANDA', 'FxPro'].map((broker, i) => (
            <span key={i} className="font-mono text-xs uppercase tracking-[0.18em] text-white/50">
              {broker}
            </span>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-white/[0.05]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-white/[0.05] md:grid-cols-4 md:divide-x">
          {[
            { value: '$421.0M', label: 'Assets executed (30d)' },
            { value: '12,492', label: 'Active operators' },
            { value: '+24.8%', label: 'Avg ROI', highlight: true },
            { value: '4.2ms', label: 'Median latency' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="px-6 py-12"
            >
              <p className={`text-3xl md:text-4xl tracking-tight ${stat.highlight ? 'text-blue-400' : 'text-white'}`}>
                <span className="font-mono tabular-nums">{stat.value}</span>
              </p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Terminal Section */}
      <section id="terminal" className="border-b border-white/[0.05]">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:pt-6"
            >
              <div className="max-w-2xl">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-blue-400">Command center</p>
                <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-white">
                  Every position.
                  <br />
                  Every metric.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    One terminal.
                  </span>
                </h2>
                <p className="mt-5 text-sm md:text-base leading-relaxed text-gray-400">
                  Watch your bots execute in real time. Drawdown, equity curve, win rate — surfaced with zero noise.
                </p>
              </div>
              <ul className="mt-10 space-y-3.5 text-sm">
                {[
                  'Real-time P&L and equity curve',
                  'Per-bot drawdown & risk controls',
                  'Trade-by-trade execution log',
                  'Telegram alerts on every fill',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/85">
                    <span className="size-1 rounded-full bg-blue-500"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-6 -z-10 bg-blue-500/10 blur-3xl"></div>
              <div className="border border-white/[0.1] rounded-2xl bg-dark-secondary/50 backdrop-blur overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gray-400">Live terminal</span>
                  </div>
                  <span className="font-mono text-[10px] text-gray-400">IC Markets · 5024188</span>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/[0.05] bg-dark-tertiary p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Equity</p>
                    <p className="mt-2 font-mono text-xl font-semibold text-white">$142,850.22</p>
                    <p className="mt-1 inline-flex items-center gap-0.5 font-mono text-[11px] text-blue-400">
                      <ArrowRight className="w-3 h-3 rotate-45" />
                      +4.2% today
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/[0.05] bg-dark-tertiary p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Daily P&L</p>
                    <p className="mt-2 font-mono text-xl font-semibold text-blue-400">+$2,401.88</p>
                    <p className="mt-1 font-mono text-[11px] text-gray-400">Avg $412/hr</p>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <div className="border border-white/[0.05] rounded-xl p-5 bg-dark-tertiary">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400">Equity Curve · 30D</p>
                        <p className="mt-1 font-mono text-xl text-white">$142,850.22</p>
                      </div>
                      <span className="rounded bg-blue-500/15 px-2 py-0.5 font-mono text-[10px] text-blue-400">+18.4%</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="pnlFill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" stroke="#9ca3af"  tick={false} />
                        <YAxis stroke="#9ca3af" tick={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#60a5fa"
                          fill="url(#pnlFill)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="border-b border-white/[0.05]">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center mb-16"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-blue-400">Infrastructure flow</p>
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-white">
              From signup to autonomous execution in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                three steps
              </span>
              .
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { num: '01', title: 'Secure MT5 link', desc: 'Encrypted credentials. Funds stay with your broker — we never custody capital.', icon: Plug },
              { num: '02', title: 'Configure neural bot', desc: 'Pick a strategy. Set risk, stop loss, take profit, daily caps, max drawdown.', icon: Cpu },
              { num: '03', title: 'Trade 24/7', desc: 'Bots execute autonomously. Monitor P&L, win rate and drawdown from the terminal.', icon: Bot },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="border border-white/[0.1] rounded-xl p-7 bg-dark-secondary/40 backdrop-blur"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue-400">{step.num}</span>
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="mt-8 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-400">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Strategies Section */}
      <section id="strategies" className="relative overflow-hidden border-b border-white/[0.05] bg-dark-secondary/20">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 -right-32 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mb-14"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-blue-400">Neural strategies</p>
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-white">
              Four engines. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Distinct edge.</span>
            </h2>
            <p className="mt-5 text-sm md:text-base leading-relaxed text-gray-400">
              Every strategy is parameterized. Pick risk, set guards, and let the engine handle execution.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {strategies.map((strategy, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="border border-white/[0.1] rounded-xl p-5 bg-dark-secondary/40 backdrop-blur hover:bg-dark-secondary/60 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{strategy.name}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">{strategy.type}</p>
                  </div>
                  <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${strategy.risk === 'High' ? 'text-red-400' : 'text-blue-400'}`}>
                    {strategy.risk}
                  </span>
                </div>
                <div className="mt-6 flex items-end justify-between border-t border-white/[0.05] pt-3">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400">30d ROI</span>
                  <span className="font-mono text-base font-medium text-blue-400">{strategy.roi}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-b border-white/[0.05]">
        <div className="mx-auto max-w-6xl px-6 py-28 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center mb-16"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-blue-400">Subscription</p>
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-white">
              Scale compute as your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">capital grows</span>.
            </h2>
            <p className="mt-5 text-sm md:text-base leading-relaxed text-gray-400">
              USDT (TRC20), BTC, and NTR accepted. Bots auto-disable when subscription lapses.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-md"
          >
            <div className="relative flex flex-col rounded-2xl p-8 border-2 border-blue-500/40 bg-dark-secondary/60 backdrop-blur">
              <span className="absolute -top-2.5 left-8 rounded-full bg-blue-500 px-3 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                Most popular
              </span>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-blue-400">Starter</p>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-mono text-5xl font-semibold">$50</span>
                <span className="text-sm text-gray-400">/month</span>
              </div>
              <p className="mt-3 text-sm text-gray-400">For traders validating their first automated strategy.</p>
              <ul className="mt-8 flex-1 space-y-3 border-t border-white/[0.05] pt-6 text-sm">
                {['1 active bot', 'Up to $10k account size', 'Standard execution', 'Email support'].map(
                  (item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-blue-500"></span>
                      <span className="text-white/85">{item}</span>
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/signup"
                className="mt-10 inline-flex h-11 items-center justify-center rounded-md bg-blue-500 text-sm font-medium text-white hover:opacity-90 transition"
              >
                Choose Starter
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono uppercase tracking-[0.22em] text-gray-400"
          >
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Payments</span>
            {['USDT · TRC20', 'BTC', 'NTR'].map((method, i) => (
              <span key={i} className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1">
                {method}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Referral Section */}
      <section className="border-b border-white/[0.05]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl p-10 md:flex-row md:items-center border border-white/[0.1] bg-dark-secondary/40 backdrop-blur"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-purple-500/10 blur-3xl"></div>
            <div className="flex items-start gap-5">
              <div className="grid size-11 place-items-center rounded-lg border border-purple-500/30 bg-purple-500/10">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Refer traders. Earn forever.</h3>
                <p className="mt-2 max-w-md text-sm text-gray-400">
                  20% recurring on every subscription. Multi-level tracking with on-chain payouts.
                </p>
              </div>
            </div>
            <Link
              href="/signup"
              className="inline-flex h-11 items-center rounded-md bg-purple-600 px-5 text-sm font-medium text-white hover:opacity-90 transition"
            >
              Claim your referral link
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="border-b border-white/[0.05]">
        <div className="mx-auto max-w-3xl px-6 py-28 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mb-12"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-blue-400">FAQ</p>
            <h2 className="mt-5 text-3xl md:text-5xl font-semibold text-white">
              Questions, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">answered</span>.
            </h2>
          </motion.div>

          <div className="divide-y divide-white/[0.05] border-y border-white/[0.05]">
            {faqItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="flex w-full items-center justify-between py-5 text-left hover:text-blue-400 transition"
                >
                  <span className="text-sm font-medium text-white">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="pb-5 text-sm leading-relaxed text-gray-400"
                  >
                    {item.a}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="radial-glow absolute inset-0 opacity-30"></div>
        </div>
        <div className="mx-auto max-w-4xl px-6 py-32 text-center md:py-40">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-semibold text-white"
          >
            Start trading in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">60 seconds</span>.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-6 max-w-md text-base text-gray-400"
          >
            Connect your MT5 account. Pick a strategy. Let the neural engine do the rest.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/signup"
              className="group inline-flex h-12 items-center gap-2 rounded-md bg-cyan-500 px-7 text-sm font-medium text-white hover:opacity-90 transition"
            >
              Connect MT5 & start trading
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center rounded-md border border-white/[0.08] bg-white/[0.02] px-7 text-sm font-medium text-white hover:bg-white/[0.06] transition"
            >
              Log in
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] bg-dark-secondary">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col justify-between gap-10 lg:flex-row">
            <div className="max-w-sm">
              <Link href="/" className="flex items-center">
                <img src="/phantompip-logo.png" alt="Phantompip" className="h-10 w-auto" />
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-gray-400">
                Institutional algorithms for the modern trader. Phantompip is not a financial advisor. All trading involves risk.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-12 text-sm">
              {[
                {
                  title: 'Product',
                  links: ['Strategies', 'Terminal', 'Pricing'],
                },
                {
                  title: 'Company',
                  links: ['About', 'Security', 'Careers'],
                },
                {
                  title: 'Connect',
                  links: ['Discord', 'X / Twitter', 'Support'],
                },
              ].map((section, i) => (
                <div key={i}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-blue-400">{section.title}</p>
                  <ul className="mt-4 space-y-2.5 text-gray-400">
                    {section.links.map((link, j) => (
                      <li key={j}>
                        <a href="#" className="hover:text-white transition">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/[0.05] pt-8 sm:flex-row sm:items-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gray-400">
              © 2026 Phantompip Terminal · All rights reserved
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gray-400">
              Status: <span className="text-cyan-400">Nominal</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
