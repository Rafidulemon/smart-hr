import { redirect } from "next/navigation";

import PlanUpgradeClient from "@/app/components/hr-admin/PlanUpgradeClient";
import { tenantPath } from "@/lib/tenant/routing";
import { requireUser } from "@/server/auth/guards";
import { canUpgradePlan } from "@/types/hr-billing";

export default async function HrPlanUpgradePage() {
  const user = await requireUser();

  const orgSlug = user.organization?.subDomain ?? "";

  if (!canUpgradePlan(user.role)) {
    redirect(tenantPath(orgSlug, "/hr-admin"));
  }

  const viewerName =
    user.profile?.preferredName ??
    ([user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(" ") ||
      "System owner");
  const organizationName = user.organization?.name ?? "Your organization";
  const billingEmail =
    user.profile?.workEmail ??
    user.email ??
    `billing@${user.organization?.domain ?? "example.com"}`;
  const nextRenewalIso = new Date(Date.now() + 1000 * 60 * 60 * 24 * 28).toISOString();

  return (
    <PlanUpgradeClient
      organizationName={organizationName}
      viewerName={viewerName}
      currentPlan="Growth"
      billingEmail={billingEmail}
      nextRenewalIso={nextRenewalIso}
    />
  );
}
