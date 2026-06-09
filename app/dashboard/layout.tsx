'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Home, Plug, CreditCard, Settings, Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Verify user access
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error('Not authenticated');
        }
        return res.json();
      })
      .then(data => {
        if (data && data.data && data.data.user) {
          if (data.data.user.isAdmin) {
            router.push('/admin');
          } else {
            setIsLoading(false);
          }
        } else {
          router.push('/login');
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
    // Locked viewport bounds to contain all inner panels neatly
    <div className="flex h-screen w-screen overflow-hidden flex-col md:flex-row bg-dark">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg border border-white/[0.1] bg-dark-secondary/80 text-white backdrop-blur-md"
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative w-64 h-full border-r border-white/10 bg-dark-secondary/40 backdrop-blur-xl transition-transform duration-300 z-40 flex-shrink-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link href="/dashboard" className="flex items-center justify-center">
              <img src="/phantompip-logo.png" alt="Phantompip" className="h-40 w-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4 overflow-y-auto custom-scrollbar">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>

            <Link
              href="/dashboard/mt5"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
            >
              <Plug className="h-5 w-5" />
              MT5 Account
            </Link>

            <Link
              href="/dashboard/subscription"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
            >
              <CreditCard className="h-5 w-5" />
              Subscription
            </Link>

            <Link
              href="/dashboard/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>

          {/* Logout */}
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

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Smart Content Panel Scroll Layer */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 h-full p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}