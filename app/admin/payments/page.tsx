'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments/pending');
      const data = await res.json();
      setPayments(data.data?.pendingPayments || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setIsLoading(false);
    }
  };

  const handleApprove = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      const res = await fetch('/api/admin/payments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });

      if (res.ok) {
        // Remove from list
        setPayments(payments.filter(p => p.id !== paymentId));
      } else {
        alert('Failed to approve payment');
      }
    } catch (error) {
      alert('Error approving payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      const res = await fetch('/api/admin/payments/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });

      if (res.ok) {
        // Remove from list
        setPayments(payments.filter(p => p.id !== paymentId));
      } else {
        alert('Failed to reject payment');
      }
    } catch (error) {
      alert('Error rejecting payment');
    } finally {
      setActionLoading(null);
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-semibold text-white">Pending Payments</h1>
          <p className="text-gray-400">Review and approve payment submissions</p>
        </motion.div>
        <button
          onClick={fetchPayments}
          className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 transition-colors shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Payments List */}
      {payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map((payment) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="rounded-xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* User Info */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">User</p>
                  <p className="mt-2 font-medium text-white">{payment.userFullName}</p>
                  <p className="text-xs text-gray-400">{payment.userEmail}</p>
                </div>

                {/* Payment Details */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">Payment Method</p>
                  <p className="mt-2 font-medium text-white">{payment.method}</p>
                  <p className="text-xs text-gray-400">
                    Submitted {payment.daysOld} day{payment.daysOld !== 1 ? 's' : ''} ago
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">Amount</p>
                  <p className="mt-2 font-medium text-white">
                    ${payment.amount.toFixed(2)}
                    {payment.originalAmount && payment.originalAmount !== payment.amount && (
                      <span className="ml-2 text-xs text-gray-400 line-through">
                        ${payment.originalAmount.toFixed(2)}
                      </span>
                    )}
                  </p>
                  {payment.couponCode && (
                    <p className="text-xs text-green-400">Coupon: {payment.couponCode}</p>
                  )}
                </div>

                {/* Transaction ID */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">TX ID / Reference</p>
                  <p className="mt-2 break-all rounded-lg border border-white/[0.1] bg-dark-tertiary/50 p-2 font-mono text-xs text-cyan-400">
                    {payment.transactionId}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3 border-t border-white/[0.1] pt-4">
                <button
                  onClick={() => handleApprove(payment.id)}
                  disabled={actionLoading === payment.id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  {actionLoading === payment.id ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleReject(payment.id)}
                  disabled={actionLoading === payment.id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  {actionLoading === payment.id ? 'Rejecting...' : 'Reject'}
                </button>
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
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-white">No Pending Payments</p>
          <p className="mt-2 text-sm text-gray-400">All payment submissions have been reviewed</p>
        </motion.div>
      )}
    </div>
  );
}
