'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BotSettings {
  botId: number;
  botName: string;
  stopLoss: number;
  takeProfit: number;
  maxDrawdown: number;
  dailyLossLimit: number;
  lotSize: number;
  enabled: boolean;
}

interface UserDetailsModalProps {
  user: {
    id: string;
    email: string;
    fullName: string;
    accountStatus: string;
    mt5Connected: boolean;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const BOT_NAMES: Record<number, string> = {
  1: 'Neural-X Trend',
  2: 'Scalp Alpha',
  3: 'Grid Sentinel',
};

export default function UserDetailsModal({
  user,
  isOpen,
  onClose,
}: UserDetailsModalProps) {
  const [botSettings, setBotSettings] = useState<Record<number, BotSettings>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadBotSettings();
    }
  }, [isOpen, user]);

  const loadBotSettings = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/bots/${user.id}`);
      const data = await response.json();

      if (data.success) {
        // Enhance with bot names
        const enhanced = Object.entries(data.data).reduce(
          (acc, [botId, settings]: [string, any]) => {
            const id = parseInt(botId);
            acc[id] = {
              botId: id,
              botName: BOT_NAMES[id] || `Bot ${id}`,
              ...settings,
            };
            return acc;
          },
          {} as Record<number, BotSettings>
        );
        setBotSettings(enhanced);
      } else {
        setError(data.error || 'Failed to load bot settings');
      }
    } catch (err) {
      console.error('Error loading bot settings:', err);
      setError('Failed to load bot settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Modal */}
      <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl border border-white/[0.1] bg-dark-secondary p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="mb-6 pr-8">
          <h2 className="text-2xl font-semibold text-white">{user.fullName}</h2>
          <p className="mt-1 text-sm text-gray-400">{user.email}</p>
          <div className="mt-3 flex gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              user.accountStatus === 'Active'
                ? 'bg-green-500/10 text-green-400'
                : user.accountStatus === 'Pending Approval'
                ? 'bg-yellow-500/10 text-yellow-400'
                : 'bg-red-500/10 text-red-400'
            }`}>
              {user.accountStatus}
            </span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              user.mt5Connected
                ? 'bg-green-500/10 text-green-400'
                : 'bg-gray-500/10 text-gray-400'
            }`}>
              {user.mt5Connected ? '✓ MT5 Connected' : '✗ MT5 Not Connected'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Trading Bot Configurations
            </h3>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin">
                  <div className="h-8 w-8 rounded-full border-4 border-cyan-500 border-t-transparent"></div>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            ) : Object.keys(botSettings).length > 0 ? (
              <div className="space-y-4">
                {Object.values(botSettings).map((bot) => (
                  <div
                    key={bot.botId}
                    className="rounded-lg border border-white/[0.05] bg-dark-tertiary/30 p-4"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-white">{bot.botName}</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Status:{' '}
                          <span
                            className={
                              bot.enabled
                                ? 'text-green-400 font-medium'
                                : 'text-gray-400 font-medium'
                            }
                          >
                            {bot.enabled ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Settings Grid */}
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                      <div className="rounded-md bg-dark-secondary/50 px-3 py-2">
                        <p className="text-[9px] font-medium uppercase tracking-widest text-gray-400">
                          Stop Loss
                        </p>
                        <p className="mt-1 font-mono text-sm text-white">
                          {bot.stopLoss}%
                        </p>
                      </div>
                      <div className="rounded-md bg-dark-secondary/50 px-3 py-2">
                        <p className="text-[9px] font-medium uppercase tracking-widest text-gray-400">
                          Take Profit
                        </p>
                        <p className="mt-1 font-mono text-sm text-white">
                          {bot.takeProfit}%
                        </p>
                      </div>
                      <div className="rounded-md bg-dark-secondary/50 px-3 py-2">
                        <p className="text-[9px] font-medium uppercase tracking-widest text-gray-400">
                          Max Drawdown
                        </p>
                        <p className="mt-1 font-mono text-sm text-white">
                          {bot.maxDrawdown}%
                        </p>
                      </div>
                      <div className="rounded-md bg-dark-secondary/50 px-3 py-2">
                        <p className="text-[9px] font-medium uppercase tracking-widest text-gray-400">
                          Daily Loss Limit
                        </p>
                        <p className="mt-1 font-mono text-sm text-white">
                          {bot.dailyLossLimit}%
                        </p>
                      </div>
                      <div className="rounded-md bg-dark-secondary/50 px-3 py-2">
                        <p className="text-[9px] font-medium uppercase tracking-widest text-gray-400">
                          Lot Size
                        </p>
                        <p className="mt-1 font-mono text-sm text-white">
                          {bot.lotSize}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-white/[0.05] bg-dark-tertiary/30 p-6 text-center">
                <p className="text-gray-400">
                  No bot configurations found for this user.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 border-t border-white/[0.05] pt-6">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
