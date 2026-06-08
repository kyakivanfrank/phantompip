'use client';

import { useState, useCallback } from 'react';
import { ApiResponse } from '@/lib/types';

interface UseApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: Record<string, any>;
  credentials?: RequestCredentials;
}

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  status: number | null;
}

/**
 * Custom hook for making API calls with proper error handling and credentials
 */
export function useApi<T = any>(url: string, options?: UseApiOptions) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
    status: null,
  });

  const execute = useCallback(
    async (customOptions?: UseApiOptions) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const finalOptions = { ...options, ...customOptions };
        
        // Build full URL - handle both relative and absolute URLs
        let fullUrl = url;
        if (!url.startsWith('http')) {
          // On client-side, use window.location.origin (works on both localhost and Vercel)
          // Only use NEXT_PUBLIC_API_URL if explicitly set
          let baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
          
          if (typeof window === 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
            // Server-side rendering fallback (rarely used for client hooks)
            baseUrl = process.env.NEXT_PUBLIC_API_URL;
          }
          
          if (!baseUrl) {
            throw new Error('Unable to determine API URL. Ensure the application is running.');
          }
          
          fullUrl = `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
        }

        const response = await fetch(fullUrl, {
          method: finalOptions.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...finalOptions.headers,
          },
          body: finalOptions.body ? JSON.stringify(finalOptions.body) : undefined,
          credentials: finalOptions.credentials || 'include', // Include cookies by default for auth
        });

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        let responseData: ApiResponse<T>;
        
        if (contentType?.includes('application/json')) {
          responseData = await response.json();
        } else {
          // If not JSON, create a response object
          const text = await response.text();
          responseData = {
            success: response.ok,
            data: text as any,
            status: response.status,
          };
        }

        // Ensure response has required fields
        if (!responseData || typeof responseData !== 'object') {
          throw new Error('Invalid response format from server');
        }

        // Normalize response to ensure success field exists
        if (responseData.success === undefined) {
          responseData.success = response.ok;
        }

        setState({
          data: responseData.data || null,
          error: responseData.error || null,
          isLoading: false,
          status: response.status,
        });

        return responseData;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setState({
          data: null,
          error: errorMessage,
          isLoading: false,
          status: null,
        });
        throw error;
      }
    },
    [url, options]
  );

  return {
    ...state,
    execute,
  };
}

/**
 * Hook for making POST requests
 */
export function usePost<T = any>(
  url: string,
  body?: Record<string, any>,
  headers?: Record<string, string>
) {
  return useApi<T>(url, {
    method: 'POST',
    body,
    headers,
  });
}

/**
 * Hook for making GET requests
 */
export function useGet<T = any>(
  url: string,
  headers?: Record<string, string>
) {
  return useApi<T>(url, {
    method: 'GET',
    headers,
  });
}

/**
 * Hook for making PUT requests
 */
export function usePut<T = any>(
  url: string,
  body?: Record<string, any>,
  headers?: Record<string, string>
) {
  return useApi<T>(url, {
    method: 'PUT',
    body,
    headers,
  });
}

/**
 * Hook for making DELETE requests
 */
export function useDelete<T = any>(
  url: string,
  headers?: Record<string, string>
) {
  return useApi<T>(url, {
    method: 'DELETE',
    headers,
  });
}
