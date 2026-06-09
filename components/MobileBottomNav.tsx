'use client';

import Link from 'next/link';
import { Home, Plug, CreditCard, Settings, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface MobileBottomNavProps {
  userData?: any;
  onLogout: () => void;
}

export function MobileBottomNav({ userData, onLogout }: MobileBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/mt5', label: 'MT5', icon: Plug },
    { href: '/dashboard/subscription', label: 'Sub', icon: CreditCard },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
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

            <button
              onClick={onLogout}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-md transition-colors text-gray-400 hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-xs mt-1 font-medium">Exit</span>
            </button>
          </div>

          {/* Mobile User Profile Info - Optional compact display */}
          {userData && (
            <div className="mt-2 pt-2 border-t border-white/5 text-center">
              <p className="text-xs text-gray-400 truncate">
                {userData.email}
              </p>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer for mobile to prevent content overlap */}
      <div className="md:hidden h-20" />
    </>
  );
}
