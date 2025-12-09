import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { TenantProvider } from "@/app/components/tenant/TenantProvider";
import { canonicalizeTenantSlug } from "@/lib/tenant/routing";
import { prisma } from "@/prisma";

type OrgLayoutParams = { orgSlug: string };

export default async function OrgTenantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<OrgLayoutParams>;
}) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.orgSlug;

  if (!rawSlug) {
    notFound();
  }

  const slug = canonicalizeTenantSlug(rawSlug);

  const organization = await prisma.organization.findUnique({
    where: { subDomain: slug },
    select: { id: true },
  });

  if (!organization) {
    notFound();
  }

  return <TenantProvider slug={slug}>{children}</TenantProvider>;
}
