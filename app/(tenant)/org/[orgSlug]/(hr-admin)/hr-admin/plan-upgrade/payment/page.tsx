import { redirect } from "next/navigation";

import PlanPaymentClient from "@/app/components/hr-admin/PlanPaymentClient";
import { tenantPath } from "@/lib/tenant/routing";
import { requireUser } from "@/server/auth/guards";
import { canUpgradePlan } from "@/types/hr-billing";
import { type BillingCycle } from "@/app/components/hr-admin/planData";

type PlanPaymentPageProps = {
  searchParams: { plan?: string; cycle?: string; addons?: string };
};

export default async function HrPlanPaymentPage({ searchParams }: PlanPaymentPageProps) {
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

  const planId = searchParams.plan && typeof searchParams.plan === "string" ? searchParams.plan : "pro";
  const cycleParam =
    searchParams.cycle === "yearly" || searchParams.cycle === "monthly"
      ? (searchParams.cycle as BillingCycle)
      : "monthly";
  const addOnList =
    searchParams.addons && searchParams.addons.length > 0
      ? searchParams.addons.split(",").filter(Boolean)
      : [];

  return (
    <PlanPaymentClient
      organizationName={organizationName}
      viewerName={viewerName}
      billingEmail={billingEmail}
      nextRenewalIso={nextRenewalIso}
      initialPlanId={planId}
      initialCycle={cycleParam}
      initialAddOns={addOnList}
    />
  );
}
