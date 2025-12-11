import type { TRPCContext } from "@/server/api/trpc";
import { tenantService } from "./tenant.service";

type TenantBrandInput = {
  subDomain: string;
};

export const tenantController = {
  tenantBrand: ({ ctx, input }: { ctx: TRPCContext; input: TenantBrandInput }) =>
    tenantService.tenantBrand(ctx, input),
};
