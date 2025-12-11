import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { canManageDepartments } from "@/types/hr-department";
import { tenantPath } from "@/lib/tenant/routing";
import DepartmentManagementClient from "@/app/components/hr-admin/DepartmentManagementClient";

export default async function DepartmentManagementPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const user = await requireUser(params.orgSlug);

  if (!canManageDepartments(user.role)) {
    redirect(tenantPath(params.orgSlug, "/hr-admin"));
  }

  return <DepartmentManagementClient />;
}
