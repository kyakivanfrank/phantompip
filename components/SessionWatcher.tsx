'use client';

import { useEffect, useRef } from 'react';

const LOGOUT_SIGNAL_KEY = 'phantompip_logout_signal';
const BROADCAST_CHANNEL_NAME = 'phantompip_auth_channel';
const PING_INTERVAL_MS = 1500; // 1.5 second high-speed check

export function SessionWatcher() {
  const isCheckingRef = useRef(false);
  const isTerminatedRef = useRef(false);

  useEffect(() => {
    // Shared BroadcastChannel for instant cross-tab sync
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      }
    } catch {
      // BroadcastChannel fallback to localStorage storage event
    }

    const triggerClientLogout = (reason = 'deleted') => {
      if (isTerminatedRef.current) return;
      isTerminatedRef.current = true;

      // Broadcast to all other open tabs in this browser
      try {
        channel?.postMessage({ type: 'LOGOUT', reason, timestamp: Date.now() });
        localStorage.setItem(
          LOGOUT_SIGNAL_KEY,
          JSON.stringify({ timestamp: Date.now(), reason })
        );
      } catch {
        // Safe catch for storage errors
      }

      // Hard redirect with replace to invalidate current page and prevent back navigation
      window.location.replace(`/login?deleted=true&t=${Date.now()}`);
    };

    // 1. Cross-tab message listener (BroadcastChannel)
    if (channel) {
      channel.onmessage = (event) => {
        if (event?.data?.type === 'LOGOUT') {
          triggerClientLogout(event.data.reason || 'deleted');
        }
      };
    }

    // 2. Cross-tab storage listener (localStorage fallback)
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === LOGOUT_SIGNAL_KEY && event.newValue) {
        triggerClientLogout('deleted');
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // 3. Ultra-fast session verification function
    const verifySession = async () => {
      if (isCheckingRef.current || isTerminatedRef.current) return;
      isCheckingRef.current = true;

      try {
        const response = await fetch('/api/auth/session-check', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.status === 401) {
          triggerClientLogout('deleted');
          return;
        }

        if (!response.ok) {
          // If 404 or other unauthorized code
          if (response.status === 404 || response.status === 403) {
            triggerClientLogout('deleted');
            return;
          }
        }
      } catch {
        // Transient network error, retry next tick without false logout
      } finally {
        isCheckingRef.current = false;
      }
    };

    // 4. Initial check immediately upon mounting
    verifySession();

    // 5. High-speed interval polling (1.5 seconds)
    const intervalId = setInterval(() => {
      // If the tab is hidden, we still check, but only if not terminated
      verifySession();
    }, PING_INTERVAL_MS);

    // 6. Instant check when window/tab is focused or becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        verifySession();
      }
    };
    const handleFocus = () => {
      verifySession();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    // 7. Global fetch interceptor to catch any 401s from user actions in 0ms
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        const url =
          typeof args[0] === 'string'
            ? args[0]
            : (args[0] as Request)?.url || '';
        if (url.includes('/api/')) {
          triggerClientLogout('deleted');
        }
      }
      return response;
    };

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageEvent);
      window.fetch = originalFetch;
      try {
        channel?.close();
      } catch {}
    };
  }, []);

  return null;
}
