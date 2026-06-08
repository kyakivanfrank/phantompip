import { NextRequest } from "next/server";
import { clearSessionCookie } from "@/lib/server/auth";
import { handleApiError, successResponse } from "@/lib/server/api-response";

export async function POST(_req: NextRequest) {
  try {
    await clearSessionCookie();
    return successResponse({ loggedOut: true }, "Logout successful", 200);
  } catch (error) {
    return handleApiError(error);
  }
}
