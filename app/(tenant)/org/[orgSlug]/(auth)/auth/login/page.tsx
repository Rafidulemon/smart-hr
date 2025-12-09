import { notFound } from "next/navigation";

import { canonicalizeTenantSlug } from "@/lib/tenant/routing";
import { prisma } from "@/prisma";
import LoginClient from "./LoginClient";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const resolvedParams = await params;
  const orgSlug = resolvedParams?.orgSlug
    ? canonicalizeTenantSlug(resolvedParams.orgSlug)
    : null;

  if (!orgSlug) {
    notFound();
  }

  const organization = await prisma.organization.findUnique({
    where: { subDomain: orgSlug },
    select: {
      name: true,
      logoUrl: true,
    },
  });

  return (
    <LoginClient
      organizationName={organization?.name}
      organizationLogoUrl={organization?.logoUrl}
    />
  );
}
