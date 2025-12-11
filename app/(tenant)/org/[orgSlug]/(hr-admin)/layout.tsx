import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { LeaveStatus, type UserRole } from "@prisma/client";
import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db";
import ResponsiveDashboardShell from "@/app/components/layouts/ResponsiveDashboardShell";
import HrAdminLeftMenu from "@/app/components/navigations/HrAdminLeftMenu";
import "@/app/globals.css";
import { tenantPath } from "@/lib/tenant/routing";

type HrAdminLayoutParams = { orgSlug: string };

export default async function HrAdminLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<HrAdminLayoutParams>;
}>) {
  const resolvedParams = await params;
  const user = await requireUser(resolvedParams.orgSlug);
  const elevatedRoles: ReadonlyArray<UserRole> = [
    "MANAGER",
    "HR_ADMIN",
    "ORG_OWNER",
    "ORG_ADMIN",
    "SUPER_ADMIN",
  ];
  const canAccessHrAdmin = elevatedRoles.includes(user.role);

  if (!canAccessHrAdmin) {
    redirect(tenantPath(resolvedParams.orgSlug));
  }

  const fullName =
    user.profile?.preferredName ??
    [user.profile?.firstName, user.profile?.lastName]
      .filter(Boolean)
      .join(" ");
  const organizationName = user.organization?.name ??  "HR";
  const pendingLeaveCount =
    user.organizationId &&
    (await prisma.leaveRequest.count({
      where: {
        status: { in: [LeaveStatus.PENDING, LeaveStatus.PROCESSING] },
        employee: {
          organizationId: user.organizationId,
        },
      },
    }));

  return (
    <ResponsiveDashboardShell
      menuLabel="HR Menu"
      menu={
        <HrAdminLeftMenu
          className="md:max-h-[calc(100vh-3rem)] md:overflow-y-auto md:overscroll-contain md:scrollbar-none"
          organizationName={organizationName}
          userFullName={fullName}
          showEmployeeDashboardLink
          pendingLeaveCount={Number(pendingLeaveCount) || 0}
          viewerRole={user.role}
          organizationLogoUrl={user.organization?.logoUrl ?? undefined}
        />
      }
      faviconUrl={user.organization?.logoUrl ?? undefined}
    >
      {children}
    </ResponsiveDashboardShell>
  );
}
