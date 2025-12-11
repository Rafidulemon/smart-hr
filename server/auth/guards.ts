import "server-only";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@/prisma";
import { authUserSelect, type AuthUser } from "@/server/auth/selection";
import { nextAuthOptions } from "@/app/utils/next-auth-options";
import {
  canonicalizeTenantSlug,
  tenantAuthPath,
} from "@/lib/tenant/routing";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getServerSession(nextAuthOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: authUserSelect,
  });

  return user;
}

const loginRedirect = (slug?: string): never => {
  if (slug) {
    redirect(tenantAuthPath(slug));
  }
  redirect("/system-owner/auth/login");
};

export async function requireUser(expectedSlug?: string): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    loginRedirect(expectedSlug);
  }

  const authedUser = user as AuthUser;

  if (expectedSlug) {
    const normalizedExpectedSlug = canonicalizeTenantSlug(expectedSlug);
    const userSlug = authedUser.organization?.subDomain
      ? canonicalizeTenantSlug(authedUser.organization.subDomain)
      : null;

    if (!userSlug || userSlug !== normalizedExpectedSlug) {
      loginRedirect(expectedSlug);
    }
  }

  return authedUser;
}
