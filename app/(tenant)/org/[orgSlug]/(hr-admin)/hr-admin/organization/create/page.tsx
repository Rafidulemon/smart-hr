import { redirect } from "next/navigation";

import { requireUser } from "@/server/auth/guards";
import { tenantPath } from "@/lib/tenant/routing";

export default async function CreateOrganizationPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const user = await requireUser(params.orgSlug);
  const fallbackHref = tenantPath(params.orgSlug, "/hr-admin/organization");
  if (user.role !== "SUPER_ADMIN") {
    redirect(fallbackHref);
  }

  redirect("/system-owner/create");
}
