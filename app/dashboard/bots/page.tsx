'use client';

import { motion } from 'framer-motion';
import { Settings2 } from 'lucide-react';

export default function BotsPage() {
  const bots = [
    {
      id: 1,
      name: 'Neural-X Trend',
      strategy: 'Trend Following',
      risk: 'Medium risk',
      enabled: true,
      config: {
        stopLoss: '1.5%',
        takeProfit: '3%',
        maxDrawdown: '10%',
        dailyLossLimit: '5%',
        lotSize: '0.5',
        account: 'IC Markets · 5024188',
      },
    },
    {
      id: 2,
      name: 'Scalp Alpha',
      strategy: 'Scalping',
      risk: 'High risk',
      enabled: true,
      config: {
        stopLoss: '0.5%',
        takeProfit: '1%',
        maxDrawdown: '8%',
        dailyLossLimit: '4%',
        lotSize: '0.2',
        account: 'Exness · 8842110',
      },
    },
    {
      id: 3,
      name: 'Grid Sentinel',
      strategy: 'Grid',
      risk: 'Low risk',
      enabled: false,
      config: {
        stopLoss: '2%',
        takeProfit: '4%',
        maxDrawdown: '15%',
        dailyLossLimit: '6%',
        lotSize: '0.1',
        account: 'IC Markets · 5024188',
      },
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trading Bots</h1>
        <p className="mt-1 text-sm text-gray-400">
          Enable or disable bots, tune risk and review live parameters.
        </p>
      </div>

      {/* Bots Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {bots.map((bot, index) => (
          <motion.div
            key={bot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="glass rounded-xl p-6 border border-white/[0.05] bg-dark-secondary/40 backdrop-blur-sm"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                {/* Icon and Name */}
                <div className="flex items-center gap-2">
                  <div className="grid size-7 place-items-center rounded-md bg-cyan-500/15">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3.5 text-cyan-400"
                    >
                      <path d="M12 8V4H8"></path>
                      <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                      <path d="M2 14h2"></path>
                      <path d="M20 14h2"></path>
                      <path d="M15 13v2"></path>
                      <path d="M9 13v2"></path>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-white">{bot.name}</p>
                </div>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-gray-400">
                  {bot.strategy} · {bot.risk}
                </p>
              </div>

              {/* Toggle Button */}
              <button
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  bot.enabled ? 'bg-cyan-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${
                    bot.enabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                ></span>
              </button>
            </div>

            {/* Configuration Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              {[
                { label: 'Stop loss', value: bot.config.stopLoss },
                { label: 'Take profit', value: bot.config.takeProfit },
                { label: 'Max drawdown', value: bot.config.maxDrawdown },
                { label: 'Daily loss limit', value: bot.config.dailyLossLimit },
                { label: 'Lot size', value: bot.config.lotSize },
                { label: 'Account', value: bot.config.account },
              ].map((config, idx) => (
                <div
                  key={idx}
                  className="rounded-md border border-white/[0.05] bg-dark-tertiary/30 px-3 py-2"
                >
                  <p className="text-[9px] font-medium uppercase tracking-widest text-gray-400">
                    {config.label}
                  </p>
                  <p className="mt-1 font-mono text-xs text-white">{config.value}</p>
                </div>
              ))}
            </div>

            {/* Configure Button */}
            <button className="mt-6 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-white/[0.1] bg-dark-tertiary/30 text-xs font-medium text-gray-400 hover:bg-dark-tertiary/50 hover:text-white transition-colors">
              <Settings2 className="size-3.5" />
              Configure
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
