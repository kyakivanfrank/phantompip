export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getAllUsers, getUser, mapWithConcurrency } from "@/lib/server/db";
import { handleApiError, successResponse } from "@/lib/server/api-response";
import { buildAdminUserSummary } from "@/lib/server/admin-user";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get('limit') || '', 10);
    const index = await getAllUsers();
    const relevantUsers = index.filter((u) => !u.isAdmin);

    const candidateUsers = Number.isFinite(limit) && limit > 0 ? relevantUsers.slice(0, limit) : relevantUsers;
    const fullUsers = (await mapWithConcurrency(candidateUsers, async (user) => getUser(user.userId), 12))
      .filter((user): user is NonNullable<typeof user> => Boolean(user));

    const formattedUsers = fullUsers.map((u) => buildAdminUserSummary(u));

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
