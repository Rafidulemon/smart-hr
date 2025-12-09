import { redirect } from "next/navigation";

import { requireUser } from "@/server/auth/guards";
import { canManageProjects } from "@/types/hr-project";
import { tenantPath } from "@/lib/tenant/routing";

import ProjectManagementClient from "./ProjectManagementClient";

export default async function ProjectManagementPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const user = await requireUser(params.orgSlug);

  if (!canManageProjects(user.role)) {
    redirect(tenantPath(params.orgSlug, "/hr-admin"));
  }

  return <ProjectManagementClient />;
}
