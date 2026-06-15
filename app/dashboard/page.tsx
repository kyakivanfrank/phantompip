'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Clock,
  CreditCard,
  ShieldCheck,
  Activity,
  UserCircle,
  CalendarDays,
  KeyRound,
  Server,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

type DashboardUser = {
  id: string;
  email: string;
  username: string;
  accountStatus: string;
  subscriptionExpiresAt: number;
  mt5Connected: boolean;
  subscription: {
    status: string;
    approvalStatus: string;
    isActive: boolean;
    planName: string;
    billingCycle: string;
    expiryDate: string;
    expiryTimestamp: number;
    remainingDays: number;
    paidAmount: number;
    latestPaymentStatus: string | null;
    latestPaymentMethod: string | null;
    latestPaymentSubmittedAt: string | null;
  };
  mt5: {
    isConnected: boolean;
    loginId: string;
    brokerServer: string;
    connectedAt: string | null;
  };
};

export default function DashboardPage() {
  const [userData, setUserData] = useState<DashboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const meRes = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' });
      const meData = await meRes.json();
      setUserData(meData.data?.user);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  const isSubscriptionActive = userData?.subscription?.isActive === true;
  const isPending = userData?.subscription?.approvalStatus === 'pending';
  const hasMt5 = userData?.mt5?.isConnected && userData?.mt5?.loginId;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* 1. Personalized Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.1] pb-6"
      >
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
            <UserCircle className="h-8 w-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white">
              {userData?.username ? userData.username : 'Trader'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">{userData?.email}</p>
          </div>
        </div>

        {/* Master Account Status Badge */}
        <div className="flex items-center gap-2">
          {isSubscriptionActive ? (
            <span className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" /> Premium Access Active
            </span>
          ) : isPending ? (
            <span className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium">
              <Clock className="h-4 w-4" /> Awaiting Admin Approval
            </span>
          ) : (
            <span className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-medium">
              <ShieldCheck className="h-4 w-4" /> Subscription Required
            </span>
          )}
        </div>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-12">
        
        {/* 2. Personal Board (Subscription & Info Panel) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-7 space-y-6"
        >
          <div>
            <h2 className="text-lg font-medium text-white mb-4">Account Overview</h2>
            
            <div className="bg-dark-secondary/20 border border-white/[0.05] rounded-2xl p-6 space-y-6">
              {userData?.subscription ? (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Plan</p>
                      <p className="text-base font-medium text-white flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-cyan-400" /> {userData.subscription.planName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Billing Cycle</p>
                      <p className="text-base font-medium text-white capitalize">{userData.subscription.billingCycle}</p>
                    </div>
                  </div>

                  <div className="h-px w-full bg-white/[0.05]" />

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Expiry Date</p>
                      <p className="text-base font-medium text-white flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gray-400" /> {userData.subscription.expiryDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Time Remaining</p>
                      <p className={`text-base font-medium ${
                        userData.subscription.remainingDays > 7 ? 'text-green-400' : 
                        userData.subscription.remainingDays > 0 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {userData.subscription.remainingDays} Days
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">No subscription record found. Please activate your account.</p>
              )}

              <div className="pt-2">
                <Link
                  href="/dashboard/subscription"
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                >
                  Manage Subscription →
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3. Live Trading Engine Card (MT5) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-5"
        >
          <h2 className="text-lg font-medium text-white mb-4">Trading Engine</h2>
          
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-dark-secondary/40 p-6 backdrop-blur-xl">
            {/* Background glowing effect if active */}
            {hasMt5 && (
              <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-green-500/10 blur-3xl" />
            )}

            <div className="relative z-10 space-y-6">
              
              {/* Header / Status */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium text-white">MT5 Connection</h3>
                  {hasMt5 ? (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-400 font-medium">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      System is actively trading
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-400">Engine currently offline</p>
                  )}
                </div>
                <Activity className={`h-6 w-6 ${hasMt5 ? 'text-green-400' : 'text-gray-500'}`} />
              </div>

              {/* Credentials Block */}
              {hasMt5 ? (
                <div className="space-y-4 rounded-xl bg-black/20 p-4 border border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <KeyRound className="h-4 w-4 text-cyan-400" />
                    <div>
                      <p className="text-xs text-gray-500">Login ID</p>
                      <p className="text-sm font-mono text-white">{userData.mt5.loginId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Server className="h-4 w-4 text-cyan-400" />
                    <div>
                      <p className="text-xs text-gray-500">Broker Server</p>
                      <p className="text-sm text-white uppercase">{userData.mt5.brokerServer}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-600 p-6 text-center">
                  <AlertCircle className="h-6 w-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 mb-4">No credentials provided.</p>
                  {isSubscriptionActive ? (
                    <Link
                      href="/dashboard/mt5"
                      className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Connect MT5 Account
                    </Link>
                  ) : (
                    <p className="text-xs text-orange-400">Activate subscription to connect MT5.</p>
                  )}
                </div>
              )}

              {/* Footer Action */}
              {hasMt5 && (
                <div className="pt-2">
                  <Link
                    href="/dashboard/mt5"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Update credentials
                  </Link>
                </div>
              )}

            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}