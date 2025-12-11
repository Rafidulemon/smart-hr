import { notFound } from "next/navigation";
import ForgetPasswordClient from "@/app/components/auth/ForgetPasswordClient";
import { canonicalizeTenantSlug } from "@/lib/tenant/routing";
import { prisma } from "@/prisma";

type ForgetPasswordPageParams = { orgSlug: string };

export default async function ForgetPasswordPage({
  params,
}: {
  params: Promise<ForgetPasswordPageParams>;
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

  return <ForgetPasswordClient tenantBrand={tenantBrand} />;
}
