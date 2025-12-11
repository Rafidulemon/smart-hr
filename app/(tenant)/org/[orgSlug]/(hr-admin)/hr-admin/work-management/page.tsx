import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { canManageWork } from "@/types/hr-work";
import { tenantPath } from "@/lib/tenant/routing";
import WorkManagementClient from "@/app/components/hr-admin/WorkManagementClient";

export default async function WorkManagementPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const user = await requireUser(params.orgSlug);

  if (!canManageWork(user.role)) {
    redirect(tenantPath(params.orgSlug, "/hr-admin"));
  }

  return <WorkManagementClient />;
}
