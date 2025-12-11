import { notFound } from "next/navigation";
import SignupClient from "@/app/components/auth/SignupClient";
import { canonicalizeTenantSlug } from "@/lib/tenant/routing";
import { prisma } from "@/prisma";


type SignupPageParams = { orgSlug: string };

export default async function SignupPage({
  params,
}: {
  params: Promise<SignupPageParams>;
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

  const tenantBrand = organization
    ? {
        name: organization.name,
        logoUrl: organization.logoUrl ?? undefined,
      }
    : undefined;

  return <SignupClient tenantBrand={tenantBrand} />;
}
