'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Clock, CheckCircle, XCircle } from 'lucide-react';
import UserDetailsModal from '@/components/UserDetailsModal';

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const userId = searchParams.get('userId');

    if (!userId || users.length === 0) {
      return;
    }

    if (selectedUser?.id === userId && isDetailsModalOpen) {
      return;
    }

    const matchedUser = users.find((entry) => entry.id === userId);
    if (matchedUser) {
      setSelectedUser(matchedUser);
      setIsDetailsModalOpen(true);
    }
  }, [users, searchParams, selectedUser, isDetailsModalOpen]);

  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        u =>
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(u => u.accountStatus === filterStatus);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterStatus]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      const data = await res.json();
      setUsers(data.data?.users || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setIsLoading(false);
    }
  };

  const openUserWorkspace = (user: any) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
    router.replace(`/admin/users?userId=${user.id}`);
  };

  const closeUserWorkspace = () => {
    setIsDetailsModalOpen(false);
    setSelectedUser(null);
    router.replace('/admin/users');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400"><CheckCircle className="h-3 w-3" />Active</span>;
      case 'Pending Approval':
        return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400"><Clock className="h-3 w-3" />Pending</span>;
      case 'Expired':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400"><XCircle className="h-3 w-3" />Expired</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-400"><XCircle className="h-3 w-3" />Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/10 px-3 py-1 text-xs font-medium text-gray-300">{status}</span>;
    }
  };

  const getDaysRemaining = (expiryTime: number) => {
    const days = Math.ceil((expiryTime - Date.now()) / (24 * 60 * 60 * 1000));
    if (days < 0) return '0 days';
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    return `${days} days`;
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-semibold text-white">Users Management</h1>
        <p className="text-gray-400">Manage platform users and their subscriptions</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 rounded-2xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl"
      >
        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-white/[0.1] bg-dark-tertiary/50 py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 outline-none transition-colors focus:border-cyan-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {['all', 'Active', 'Pending Approval', 'Expired', 'Rejected', 'Inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-cyan-500 text-white'
                  : 'border border-white/[0.1] text-gray-300 hover:border-cyan-500/50'
              }`}
            >
              {status === 'all' ? 'All Users' : status}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl border border-white/[0.1] bg-dark-secondary/40 backdrop-blur-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.1]">
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Email</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Paid</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Days Remaining</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">MT5</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Latest Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.1]">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => openUserWorkspace(user)}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-white">{user.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{user.email}</td>
                    <td className="px-6 py-4">{getStatusBadge(user.accountStatus)}</td>
                    <td className="px-6 py-4 text-sm text-white">${(user.paidAmount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={user.daysRemaining > 7 ? 'text-green-400' : user.daysRemaining > 0 ? 'text-yellow-400' : 'text-red-400'}>
                        {getDaysRemaining(user.subscriptionExpiresAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={user.mt5Connected ? 'text-green-400' : 'text-gray-400'}>
                        {user.mt5Connected ? '✓ Connected' : '✗ No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {user.latestPaymentStatus || 'No payments'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-lg border border-white/[0.1] bg-dark-tertiary/30 p-4"
      >
        <p className="text-sm text-gray-400">
          Showing <span className="font-semibold text-white">{filteredUsers.length}</span> of{' '}
          <span className="font-semibold text-white">{users.length}</span> users
        </p>
      </motion.div>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isDetailsModalOpen}
        onClose={closeUserWorkspace}
        onUserUpdated={fetchUsers}
      />
    </div>
  );
}
