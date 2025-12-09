import { redirect } from "next/navigation";

import { requireUser } from "@/server/auth/guards";
import { canManageTeams } from "@/types/hr-team";
import { tenantPath } from "@/lib/tenant/routing";

import TeamManagementClient from "./TeamManagementClient";

export default async function TeamManagementPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const user = await requireUser(params.orgSlug);

  if (!canManageTeams(user.role)) {
    redirect(tenantPath(params.orgSlug, "/hr-admin"));
  }

  return <TeamManagementClient />;
}
