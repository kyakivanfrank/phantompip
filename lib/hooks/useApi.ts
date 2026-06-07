'use client';

import { useState, useCallback } from 'react';
import { ApiResponse } from '@/lib/types';

interface UseApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: Record<string, any>;
}

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  status: number | null;
}

/**
 * Custom hook for making API calls
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
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

        const response = await fetch(fullUrl, {
          method: finalOptions.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...finalOptions.headers,
          },
          body: finalOptions.body ? JSON.stringify(finalOptions.body) : undefined,
        });

        const responseData: ApiResponse<T> = await response.json();

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
