import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { tenantController } from "./tenant.controller";

const tenantBrandInput = z.object({
  subDomain: z.string().trim().min(1, "Organization slug is required."),
});

export const tenantRouter = createTRPCRouter({
  tenantBrand: publicProcedure
    .input(tenantBrandInput)
    .query(({ ctx, input }) =>
      tenantController.tenantBrand({
        ctx,
        input,
      }),
    ),
});
