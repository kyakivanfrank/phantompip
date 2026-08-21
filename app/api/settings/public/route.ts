export const dynamic = 'force-dynamic';

import { getPlatformSettings, resolvePlans } from "@/lib/server/settings";
import { handleApiError, successResponse } from "@/lib/server/api-response";

/**
 * Public, read-only view of the admin-managed settings: the values every
 * visitor is allowed to see. Logged-out pages (landing, login, signup, support)
 * read from here, so nothing is baked in at build time.
 */
export async function GET() {
  try {
    const settings = await getPlatformSettings();
    return successResponse(
      {
        supportContactNumber: settings.supportContactNumber,
        plans: resolvePlans(settings),
      },
      "Public settings retrieved",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
