import type { UserRole } from "@prisma/client";

export const PLAN_UPGRADE_ROLES = ["ORG_OWNER", "ORG_ADMIN", "SUPER_ADMIN"] as const;

export type PlanUpgradeRole = (typeof PLAN_UPGRADE_ROLES)[number];

export const canUpgradePlan = (
  role?: UserRole | null,
): role is PlanUpgradeRole => {
  if (!role) {
    return false;
  }
  return (PLAN_UPGRADE_ROLES as readonly UserRole[]).includes(role);
};
