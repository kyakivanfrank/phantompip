'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Copy, Eye, EyeOff, Clock, AlertCircle, CheckCircle, Search } from 'lucide-react';

interface CredentialItem {
  userId: string;
  userEmail: string;
  userFullName: string;
  daysRemaining: number;
  mt5LoginId?: string;
  mt5Password?: string;
  brokerServer?: string;
  hasCredentials: boolean;
  connectedAt?: number;
}

export default function Mt5VaultPage() {
  const [allUsers, setAllUsers] = useState<CredentialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = allUsers.filter(u => 
    u.userFullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchVault();
  }, []);

  const fetchVault = async () => {
    try {
      const res = await fetch('/api/admin/mt5-vault', { cache: 'no-store' });
      const data = await res.json();
      console.log('Fetched MT5 vault data:', data);
      setAllUsers(data.data?.users || []);
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

  const renderCredentialCard = (item: CredentialItem) => (
    <motion.div
      key={item.userId}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-xl border p-6 backdrop-blur-xl ${
        item.hasCredentials
          ? 'border-white/[0.1] bg-dark-secondary/40'
          : 'border-yellow-500/20 bg-yellow-500/5'
      }`}
    >
      {/* User Info */}
      <div className="mb-6 border-b border-white/[0.1] pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{item.userFullName}</h3>
            <p className="mt-2 text-xs text-gray-400">{item.userId}</p>
          </div>
      
        </div>
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

      {/* Status Badge */}
      <div className="mb-4">
        <p className={`inline-flex items-center gap-2 text-sm font-medium ${
          item.hasCredentials ? 'text-green-400' : 'text-yellow-400'
        }`}>
          {item.hasCredentials ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Has Credentials
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              No Credentials
            </>
          )}
        </p>
      </div>

      {/* MT5 Credentials */}
      {item.hasCredentials && (
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
                onClick={() => copyToClipboard(item.mt5LoginId!, `login-${item.userId}`)}
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
                onClick={() => copyToClipboard(item.mt5Password!, `password-${item.userId}`)}
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
                onClick={() => copyToClipboard(item.brokerServer!, `server-${item.userId}`)}
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Info */}
      {item.connectedAt && (
        <div className="mt-6 border-t border-white/[0.1] pt-4">
          <p className="text-xs text-gray-400">
            Connected: {new Date(item.connectedAt).toLocaleDateString()} at{' '}
            {new Date(item.connectedAt).toLocaleTimeString()}
          </p>
        </div>
      )}
    </motion.div>
  );

  const usersWithCreds = filteredUsers.filter(u => u.hasCredentials);
  const usersAwaitingCreds = filteredUsers.filter(u => !u.hasCredentials);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <Key className="h-8 w-8 text-purple-400" />
          <div>
            <h1 className="text-3xl font-semibold text-white">MT5 Credentials Vault</h1>
            <p className="text-gray-400">Manage MT5 connections and pending user setups</p>
          </div>
        </div>
      </motion.div>

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

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by user name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-white/[0.1] bg-dark-secondary/20 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
        />
      </motion.div>

      {filteredUsers.length === 0 && searchQuery ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-8 text-center mt-6"
        >
          <Search className="h-12 w-12 mx-auto text-gray-500/50 mb-3" />
          <p className="text-gray-400">No results found for "{searchQuery}"</p>
        </motion.div>
      ) : (
        <>
          {/* Section 1: Users with Credentials */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <h2 className="text-xl font-semibold text-white">
            Active Connections ({usersWithCreds.length})
          </h2>
        </div>

        {usersWithCreds.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {usersWithCreds.map(item => renderCredentialCard(item))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border border-white/[0.1] bg-dark-secondary/20 p-6 text-center"
          >
            <p className="text-gray-400">No users with MT5 credentials connected yet</p>
          </motion.div>
        )}
      </motion.div>

      {/* Divider */}
      {usersAwaitingCreds.length > 0 && <div className="border-t border-white/[0.1]" />}

          {/* Section 2: Users Without Credentials */}
          {usersAwaitingCreds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <h2 className="text-xl font-semibold text-white">
                  Awaiting Setup ({usersAwaitingCreds.length})
                </h2>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {usersAwaitingCreds.map(item => renderCredentialCard(item))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}