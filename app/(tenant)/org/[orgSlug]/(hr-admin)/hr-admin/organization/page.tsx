import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { canManageOrganization } from "@/types/hr-organization";
import { tenantPath } from "@/lib/tenant/routing";
import OrganizationManagementClient from "@/app/components/hr-admin/OrganizationManagementClient";

export default async function OrganizationManagementPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const user = await requireUser(params.orgSlug);

  if (!canManageOrganization(user.role)) {
    redirect(tenantPath(params.orgSlug, "/hr-admin"));
  }

  return <OrganizationManagementClient />;
}
