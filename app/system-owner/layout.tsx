import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import "@/app/globals.css";
import { requireUser } from "@/server/auth/guards";
import { tenantPath } from "@/lib/tenant/routing";
import SystemOwnerLeftMenu from "./SystemOwnerLeftMenu";

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
    <div className="min-h-screen bg-slate-50 pb-12 pt-8 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 sm:px-6 lg:px-8">
        <SystemOwnerLeftMenu viewerName={viewerName} viewerEmail={user.email} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
