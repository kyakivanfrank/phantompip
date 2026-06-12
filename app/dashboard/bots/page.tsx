'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings2 } from 'lucide-react';
import BotConfigModal, { BotConfig } from '@/components/BotConfigModal';
import { useApi } from '@/lib/hooks/useApi';

type BotApiKey = 'neuralXTrend' | 'scalpAlpha' | 'gridSentinel';

type BotApiPayload = {
  botKey: BotApiKey;
  displayName: string;
  style: string;
  riskLevel: string;
  isEnabled: boolean;
  settings?: Partial<BotConfig['config']>;
};

const BOT_KEY_BY_ID: Record<number, BotApiKey> = {
  1: 'neuralXTrend',
  2: 'scalpAlpha',
  3: 'gridSentinel',
};

const BOT_ID_BY_KEY: Record<BotApiKey, number> = {
  neuralXTrend: 1,
  scalpAlpha: 2,
  gridSentinel: 3,
};

const BOT_ORDER: BotApiKey[] = ['neuralXTrend', 'scalpAlpha', 'gridSentinel'];

function mapApiBotToState(
  botKey: BotApiKey,
  apiData: BotApiPayload,
  account: string
): BotConfig {
  const settings = apiData.settings ?? {};

  return {
    id: BOT_ID_BY_KEY[botKey],
    name: apiData.displayName,
    strategy: apiData.style,
    risk: apiData.riskLevel,
    isEnabled: apiData.isEnabled,
    config: {
      stopLoss: settings.stopLoss ?? 0,
      takeProfit: settings.takeProfit ?? 0,
      maxDrawdown: settings.maxDrawdown ?? 0,
      dailyLossLimit: settings.dailyLossLimit ?? 0,
      lotSize: settings.lotSize ?? 0,
      account,
    },
  };
}

export default function BotsPage() {
  const [bots, setBots] = useState<BotConfig[]>([]);

  const [selectedBot, setSelectedBot] = useState<BotConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mt5Account, setMt5Account] = useState<string>('No account currently');
  const { request: apiRequest } = useApi();

  // Load bot settings and mt5 status on mount
  useEffect(() => {
    const loadBotSettings = async () => {
      try {
        setIsLoading(true);
        let accountStr = 'No account currently';
        const mt5Response = await apiRequest('/api/mt5/status', { method: 'GET' });
        if (mt5Response.success && mt5Response.data?.connected) {
          accountStr = `${mt5Response.data.brokerServer} · ${mt5Response.data.mt5LoginId}`;
        }
        setMt5Account(accountStr);

        const response = await apiRequest('/api/bots/settings', { method: 'GET' });

        if (response.success && response.data) {
          const apiBots = response.data as Partial<Record<BotApiKey, BotApiPayload>>;

          setBots(
            BOT_ORDER.map((botKey) => {
              const apiBot = apiBots[botKey];

              if (!apiBot) {
                throw new Error(`Missing bot payload for ${botKey}`);
              }

              return mapApiBotToState(botKey, apiBot, accountStr);
            })
          );
        } else {
          setBots([]);
        }
      } catch (error) {
        console.error('Failed to load bot settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBotSettings();
  }, []);

  // Poll MT5 status periodically so account info shows up on cards as soon as user connects
  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        const mt5Response = await apiRequest('/api/mt5/status', { method: 'GET' });
        if (!mounted) return;
        if (mt5Response.success && mt5Response.data?.connected) {
          const accountStr = `${mt5Response.data.brokerServer} · ${mt5Response.data.mt5LoginId}`;
          setMt5Account(accountStr);
        } else {
          setMt5Account('No account currently');
        }
      } catch (err) {
        // ignore polling failures
      }
    };

    // initial poll
    poll();
    const id = setInterval(poll, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [apiRequest]);

  // When mt5Account changes, ensure bot cards show the updated account string
  useEffect(() => {
    setBots((prev) => prev.map(b => ({ ...b, config: { ...b.config, account: mt5Account } })));
  }, [mt5Account]);

  const handleConfigureClick = (bot: BotConfig) => {
    setSelectedBot(bot);
    setIsModalOpen(true);
  };

  const handleSaveConfig = async (updatedConfig: BotConfig) => {
    setIsSaving(true);
    try {
      const response = await apiRequest(
        `/api/bots/settings/${updatedConfig.id}`,
        {
          method: 'POST',
          body: {
            isEnabled: updatedConfig.isEnabled,
            stopLoss: updatedConfig.config.stopLoss,
            takeProfit: updatedConfig.config.takeProfit,
            maxDrawdown: updatedConfig.config.maxDrawdown,
            dailyLossLimit: updatedConfig.config.dailyLossLimit,
            lotSize: updatedConfig.config.lotSize,
          },
        }
      );

      if (response.success) {
        const botKey = BOT_KEY_BY_ID[updatedConfig.id];
        const savedBot = response.data as BotApiPayload;

        setBots((prevBots) =>
          prevBots.map((b) =>
            b.id === updatedConfig.id
              ? mapApiBotToState(botKey, savedBot, mt5Account)
              : b
          )
        );
        setIsModalOpen(false);
        setSelectedBot(null);
      } else {
        console.error('API error:', response.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to save bot configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

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
        {isLoading
          ? [1, 2, 3].map((n) => (
            <motion.div
              key={`placeholder-${n}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: n * 0.03 }}
              className="glass rounded-xl p-6 border border-white/[0.05] bg-dark-secondary/40 backdrop-blur-sm animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="w-3/4">
                  <div className="h-4 bg-white/5 rounded-md w-40 mb-2" />
                  <div className="h-3 bg-white/3 rounded-md w-32" />
                </div>
                <div className="h-6 w-20 rounded-full bg-white/5" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="rounded-md border border-white/[0.02] bg-white/3/10 px-3 py-2">
                    <div className="h-3 bg-white/5 rounded w-24 mb-2" />
                    <div className="h-4 bg-white/6 rounded w-full" />
                  </div>
                ))}
              </div>
            </motion.div>
          ))
          : bots.map((bot, index) => (
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

                {/* active label */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${bot.isEnabled ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                  <span className={`size-2 rounded-full ${bot.isEnabled ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {bot.isEnabled ? 'Active' : 'Inactive'}
                </div>


              </div>


              <div className="rounded-md border border-white/[0.05] bg-dark-tertiary/30 px-3 mt-4 py-2 text-center"
              >
                <p className="text-[9px] font-medium uppercase tracking-widest text-gray-400">
                  Account
                </p>
                <p className="mt-1 font-mono text-xs text-white">{bot.config.account}</p>
              </div>
              {/* Configuration Grid */}
              < div className="mt-6 grid grid-cols-2 gap-3 text-xs" >
                {
                  [
                    { label: 'Stop loss', value: `${bot.config.stopLoss}%` },
                    { label: 'Take profit', value: `${bot.config.takeProfit}%` },
                    { label: 'Max drawdown', value: `${bot.config.maxDrawdown}%` },
                    { label: 'Daily loss limit', value: `${bot.config.dailyLossLimit}%` },
                    { label: 'Lot size', value: bot.config.lotSize },
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
                  ))
                }
              </div>

              {/* Configure Button */}
              <button
                onClick={() => handleConfigureClick(bot)}
                className="mt-6 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-white/[0.1] bg-dark-tertiary/30 text-xs font-medium text-gray-400 hover:bg-dark-tertiary/50 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                <Settings2 className="size-3.5" />
                Configure
              </button>
            </motion.div>
          ))
        }
      </div >

      {/* Bot Configuration Modal */}
      {
        selectedBot && (
          <BotConfigModal
            bot={selectedBot}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedBot(null);
            }}
            onSave={handleSaveConfig}
            isSaving={isSaving}
          />
        )
      }
    </div >
  );
}
