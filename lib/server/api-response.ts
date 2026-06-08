import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/types";

/**
 * Standardized API error response creator
 * All API routes should use these functions for consistent error handling
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Create a successful JSON response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message: message || "Success",
      status: statusCode,
    },
    { status: statusCode }
  );
}

/**
 * Create an error JSON response
 */
export function errorResponse(
  message: string,
  statusCode: number = 400,
  details?: any
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      status: statusCode,
      ...(details && { details }),
    },
    { status: statusCode }
  );
}

/**
 * Handle try-catch blocks in API routes
 * Usage: catch(error) { return handleApiError(error); }
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse<null>> {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode, error.details);
  }

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes("Unauthorized")) {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message.includes("Forbidden")) {
      return errorResponse("Forbidden", 403);
    }
    if (error.message.includes("not found")) {
      return errorResponse(error.message, 404);
    }
    if (error.message.includes("unavailable")) {
      return errorResponse("Service temporarily unavailable", 503);
    }

    return errorResponse("Internal server error", 500);
  }

  return errorResponse("Internal server error", 500);
}

/**
 * Wrapper for API routes with automatic error handling
 * Usage: export const POST = handleRoute(async (req) => { ... });
 */
export function handleRoute(
  handler: (
    _req: Request
  ) => Promise<NextResponse<any> | { data: any; status: number }>
) {
  return async (_req: Request) => {
    try {
      const result = await handler(_req);

      // If handler returns plain object, convert to NextResponse
      if (!(result instanceof NextResponse)) {
        return successResponse(result.data, undefined, result.status);
      }

      return result;
    } catch (error) {
      return handleApiError(error);
    }
  };
}
