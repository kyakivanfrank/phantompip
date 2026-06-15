'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Home, Plug, CreditCard, Settings, User, ChevronDown, Bot } from 'lucide-react';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ToastProvider } from '@/components/Toast';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, exact: true },
  { href: '/dashboard/bots', label: 'Bots', icon: Bot },
  { href: '/dashboard/mt5', label: 'MT5 Account', icon: Plug },
  { href: '/dashboard/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => {
        if (data?.data?.user) {
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
      .catch(() => router.push('/login'));
  }, [router]);

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

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark">
        <div className="h-12 w-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const userInitials = userData?.email?.substring(0, 2).toUpperCase() || 'US';

  return (
    <ToastProvider>
      <div className="flex h-screen w-screen overflow-hidden flex-col md:flex-row bg-dark">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex fixed md:relative w-64 h-full border-r border-white/10 bg-dark-secondary/40 backdrop-blur-xl z-40 flex-shrink-0 flex-col">
          <div className="p-6 border-b border-white/10">
            <Link href="/dashboard" className="flex items-center justify-center">
              <img src="/phantompip-logo.png" alt="Phantompip" className="h-40 w-auto" />
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-4 overflow-y-auto custom-scrollbar">
            {NAV_LINKS.map(({ href, icon: Icon, label, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                      : 'text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            {userData && (
              <div className="px-4 py-2 rounded-lg bg-white/5">
                <p className="text-xs text-gray-400 mb-1">Logged in as:</p>
                <p className="text-sm font-medium text-white truncate">{userData.email}</p>
              </div>
            )}
          </div>
        </aside>

        <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
          {/* Top Bar */}
          <header className="w-full border-b border-white/10 bg-dark-secondary/30 backdrop-blur-xl z-30">
            <div className="items-center px-4 md:px-6 justify-between h-16 flex flex-shrink-0 max-w-7xl mx-auto">
              {/* Left */}
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="block md:hidden">
                  <img src="/phantompip-logo.png" alt="Phantompip" className="h-8 w-auto" />
                </Link>
                <div className="hidden sm:flex items-center gap-2">
                  {userData?.subscription?.isActive && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Active Plan
                    </span>
                  )}
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-3" ref={dropdownRef}>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full md:rounded-xl md:bg-white/5 hover:bg-white/10 md:border border-white/5 transition-all focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                      {userInitials}
                    </div>
                    <div className="hidden sm:block max-w-[120px]">
                      <p className="text-xs font-medium text-white truncate">
                        {(userData?.username || userData?.email?.split('@')[0] || 'User').split(' ')[0]}
                      </p>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-dark-secondary/95 backdrop-blur-2xl p-2 shadow-2xl z-50">
                      <div className="px-3 py-2 border-b border-white/5 mb-1">
                        <p className="text-xs text-gray-400 truncate">{userData?.email}</p>
                      </div>

                      <Link
                        href="/dashboard/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        Profile & Settings
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

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto w-full pb-24 md:pb-8">
              {children}
            </div>
          </main>
        </div>

        <MobileBottomNav userData={userData} onLogout={handleLogout} />
      </div>
    </ToastProvider>
  );
}