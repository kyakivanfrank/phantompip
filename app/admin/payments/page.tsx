'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, RefreshCw, Copy, Check, AlertCircle, Calendar, Search } from 'lucide-react';

interface Payment {
  id: string;
  userFullName: string;
  userEmail: string;
  method: string;
  daysOld: number;
  amount: number;
  transactionId: string;
}

interface Subscription {
  userId: string;
  userFullName: string;
  userEmail: string;
  expiryDate: string;
  daysRemaining: number;
  paidAmount: number;
}

type ActionType = 'approve' | 'reject' | 'extend' | 'ban' | null;

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionTracking, setActionTracking] = useState<{ id: string; type: ActionType } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState<{ [key: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrderPending, setSortOrderPending] = useState<'desc' | 'asc'>('desc');
  const [sortOrderSubs, setSortOrderSubs] = useState<'desc' | 'asc'>('desc');
  
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const filteredPending = [...pendingPayments].filter(p => 
    p.userFullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    // Sort by daysOld
    return sortOrderPending === 'desc' ? a.daysOld - b.daysOld : b.daysOld - a.daysOld;
  });

  const filteredSubscriptions = [...subscriptions].filter(s => 
    s.userFullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    // Sort by daysRemaining
    return sortOrderSubs === 'desc' ? b.daysRemaining - a.daysRemaining : a.daysRemaining - b.daysRemaining;
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pendingRes, allUsersRes] = await Promise.all([
        fetch('/api/admin/payments/pending', { cache: 'no-store' }),
        fetch('/api/admin/users', { cache: 'no-store' }),
      ]);

      const pendingData = await pendingRes.json();
      const usersData = await allUsersRes.json();

      setPendingPayments(pendingData.data?.pendingPayments || []);
      setSelectedPayments(new Set()); // Reset selections

      // Build subscriptions list from users
      const subs = (usersData.data?.users || [])
        .filter((u: any) => u.accountStatus === 'Active')
        .map((u: any) => ({
          userId: u.id,
          userFullName: u.fullName,
          userEmail: u.email,
          expiryDate: new Date(u.subscriptionExpiresAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          daysRemaining: Math.ceil((u.subscriptionExpiresAt - Date.now()) / (24 * 60 * 60 * 1000)),
          paidAmount: u.paidAmount || 0,
        }));

      setSubscriptions(subs);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentAction = async (paymentId: string, action: 'approve' | 'reject') => {
    if (actionTracking) return;

    setActionTracking({ id: paymentId, type: action });

    try {
      const res = await fetch(`/api/admin/payments/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });

      if (res.ok) {
        setPendingPayments(prev => prev.filter(p => p.id !== paymentId));
        setSelectedPayments(prev => {
          const newSet = new Set(prev);
          newSet.delete(paymentId);
          return newSet;
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to ${action} payment: ${errorData.error || 'Server rejected request'}`);
      }
    } catch (error) {
      alert(`Network error during payment ${action} sequence.`);
    } finally {
      setActionTracking(null);
    }
  };

  const togglePaymentSelection = (id: string) => {
    setSelectedPayments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleAllPayments = () => {
    if (selectedPayments.size === filteredPending.length && filteredPending.length > 0) {
      setSelectedPayments(new Set());
    } else {
      setSelectedPayments(new Set(filteredPending.map(p => p.id)));
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedPayments.size === 0) return;
    setIsBulkProcessing(true);
    
    try {
      const promises = Array.from(selectedPayments).map(paymentId =>
        fetch(`/api/admin/payments/${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        })
      );
      
      const results = await Promise.all(promises);
      const failed = results.filter(r => !r.ok);
      
      if (failed.length > 0) {
        alert(`${failed.length} out of ${selectedPayments.size} ${action}s failed.`);
      }
      
      setPendingPayments(prev => prev.filter(p => !selectedPayments.has(p.id)));
      setSelectedPayments(new Set());
    } catch (error) {
      alert(`Network error during bulk ${action}.`);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleSubscriptionAction = async (userId: string, action: 'extend' | 'ban') => {
    if (actionTracking) return;

    setActionTracking({ id: userId, type: action });

    try {
      const days = action === 'extend' ? parseInt(extendDays[userId] || '30') : 0;

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action === 'extend' ? 'extendSubscription' : 'expireSubscription',
          days,
        }),
      });

      if (res.ok) {
        if (action === 'extend') {
          setExtendDays(prev => {
            const newDays = { ...prev };
            delete newDays[userId];
            return newDays;
          });
        }
        // Refresh subscriptions
        await fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to ${action} subscription: ${errorData.error || 'Server rejected request'}`);
      }
    } catch (error) {
      alert(`Network error during subscription ${action} sequence.`);
    } finally {
      setActionTracking(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="h-12 w-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Payments & Subscriptions</h1>
          <p className="mt-1 text-sm text-gray-400">Manage pending approvals and active subscriptions</p>
        </div>

        <button
          onClick={fetchData}
          disabled={!!actionTracking || isBulkProcessing}
          className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/20 transition-all disabled:opacity-40"
        >
          <RefreshCw className={`h-4 w-4 ${actionTracking || isBulkProcessing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 rounded-lg border border-white/[0.1] bg-dark-secondary/20 p-1"
      >
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Approval
            {pendingPayments.length > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-yellow-500/30 text-xs font-semibold text-yellow-400">
                {pendingPayments.length}
              </span>
            )}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            Active Subscriptions
            {subscriptions.length > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-500/30 text-xs font-semibold text-green-400">
                {subscriptions.length}
              </span>
            )}
          </div>
        </button>
      </motion.div>

      {/* Search Bar & Sort Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap items-center gap-4 justify-between"
      >
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/[0.1] bg-dark-secondary/20 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-rose-500/50 focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all"
          />
        </div>
        
        <button
          onClick={() => {
            if (activeTab === 'pending') setSortOrderPending(sortOrderPending === 'desc' ? 'asc' : 'desc');
            else setSortOrderSubs(sortOrderSubs === 'desc' ? 'asc' : 'desc');
          }}
          className="rounded-lg border border-white/[0.1] bg-dark-tertiary/50 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:border-rose-500/50 flex items-center gap-2"
        >
          Sort: {(activeTab === 'pending' ? sortOrderPending : sortOrderSubs) === 'desc' ? 'Newest First ↓' : 'Oldest First ↑'}
        </button>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'pending' && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {filteredPending.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-dark-secondary/60 p-4 mb-4 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedPayments.size > 0 && selectedPayments.size === filteredPending.length}
                    onChange={toggleAllPayments}
                    className="h-4 w-4 rounded border-gray-600 bg-black/50 text-rose-500 focus:ring-rose-500 focus:ring-offset-gray-900 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-300">
                    {selectedPayments.size} selected
                  </span>
                </div>
                {selectedPayments.size > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAction('approve')}
                      disabled={isBulkProcessing || !!actionTracking}
                      className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/20 disabled:opacity-40 transition-all"
                    >
                      {isBulkProcessing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                      Approve Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('reject')}
                      disabled={isBulkProcessing || !!actionTracking}
                      className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition-all"
                    >
                      {isBulkProcessing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                      Reject Selected
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {filteredPending.length > 0 ? (
              filteredPending.map((payment) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative rounded-xl border transition-all duration-200 bg-dark-secondary/40 p-6 backdrop-blur-xl ${
                    selectedPayments.has(payment.id) ? 'border-rose-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-white/[0.08]'
                  }`}
                >
                  <div className="absolute top-6 left-6">
                    <input
                      type="checkbox"
                      checked={selectedPayments.has(payment.id)}
                      onChange={() => togglePaymentSelection(payment.id)}
                      className="h-4 w-4 rounded border-gray-600 bg-black/50 text-rose-500 focus:ring-rose-500 focus:ring-offset-gray-900 cursor-pointer"
                    />
                  </div>
                  
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 pl-8 sm:pl-10">
                    {/* User */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">User</p>
                      <p className="mt-2 font-bold text-white text-base">{payment.userFullName}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{payment.userEmail}</p>
                    </div>

                    {/* Method */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Payment Method</p>
                      <p className="mt-2 font-bold text-rose-400 text-base">{payment.method}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Submitted {payment.daysOld} day{payment.daysOld !== 1 ? 's' : ''} ago</p>
                    </div>

                    {/* Amount */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Amount</p>
                      <div className="mt-2 flex flex-col">
                        <span className="text-lg font-mono font-bold text-white">${payment.amount.toFixed(2)}</span>
                        <span className="text-[10px] text-yellow-500/80 leading-tight mt-1">Verify on explorer that they sent this equivalent</span>
                      </div>
                    </div>

                    {/* Transaction ID */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">TX ID (Click to Verify)</p>
                      <div className="mt-2 relative flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-black/30 p-2 font-mono text-xs text-rose-300">
                        <a 
                          href={
                          payment.method === 'BTC' ? `https://mempool.space/tx/${payment.transactionId}` :
                          payment.method === 'ERC20' ? `https://etherscan.io/tx/${payment.transactionId}` :
                          `https://bscscan.com/tx/${payment.transactionId}`
                        }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all flex-1 pr-8 selection:bg-rose-500/30 hover:underline hover:text-rose-200"
                        >
                          {payment.transactionId}
                        </a>
                        <button
                          onClick={() => copyToClipboard(payment.transactionId, payment.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white transition-colors bg-black/50 rounded-md backdrop-blur-sm"
                        >
                          {copiedId === payment.id ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex gap-4 border-t border-white/[0.06] pt-4 pl-8 sm:pl-10">
                    <button
                      onClick={() => handlePaymentAction(payment.id, 'approve')}
                      disabled={!!actionTracking || isBulkProcessing}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                        actionTracking?.id === payment.id && actionTracking?.type === 'approve'
                          ? 'bg-green-500/30 text-green-200 cursor-not-allowed'
                          : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 disabled:opacity-40'
                      }`}
                    >
                      <CheckCircle className="h-4 w-4" />
                      {actionTracking?.id === payment.id && actionTracking?.type === 'approve' ? 'Processing...' : 'Approve'}
                    </button>

                    <button
                      onClick={() => handlePaymentAction(payment.id, 'reject')}
                      disabled={!!actionTracking || isBulkProcessing}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                        actionTracking?.id === payment.id && actionTracking?.type === 'reject'
                          ? 'bg-red-500/30 text-red-200 cursor-not-allowed'
                          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-40'
                      }`}
                    >
                      <XCircle className="h-4 w-4" />
                      {actionTracking?.id === payment.id && actionTracking?.type === 'reject' ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-8 text-center"
              >
                {searchQuery ? (
                  <>
                    <Search className="h-12 w-12 mx-auto text-gray-500/50 mb-3" />
                    <p className="text-gray-400">No results found for "{searchQuery}"</p>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500/50 mb-3" />
                    <p className="text-gray-400">No pending payments to review</p>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {filteredSubscriptions.length > 0 ? (
              filteredSubscriptions.map((sub) => (
                <motion.div
                  key={sub.userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-white/[0.08] bg-dark-secondary/40 p-6 backdrop-blur-xl"
                >
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {/* User */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">User</p>
                      <p className="mt-2 font-bold text-white text-base">{sub.userFullName}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{sub.userEmail}</p>
                    </div>

                    {/* Expiry */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Expiry Date</p>
                      <p className="mt-2 font-bold text-white text-base">{sub.expiryDate}</p>
                      <p className={`text-xs mt-0.5 ${sub.daysRemaining > 7 ? 'text-green-400' : sub.daysRemaining > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {sub.daysRemaining} days remaining
                      </p>
                    </div>

                    {/* Amount Paid */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Amount Paid</p>
                      <p className="mt-2 text-lg font-mono font-bold text-white">${sub.paidAmount.toFixed(2)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max="365"
                          placeholder="Days"
                          value={extendDays[sub.userId] || '30'}
                          onChange={(e) => setExtendDays(prev => ({ ...prev, [sub.userId]: e.target.value }))}
                          className="flex-1 rounded-lg border border-white/[0.1] bg-dark-tertiary/50 px-2 py-1.5 text-xs text-white placeholder:text-gray-500 outline-none focus:border-rose-500/50"
                        />
                        <button
                          onClick={() => handleSubscriptionAction(sub.userId, 'extend')}
                          disabled={!!actionTracking}
                          className={`flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            actionTracking?.id === sub.userId && actionTracking?.type === 'extend'
                              ? 'bg-rose-500/30 text-rose-200 cursor-not-allowed'
                              : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 disabled:opacity-40'
                          }`}
                        >
                          Extend
                        </button>
                      </div>
                      <button
                        onClick={() => handleSubscriptionAction(sub.userId, 'ban')}
                        disabled={!!actionTracking}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                          actionTracking?.id === sub.userId && actionTracking?.type === 'ban'
                            ? 'bg-red-500/30 text-red-200 cursor-not-allowed'
                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-40'
                        }`}
                      >
                        ban user from system
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-8 text-center"
              >
                {searchQuery ? (
                  <>
                    <Search className="h-12 w-12 mx-auto text-gray-500/50 mb-3" />
                    <p className="text-gray-400">No results found for "{searchQuery}"</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-500/50 mb-3" />
                    <p className="text-gray-400">No active subscriptions</p>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
