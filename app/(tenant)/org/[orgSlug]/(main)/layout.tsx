import type { UserRole } from "@prisma/client";
import { requireUser } from "@/server/auth/guards";
import LeftMenu from "@/app/components/navigations/LeftMenu";
import ResponsiveDashboardShell from "@/app/components/layouts/ResponsiveDashboardShell";
import "@/app/globals.css";

type MainLayoutParams = { orgSlug: string };

export default async function MainLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<MainLayoutParams>;
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
  const isLeader = canAccessHrAdmin;
  const fullName =
    user.profile?.preferredName ??
    [user.profile?.firstName, user.profile?.lastName]
      .filter(Boolean)
      .join(" ");
  const organizationName = user.organization?.name ?? "HR";

  return (
    <ResponsiveDashboardShell
      menuLabel="Navigation"
      menu={
        <LeftMenu
          className="md:max-h-[calc(100vh-3rem)] md:overflow-y-auto md:overscroll-contain md:scrollbar-none"
          isLeader={isLeader}
          canAccessHrAdmin={canAccessHrAdmin}
          organizationName={organizationName}
          userFullName={fullName}
          organizationLogoUrl={user.organization?.logoUrl ?? undefined}
        />
      }
      faviconUrl={user.organization?.logoUrl ?? undefined}
    >
      {children}
    </ResponsiveDashboardShell>
  );
}
