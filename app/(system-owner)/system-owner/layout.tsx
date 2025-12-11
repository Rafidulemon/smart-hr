import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import "@/app/globals.css";
import { requireUser } from "@/server/auth/guards";
import { tenantPath } from "@/lib/tenant/routing";
import ResponsiveDashboardShell from "@/app/components/layouts/ResponsiveDashboardShell";
import SystemOwnerLeftMenu from "@/app/components/system-owner/SystemOwnerLeftMenu";

type SystemOwnerLayoutProps = {
  children: ReactNode;
};

export default async function SystemOwnerLayout({
  children,
}: SystemOwnerLayoutProps) {
  const user = await requireUser();

  if (user.role !== "SUPER_ADMIN") {
    if (user.organization?.subDomain) {
      redirect(tenantPath(user.organization.subDomain));
    }
    redirect("/auth/super_admin");
  }

  const viewerName =
    user.profile?.preferredName ||
    [user.profile?.firstName, user.profile?.lastName]
      .filter(Boolean)
      .join(" ") ||
    "Super Admin";

  return (
    <ResponsiveDashboardShell
      menuLabel="System Owner Menu"
      menu={
        <SystemOwnerLeftMenu
          viewerName={viewerName}
          viewerEmail={user.email}
        />
      }
    >
      {children}
    </ResponsiveDashboardShell>
  );
}
