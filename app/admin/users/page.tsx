'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Trash2, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  accountStatus: 'Active' | 'Pending Approval' | 'Expired' | 'Rejected' | 'Inactive';
  createdAt: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { border: string; bg: string; text: string }> = {
      'Active': { border: 'border-green-500/30', bg: 'bg-green-500/10', text: 'text-green-400' },
      'Pending Approval': { border: 'border-yellow-500/30', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
      'Expired': { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400' },
      'Rejected': { border: 'border-rose-500/30', bg: 'bg-rose-500/10', text: 'text-rose-400' },
      'Inactive': { border: 'border-gray-500/30', bg: 'bg-gray-500/10', text: 'text-gray-400' },
    };

    const style = styles[status] || styles['Inactive'];
    return (
      <span className={`inline-flex items-center rounded-full border ${style.border} ${style.bg} px-2.5 py-1 text-xs font-medium ${style.text}`}>
        {status}
      </span>
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDeleteClick = (userId: string) => {
    setDeletingUserId(userId);
    setDeleteModalOpen(true);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!deletingUserId) return;

    try {
      const res = await fetch(`/api/admin/users/${deletingUserId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== deletingUserId));
        setDeleteModalOpen(false);
        setDeletingUserId(null);
      } else {
        const data = await res.json();
        setDeleteError(data.error || 'Failed to delete user');
      }
    } catch (error) {
      setDeleteError('Error deleting user');
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-semibold text-white">Users Management</h1>
        <p className="text-gray-400">Manage platform users</p>
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
        <div className="flex flex-wrap gap-2">
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

      {/* Users Accordion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-2 rounded-2xl border border-white/[0.1] bg-dark-secondary/40 backdrop-blur-xl overflow-hidden"
      >
        <AnimatePresence mode="popLayout">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b border-white/[0.1] last:border-b-0"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-left">
                      <p className="font-medium text-white">{user.fullName}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(user.accountStatus)}
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        expandedUserId === user.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Accordion Content */}
                <AnimatePresence>
                  {expandedUserId === user.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/[0.1] bg-white/[0.02] px-6 py-4"
                    >
                      <div className="space-y-4">
                        {/* Joined Date */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Joined</p>
                          <p className="mt-1 text-sm text-gray-300">{formatDate(user.createdAt)}</p>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteClick(user.id)}
                          className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-400">
              No users found
            </div>
          )}
        </AnimatePresence>
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="rounded-xl border border-white/[0.1] bg-dark-secondary p-6 max-w-sm mx-4"
            >
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Delete User Account?</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    This action cannot be undone. The user account and all associated data will be permanently deleted.
                  </p>
                  {deleteError && (
                    <p className="mt-2 text-sm text-red-400">{deleteError}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDeletingUserId(null);
                    setDeleteError('');
                  }}
                  className="flex-1 rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2 font-medium text-gray-300 hover:bg-white/[0.1] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
