'use client';

import Link from 'next/link';
import { TrendingUp, Users, CreditCard, Key } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function AdminMobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: TrendingUp },
    { href: '/admin/mt5-vault', label: 'MT5', icon: Key },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/payments', label: 'Subscriptions', icon: CreditCard },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation - persistent, visible only on small screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-secondary/90 backdrop-blur-lg border-t border-white/10">
        <div className="w-full px-2 py-2">
          <div className="flex items-center justify-between gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-md transition-colors"
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      active
                        ? 'text-cyan-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  />
                  <span
                    className={`text-xs mt-1 font-medium transition-colors ${
                      active
                        ? 'text-cyan-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Logout moved to top-bar dropdown; mobile bottom nav no longer shows logout */}
          </div>
        </div>
      </nav>

      {/* Spacer for mobile to prevent content overlap */}
      <div className="md:hidden h-20" />
    </>
  );
}
