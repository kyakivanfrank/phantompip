export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminDashboardStats } from "@/lib/server/admin-stats";
import { handleApiError, successResponse } from "@/lib/server/api-response";

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();
    const stats = await getAdminDashboardStats();

    return successResponse(
      stats,
      "Admin stats retrieved",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
