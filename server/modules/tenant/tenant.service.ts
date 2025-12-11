import { canonicalizeTenantSlug } from "@/lib/tenant/routing";
import type { TRPCContext } from "@/server/api/trpc";

type TenantBrandInput = {
  subDomain: string;
};

export const tenantService = {
  tenantBrand: async (ctx: TRPCContext, input: TenantBrandInput) => {
    const normalizedSlug = canonicalizeTenantSlug(input.subDomain);

    const organization = await ctx.prisma.organization.findUnique({
      where: { subDomain: normalizedSlug },
      select: {
        name: true,
        logoUrl: true,
      },
    });

    if (!organization) {
      return null;
    }

    return {
      name: organization.name,
      logoUrl: organization.logoUrl ?? undefined,
    };
  },
};
