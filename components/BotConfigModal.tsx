'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Toggle from '@/components/ui/Toggle';
import Slider from '@/components/ui/Slider';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export interface BotConfig {
  id: number;
  name: string;
  strategy: string;
  risk: string;
  enabled: boolean;
  config: {
    stopLoss: number;
    takeProfit: number;
    maxDrawdown: number;
    dailyLossLimit: number;
    lotSize: number;
    account: string;
  };
}

interface BotConfigModalProps {
  bot: BotConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: BotConfig) => void;
  isSaving?: boolean;
}

export default function BotConfigModal({
  bot,
  isOpen,
  onClose,
  onSave,
  isSaving = false,
}: BotConfigModalProps) {
  const [config, setConfig] = useState<BotConfig>(bot);

  useEffect(() => {
    setConfig(bot);
  }, [bot, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(config);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Modal Background */}
      <div className="relative w-full max-w-2xl rounded-xl border border-white/[0.1] bg-dark-secondary shadow-2xl my-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="border-b border-white/[0.05] px-6 py-4 sm:px-8 sm:py-6 pr-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">{config.name}</h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-400">
            {config.strategy} · {config.risk}
          </p>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 sm:p-8 space-y-6">
          {/* Bot Status Section */}
          <div className="rounded-lg border border-white/[0.05] bg-dark-tertiary/30 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">Bot Status</p>
                <p className="mt-1 text-xs text-gray-400">
                  Enable or disable this trading bot
                </p>
              </div>
              <Toggle
                checked={config.enabled}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, enabled: checked })
                }
              />
            </div>
          </div>

          {/* Risk Management Section */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Risk Management
            </h3>
            <div className="space-y-4">
              {/* Stop Loss */}
              <div className="rounded-lg border border-white/[0.05] bg-dark-tertiary/30 p-4">
                <Slider
                  min={1}
                  max={100}
                  step={0.1}
                  value={config.config.stopLoss}
                  onValueChange={(value) =>
                    setConfig({
                      ...config,
                      config: { ...config.config, stopLoss: value },
                    })
                  }
                  label="Stop Loss"
                  description="Percentage loss at which position closes automatically"
                  suffix="%"
                />
              </div>

              {/* Take Profit */}
              <div className="rounded-lg border border-white/[0.05] bg-dark-tertiary/30 p-4">
                <Slider
                  min={1}
                  max={100}
                  step={0.1}
                  value={config.config.takeProfit}
                  onValueChange={(value) =>
                    setConfig({
                      ...config,
                      config: { ...config.config, takeProfit: value },
                    })
                  }
                  label="Take Profit"
                  description="Percentage profit at which position closes automatically"
                  suffix="%"
                />
              </div>

              {/* Max Drawdown */}
              <div className="rounded-lg border border-white/[0.05] bg-dark-tertiary/30 p-4">
                <Slider
                  min={1}
                  max={100}
                  step={0.1}
                  value={config.config.maxDrawdown}
                  onValueChange={(value) =>
                    setConfig({
                      ...config,
                      config: { ...config.config, maxDrawdown: value },
                    })
                  }
                  label="Maximum Drawdown"
                  description="Maximum percentage of account loss before stopping"
                  suffix="%"
                />
              </div>

              {/* Daily Loss Limit */}
              <div className="rounded-lg border border-white/[0.05] bg-dark-tertiary/30 p-4">
                <Slider
                  min={1}
                  max={100}
                  step={0.1}
                  value={config.config.dailyLossLimit}
                  onValueChange={(value) =>
                    setConfig({
                      ...config,
                      config: { ...config.config, dailyLossLimit: value },
                    })
                  }
                  label="Daily Loss Limit"
                  description="Maximum percentage loss per trading day"
                  suffix="%"
                />
              </div>
            </div>
          </div>

          {/* Position Sizing Section */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Position Sizing
            </h3>
            <div className="rounded-lg border border-white/[0.05] bg-dark-tertiary/30 p-4">
              <label htmlFor="lotSize" className="text-sm font-medium text-white">
                Lot Size
              </label>
              <p className="mt-1 mb-3 text-xs text-gray-400">
                Trading volume size (e.g., 0.01, 0.5, 1.0)
              </p>
              <Input
                id="lotSize"
                type="number"
                min="0.01"
                max="100"
                step="0.01"
                value={config.config.lotSize}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    config: {
                      ...config.config,
                      lotSize: parseFloat(e.target.value) || 0.01,
                    },
                  })
                }
                placeholder="0.01"
              />
            </div>
          </div>

          {/* Trading Information Section */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Trading Information
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/[0.05] bg-dark-tertiary/30 px-3 py-3">
                <p className="text-[9px] font-medium uppercase tracking-widest text-gray-400">
                  Trading Strategy
                </p>
                <p className="mt-2 font-mono text-xs sm:text-sm text-white">
                  {config.strategy}
                </p>
              </div>
              <div className="rounded-lg border border-white/[0.05] bg-dark-tertiary/30 px-3 py-3">
                <p className="text-[9px] font-medium uppercase tracking-widest text-gray-400">
                  Risk Level
                </p>
                <p className="mt-2 font-mono text-xs sm:text-sm text-white">
                  {config.risk}
                </p>
              </div>
              <div className="rounded-lg border border-white/[0.05] bg-dark-tertiary/30 px-3 py-3 sm:col-span-2">
                <p className="text-[9px] font-medium uppercase tracking-widest text-gray-400">
                  Account
                </p>
                <p className="mt-2 font-mono text-xs sm:text-sm text-white break-all">
                  {config.config.account}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/[0.05] bg-dark-secondary/50 px-6 py-4 sm:px-8 sm:py-6 flex flex-col-reverse sm:flex-row gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSaving}
            fullWidth
            className="text-xs sm:text-sm"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            isLoading={isSaving}
            fullWidth
            className="text-xs sm:text-sm"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>
    </div>
  );
}
