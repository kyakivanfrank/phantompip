'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Users, CreditCard, Key, TrendingUp } from 'lucide-react';
import { AdminMobileBottomNav } from '@/components/AdminMobileBottomNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify admin access by fetching current user
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error('Not authenticated');
        }
        return res.json();
      })
      .then(data => {
        if (data && data.data && data.data.user && (data.data.user.isAdmin === true || data.data.user.isAdmin === "true")) {
          setIsLoading(false);
        } else {
          router.push('/dashboard');
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark">
        <div className="animate-spin">
          <div className="h-12 w-12 rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden flex-col md:flex-row bg-dark">
      {/* Desktop Sidebar - visible on md+ screens, hidden on small screens */}
      <aside className="hidden md:flex fixed md:relative w-64 h-full border-r border-white/10 bg-dark-secondary/40 backdrop-blur-xl z-40 flex-shrink-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link href="/admin" className="flex items-center justify-center">
              <img src="/phantompip-logo.png" alt="Phantompip" className="h-40 w-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4 overflow-y-auto custom-scrollbar">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
            >
              <TrendingUp className="h-5 w-5" />
              Dashboard
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
            >
              <Users className="h-5 w-5" />
              Users
            </Link>

            <Link
              href="/admin/payments"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
            >
              <CreditCard className="h-5 w-5" />
              Payments
            </Link>

            <Link
              href="/admin/mt5-vault"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
            >
              <Key className="h-5 w-5" />
              MT5 Vault
            </Link>
          </nav>

          {/* Admin Footer Section - Desktop only */}
          <div className="border-t border-white/10 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Smart Content Panel - Scroll Layer for both desktop and mobile */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 h-full p-4 sm:p-6 md:p-8 bg-dark">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Component */}
      <AdminMobileBottomNav onLogout={handleLogout} />
    </div>
  );
}
