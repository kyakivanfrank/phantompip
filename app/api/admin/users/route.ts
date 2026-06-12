export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getAllUsers, getUser } from "@/lib/server/db";
import { handleApiError, successResponse } from "@/lib/server/api-response";
import { buildAdminUserSummary } from "@/lib/server/admin-user";

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();
    const index = await getAllUsers();
    
    const userPromises = index
      .filter(u => !u.isAdmin)
      .map(u => getUser(u.userId));
      
    const fullUsers = await Promise.all(userPromises);

    // Format data
    const formattedUsers = fullUsers
      .filter((u): u is NonNullable<typeof u> => u !== null)
      .map((u) => buildAdminUserSummary(u));

    return successResponse(
      {
        users: formattedUsers,
        totalUsers: formattedUsers.length,
      },
      "Users retrieved",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
