'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Users, CreditCard, Key, TrendingUp, ChevronDown, CheckCircle } from 'lucide-react';
import { AdminMobileBottomNav } from '@/components/AdminMobileBottomNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Verify admin access and fetch user data for top bar
    fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' })
      .then(res => {
        if (!res.ok) {
          throw new Error('Not authenticated');
        }
        return res.json();
      })
      .then(data => {
        if (data && data.data && data.data.user && (data.data.user.isAdmin === true || data.data.user.isAdmin === "true")) {
          setUserData(data.data.user);
          setIsLoading(false);
        } else {
          router.push('/dashboard');
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

          {/* Admin Footer Section - Desktop only (profile info only; logout moved to top bar) */}
          <div className="border-t border-white/10 p-4">
            {userData && (
              <div className="px-4 py-2 rounded-lg bg-white/5">
                <p className="text-xs text-gray-400 mb-1">Logged in as:</p>
                <p className="text-sm font-medium text-white truncate">{userData.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content container with global top bar */}
      <div className="flex-1 overflow-hidden flex flex-col">

        {/* Global Top Bar - Visible on both Mobile and Desktop */}
        <header className="w-full border-b border-white/10 bg-dark-secondary/30 backdrop-blur-xl z-30">
          <div className="items-center px-3 md:px-0 justify-between h-[73px] flex flex-shrink-0 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="block md:hidden">
                <img src="/phantompip-logo.png" alt="Phantompip" className="h-8 w-auto" />
              </Link>
              <div className="hidden sm:flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Admin
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3" ref={dropdownRef}>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full md:rounded-xl md:bg-white/5 hover:bg-white/10 md:border border-white/5 transition-all text-left focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                    {userData?.email?.substring(0,2).toUpperCase() || 'AD'}
                  </div>
                  <div className="hidden sm:block max-w-[120px]">
                    <p className="text-xs font-medium text-white truncate">{userData?.username || userData?.email?.split('@')[0] || 'Admin'}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-dark-secondary/95 backdrop-blur-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-white/5 mb-1 sm:hidden">
                      <p className="text-xs text-gray-400 truncate">{userData?.email}</p>
                    </div>

                    <Link href="/admin" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      Dashboard
                    </Link>

                    <Link href="/admin/users" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                      <Users className="h-4 w-4 text-gray-400" />
                      Users
                    </Link>

                    <Link href="/admin/payments" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      Payments
                    </Link>

                    <hr className="border-white/5 my-1" />

                    <button
                      onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-4 sm:p-6 md:p-8 bg-dark">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>

      </div>

      {/* Mobile Bottom Navigation Component */}
      <AdminMobileBottomNav />
    </div>
  );
}
