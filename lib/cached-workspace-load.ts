import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import {
  loadActiveMembershipAndCompany,
  type ActiveMembershipLoadResult,
} from "@/lib/active-membership-load";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { WORKSPACE_PROXY_COMPANY_HEADER } from "@/lib/workspace-request-hint";

/**
 * Deduplicates membership + company queries within a single RSC render when multiple
 * modules (or parallel branches) need the same workspace context.
 * Uses `x-planyo-proxy-company-id` from proxy (single workspace) for a targeted first read.
 */
export const getCachedWorkspaceForUser = cache(
  async (userId: string): Promise<ActiveMembershipLoadResult> => {
    const supabase = await createServerSupabaseClient();
    const rawHint = (await headers()).get(WORKSPACE_PROXY_COMPANY_HEADER);
    return loadActiveMembershipAndCompany(supabase, userId, { proxyCompanyIdHint: rawHint });
  }
);
