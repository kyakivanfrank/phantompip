'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Copy, Eye, EyeOff, Clock } from 'lucide-react';

export default function Mt5VaultPage() {
  const [vault, setVault] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchVault();
  }, []);

  const fetchVault = async () => {
    try {
      const res = await fetch('/api/admin/mt5-vault');
      const data = await res.json();
      setVault(data.mt5Vault || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch MT5 vault:', error);
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    const newSet = new Set(visiblePasswords);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setVisiblePasswords(newSet);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="h-12 w-12 rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Key className="h-8 w-8 text-purple-400" />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">MT5 Credentials Vault</h1>
          <p className="mt-2 text-sm text-gray-400">Decrypted MT5 login details for active subscriptions</p>
        </div>
      </div>

      {/* Warning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4"
      >
        <p className="text-sm text-orange-400">
          ⚠️ <strong>CONFIDENTIAL:</strong> This page displays decrypted MT5 credentials. Handle with care and never share.
        </p>
      </motion.div>

      {/* Vault Table */}
      {vault.length > 0 ? (
        <div className="space-y-4">
          {vault.map((item) => (
            <motion.div
              key={item.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl"
            >
              {/* User Info */}
              <div className="mb-6 border-b border-white/[0.1] pb-4">
                <h3 className="text-lg font-semibold text-white">{item.userFullName}</h3>
                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="mt-1 font-mono text-sm text-gray-300">{item.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Subscription Expires</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-gray-300">
                      <Clock className="h-3 w-3" />
                      {item.daysRemaining} days remaining
                    </p>
                  </div>
                </div>
              </div>

              {/* MT5 Credentials */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Login ID */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">MT5 Login ID</p>
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/[0.1] bg-dark-tertiary/50 p-3">
                    <input
                      type="text"
                      value={item.mt5LoginId}
                      readOnly
                      className="flex-1 bg-transparent font-mono text-sm text-white outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(item.mt5LoginId, `login-${item.userId}`)}
                      className="text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {copiedId === `login-${item.userId}` && (
                    <p className="mt-1 text-xs text-green-400">Copied!</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">MT5 Password</p>
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/[0.1] bg-dark-tertiary/50 p-3">
                    <input
                      type={visiblePasswords.has(item.userId) ? 'text' : 'password'}
                      value={item.mt5Password}
                      readOnly
                      className="flex-1 bg-transparent font-mono text-sm text-white outline-none"
                    />
                    <button
                      onClick={() => togglePasswordVisibility(item.userId)}
                      className="text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      {visiblePasswords.has(item.userId) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(item.mt5Password, `password-${item.userId}`)}
                      className="text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {copiedId === `password-${item.userId}` && (
                    <p className="mt-1 text-xs text-green-400">Copied!</p>
                  )}
                </div>

                {/* Server */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">Broker Server</p>
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/[0.1] bg-dark-tertiary/50 p-3">
                    <input
                      type="text"
                      value={item.brokerServer}
                      readOnly
                      className="flex-1 bg-transparent font-mono text-sm text-white outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(item.brokerServer, `server-${item.userId}`)}
                      className="text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Trading Style */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">Trading Style</p>
                  <div className="mt-2 rounded-lg border border-white/[0.1] bg-dark-tertiary/50 p-3">
                    <p className="font-mono text-sm text-white">{item.tradingStyle}</p>
                  </div>
                </div>
              </div>

              {/* Connection Info */}
              <div className="mt-6 border-t border-white/[0.1] pt-4">
                <p className="text-xs text-gray-400">
                  Connected: {new Date(item.connectedAt).toLocaleDateString()} at{' '}
                  {new Date(item.connectedAt).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.1] bg-dark-secondary/40 p-12 text-center backdrop-blur-xl"
        >
          <Key className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-white">No Active MT5 Connections</p>
          <p className="mt-2 text-sm text-gray-400">No users have active MT5 accounts yet</p>
        </motion.div>
      )}
    </div>
  );
}
