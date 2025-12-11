import type { ReactNode } from "react";
import "@/app/globals.css";
import AuthLayout from "@/app/components/auth/AuthLayout";
import { notFound } from "next/navigation";
import { canonicalizeTenantSlug } from "@/lib/tenant/routing";
import { api } from "@/trpc/server";

type LayoutParams = { orgSlug: string };

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<LayoutParams>;
}>) {
  const resolvedParams = await params;
  const orgSlug = resolvedParams?.orgSlug
    ? canonicalizeTenantSlug(resolvedParams.orgSlug)
    : null;

  if (!orgSlug) {
    notFound();
  }

  const tenantBrand = await api.tenant.tenantBrand({
    subDomain: orgSlug,
  });

  return (
    <AuthLayout
      tenantName={tenantBrand?.name}
      tenantLogo={tenantBrand?.logoUrl ?? undefined}
    >
      {children}
    </AuthLayout>
  );
}
