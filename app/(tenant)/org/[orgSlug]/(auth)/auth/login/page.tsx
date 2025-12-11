import { notFound, redirect } from "next/navigation";

import LoginForm from "./LoginForm";
import { canonicalizeTenantSlug, tenantPath } from "@/lib/tenant/routing";
import { getCurrentUser } from "@/server/auth/guards";

type LoginPageParams = {
  orgSlug: string;
};

export default async function LoginPage({
  params,
}: {
  params: Promise<LoginPageParams>;
}) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.orgSlug;

  if (!rawSlug) {
    notFound();
  }

  const slug = canonicalizeTenantSlug(rawSlug);
  const user = await getCurrentUser();
  const userSlug = user?.organization?.subDomain
    ? canonicalizeTenantSlug(user.organization.subDomain)
    : null;

  if (user && userSlug === slug) {
    redirect(tenantPath(slug));
  }

  return <LoginForm />;
}
