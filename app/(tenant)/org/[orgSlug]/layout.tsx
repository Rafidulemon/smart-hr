import { cache, type ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TenantProvider } from "@/app/components/tenant/TenantProvider";
import { DEFAULT_ORGANIZATION_LOGO } from "@/lib/organization-branding";
import { canonicalizeTenantSlug } from "@/lib/tenant/routing";
import { prisma } from "@/prisma";

type OrgLayoutParams = { orgSlug: string };
type TenantRecord = {
  id: string;
  name: string;
  logoUrl: string | null;
};

const findTenant = cache(async (slug: string): Promise<TenantRecord | null> =>
  prisma.organization.findUnique({
    where: { subDomain: slug },
    select: {
      id: true,
      name: true,
      logoUrl: true,
    },
  }),
);

const ensureTenant = async (slug: string) => {
  const tenant = await findTenant(slug);
  if (!tenant) {
    notFound();
  }
  return tenant;
};

const resolveSlugFromParams = async (
  paramsPromise: Promise<OrgLayoutParams>,
) => {
  const resolvedParams = await paramsPromise;
  const rawSlug = resolvedParams?.orgSlug;

  if (!rawSlug) {
    notFound();
  }

  return canonicalizeTenantSlug(rawSlug);
};

export async function generateMetadata({
  params,
}: {
  params: Promise<OrgLayoutParams>;
}): Promise<Metadata> {
  const slug = await resolveSlugFromParams(params);
  const tenant = await ensureTenant(slug);
  const icon = tenant.logoUrl ?? DEFAULT_ORGANIZATION_LOGO;

  return {
    title: `${tenant.name} | Smart HR`,
    icons: {
      icon,
    },
  };
}

export default async function OrgTenantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<OrgLayoutParams>;
}) {
  const slug = await resolveSlugFromParams(params);
  await ensureTenant(slug);
  return <TenantProvider slug={slug}>{children}</TenantProvider>;
}
