'use client';

import { motion } from 'framer-motion';
import { Home, Cpu, BarChart, Wallet, Settings, LogOut, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, href: '/dashboard' },
    { id: 'bots', label: 'Bots', icon: Cpu, href: '/dashboard/bots' },
    { id: 'trades', label: 'Trades', icon: BarChart, href: '/dashboard/mt5' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, href: '/dashboard/subscription' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  // Determine active nav based on current pathname
  const getActiveNav = () => {
    if (pathname.includes('/dashboard/bots')) return 'bots';
    if (pathname.includes('/dashboard/mt5')) return 'trades';
    if (pathname.includes('/dashboard/subscription')) return 'wallet';
    if (pathname.includes('/dashboard/settings')) return 'settings';
    return 'home';
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-dark text-white md:flex-row">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]"></div>
        <div className="absolute bottom-0 right-0 size-[420px] translate-x-1/3 rounded-full bg-blue-500/10 blur-[120px]"></div>
      </div>

      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/[0.1] bg-dark-secondary/40 backdrop-blur-xl md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center px-6">
          <a href="/" aria-label="Phantompip" className="flex items-center gap-2">
            <img src="/phantompip-logo.png" alt="Phantompip" className="h-8 w-auto" />
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = getActiveNav() === item.id;
            return (
              <motion.a
                key={item.id}
                href={item.href}
                className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400'
                    : 'text-gray-400 hover:bg-dark-tertiary/50 hover:text-white'
                }`}
                whileHover={{ x: 4 }}
              >
                <Icon className="size-4" />
                {item.label}
              </motion.a>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3">
          <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-dark-tertiary/50 hover:text-red-400">
            <LogOut className="size-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.1] bg-dark-secondary/60 px-4 backdrop-blur-xl md:px-8">
          {/* Logo for mobile */}
          <div className="flex items-center gap-3 md:hidden">
            <img src="/phantompip-logo.png" alt="Phantompip" className="h-6 w-auto" />
          </div>

          {/* Status badge */}
          <div className="hidden items-center gap-2 md:flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-3 py-1">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan-500 opacity-60"></span>
                <span className="relative inline-flex size-2 rounded-full bg-cyan-500"></span>
              </span>
              <span className="text-[11px] font-medium text-cyan-400">Starter</span>
            </span>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Notifications"
              className="relative grid size-9 place-items-center rounded-full border border-white/[0.1] bg-dark-tertiary/40 text-gray-400 transition-colors hover:text-white"
            >
              <Bell className="size-4" />
            </button>
            <div className="grid size-9 place-items-center rounded-full bg-cyan-500/15 text-xs font-semibold text-cyan-400">
              MU
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto pb-28 md:pb-0">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <nav className="fixed inset-x-3 bottom-3 z-30 md:hidden">
          <div className="flex items-center justify-around rounded-2xl border border-white/[0.1] bg-dark-secondary/60 px-2 py-2 shadow-2xl backdrop-blur-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = getActiveNav() === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-all"
                >
                  <span
                    className={`grid size-9 place-items-center rounded-xl transition-all ${
                      isActive ? 'bg-cyan-500/15 text-cyan-400' : 'text-gray-400'
                    }`}
                  >
                    <Icon className="size-[18px]" />
                  </span>
                  {item.label}
                </a>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}