'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Home, Plug, CreditCard, Settings, User, CheckCircle, ChevronDown, MicrowaveIcon } from 'lucide-react';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export default function DashboardLayout({
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
    // Verify user access and save user data for mobile/top nav
    fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' })
      .then(res => {
        if (!res.ok) {
          throw new Error('Not authenticated');
        }
        return res.json();
      })
      .then(data => {
        if (data && data.data && data.data.user) {
          const user = data.data.user;
          if (user.isAdmin) {
            router.push('/admin');
          } else {
            setUserData(user);
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

  // Close user dropdown when clicking outside
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

  // Get first 2 letters of email/name for the profile circle avatar
  const userInitials = userData?.email?.substring(0, 2).toUpperCase() || 'US';

  return (
    <div className="flex h-screen w-screen overflow-hidden flex-col md:flex-row bg-dark">
      {/* Desktop Sidebar - visible on md+ screens */}
      <aside className="hidden md:flex fixed md:relative w-64 h-full border-r border-white/10 bg-dark-secondary/40 backdrop-blur-xl z-40 flex-shrink-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10 flex items-center justify-center h-[73px]">
            <Link href="/dashboard" className="flex items-center justify-center">
              <img src="/phantompip-logo.png" alt="Phantompip" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4 overflow-y-auto custom-scrollbar">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>

            <Link
              href="/dashboard/bots"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
            >
              <MicrowaveIcon className="h-5 w-5" />
              Bots
            </Link>

            <Link
              href="/dashboard/mt5"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
            >
              <Plug className="h-5 w-5" />
              MT5 Account
            </Link>

            <Link
              href="/dashboard/subscription"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
            >
              <CreditCard className="h-5 w-5" />
              Subscription
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>

          {/* User Profile Section - Desktop only bottom fallback */}
          <div className="border-t border-white/10 p-4 space-y-3">
            {userData && (
              <div className="px-4 py-2 rounded-lg bg-white/5">
                <p className="text-xs text-gray-400 mb-1">Logged in as:</p>
                <p className="text-sm font-medium text-white truncate">
                  {userData.email}
                </p>
              </div>
            )}
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

      {/* Main App Window Content Panel Container */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">

        {/* Global Top Bar - Visible on both Mobile and Desktop */}
        <header className="w-full border-b border-white/10 bg-dark-secondary/30 backdrop-blur-xl z-30 ">

          <div className="items-center px-3 md:px-0 justify-between h-[73px] flex flex-shrink-0 max-w-7xl mx-auto">


            {/* Left: Brand Icon/Logo on Mobile only */}
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="block md:hidden">
                <img src="/phantompip-logo.png" alt="Phantompip" className="h-8 w-auto" />
              </Link>

              {/* Status Badges (Hidden on micro-screens, styled for response layout) */}
              <div className="hidden sm:flex items-center gap-2">


                {/* Current Subscription */}
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {userData?.subscriptionType || 'Starter Plan'}
                </span>
              </div>
            </div>

            {/* Right: User Profile Menu Button & Dropdown Container */}
            <div className="flex items-center gap-3" ref={dropdownRef}>
              {/* Minimal Mobile Status Indicator Dots (Shows just colors if layout gets too tight) */}
              <div className="flex hidden items-center gap-1.5 mr-1">
                <div className="h-2 w-2  rounded-full bg-emerald-400" title="Account Approved"></div>
                <div className="h-2 w-2 rounded-full bg-cyan-400" title="Premium Subscription"></div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full md:rounded-xl md:bg-white/5 hover:bg-white/10 md:border border-white/5 transition-all text-left focus:outline-none"
                >
                  {/* Circle Avatar */}
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                    {userInitials}
                  </div>

                  {/* User Username/Email display */}
                  <div className="hidden sm:block max-w-[120px]">
                    <p className="text-xs font-medium text-white truncate">
                      {(userData?.username || userData?.email?.split('@')[0] || 'User').split(' ')[0]}
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Settings and Utilities Context Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-dark-secondary/95 backdrop-blur-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-white/5 mb-1 sm:hidden">
                      <p className="text-xs text-gray-400 truncate">{userData?.email}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Approved</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400">{userData?.subscriptionType || 'Premium'}</span>
                      </div>
                    </div>

                    <Link
                      href="/dashboard/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <User className="h-4 w-4 text-gray-400" />
                      My Profile
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Settings className="h-4 w-4 text-gray-400" />
                      Settings
                    </Link>

                    <hr className="border-white/5 my-1" />

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
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

        {/* Scrollable Main Content Layout Inner Layer */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto w-full pb-24 md:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Component */}
      <MobileBottomNav userData={userData} onLogout={handleLogout} />
    </div>
  );
}