'use client';

import { useState, useCallback } from 'react';
import { ApiResponse } from '@/lib/types';

interface UseApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: Record<string, any> | string;
  credentials?: RequestCredentials;
}

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  status: number | null;
}

/**
 * Make an API request with proper error handling
 */
async function makeApiRequest<T = any>(
  url: string,
  options?: UseApiOptions
): Promise<ApiResponse<T>> {
  // Build full URL - handle both relative and absolute URLs
  let fullUrl = url;
  if (!url.startsWith('http')) {
    // On client-side, use window.location.origin
    let baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    if (typeof window === 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
      baseUrl = process.env.NEXT_PUBLIC_API_URL;
    }

    if (!baseUrl) {
      throw new Error('Unable to determine API URL. Ensure the application is running.');
    }

    fullUrl = `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
  }

  // Prepare body
  let body: string | undefined;
  if (options?.body) {
    body = typeof options.body === 'string' 
      ? options.body 
      : JSON.stringify(options.body);
  }

  const response = await fetch(fullUrl, {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body,
    credentials: options?.credentials || 'include',
  });

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  let responseData: ApiResponse<T>;

  if (contentType?.includes('application/json')) {
    responseData = await response.json();
  } else {
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

  // Normalize response
  if (responseData.success === undefined) {
    responseData.success = response.ok;
  }
  if (responseData.status === undefined) {
    responseData.status = response.status;
  }

  return responseData;
}

/**
 * Custom hook for making API calls - supports parameterized usage
 */

// Overload 1: With URL - returns execute method
export function useApi<T = any>(
  url: string,
  options?: UseApiOptions
): UseApiState<T> & { execute: (customOptions?: UseApiOptions) => Promise<ApiResponse<T>> };

// Overload 2: Without URL - returns request method
export function useApi<T = any>(): UseApiState<T> & { 
  request: (url: string, options?: UseApiOptions) => Promise<ApiResponse<T>>;
  execute: (url: string, options?: UseApiOptions) => Promise<ApiResponse<T>>;
};

// Implementation
export function useApi<T = any>(
  url?: string,
  options?: UseApiOptions
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
    status: null,
  });

  // For URL-less usage: return a request method
  if (!url) {
    const request = useCallback(
      async (
        requestUrl: string,
        requestOptions?: UseApiOptions
      ): Promise<ApiResponse<T>> => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
          const result = await makeApiRequest<T>(requestUrl, requestOptions);
          setState({
            data: result.data || null,
            error: result.error || null,
            isLoading: false,
            status: result.status || null,
          });
          return result;
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
      []
    );

    return {
      ...state,
      request,
      execute: request, // Alias for compatibility
    };
  }

  // For URL-provided usage: create execute for that specific URL
  const execute = useCallback(
    async (customOptions?: UseApiOptions): Promise<ApiResponse<T>> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const finalOptions = { ...options, ...customOptions };
        const result = await makeApiRequest<T>(url, finalOptions);
        setState({
          data: result.data || null,
          error: result.error || null,
          isLoading: false,
          status: result.status || null,
        });
        return result;
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
