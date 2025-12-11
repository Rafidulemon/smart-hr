import type { TRPCContext } from "@/server/api/trpc";
import { hrOrganizationService } from "./organization.service";

export const hrOrganizationController = {
  management: ({
    ctx,
    input,
  }: {
    ctx: TRPCContext;
    input?: { organizationId?: string };
  }) => hrOrganizationService.management(ctx, input?.organizationId),
  list: ({ ctx }: { ctx: TRPCContext }) => hrOrganizationService.listAll(ctx),
  members: ({
    ctx,
    input,
  }: {
    ctx: TRPCContext;
    input: { organizationId: string; cursor?: string | null; limit?: number };
  }) => hrOrganizationService.listMembers(ctx, input),
  details: ({
    ctx,
    input,
  }: {
    ctx: TRPCContext;
    input: { organizationId: string };
  }) => hrOrganizationService.details(ctx, input.organizationId),
  employeeProfile: ({
    ctx,
    input,
  }: {
    ctx: TRPCContext;
    input: { organizationId: string; employeeId: string };
  }) => hrOrganizationService.employeeProfile(ctx, input),
  updateDetails: ({
    ctx,
    input,
  }: {
    ctx: TRPCContext;
    input: {
      name: string;
      domain?: string | null;
      timezone?: string | null;
      locale?: string | null;
      organizationId?: string | null;
      logoUrl?: string | null;
      subDomain?: string;
    };
  }) => hrOrganizationService.updateDetails(ctx, input),
  addAdmin: ({ ctx, userId }: { ctx: TRPCContext; userId: string }) =>
    hrOrganizationService.addAdmin(ctx, userId),
  removeAdmin: ({ ctx, userId }: { ctx: TRPCContext; userId: string }) =>
    hrOrganizationService.removeAdmin(ctx, userId),
  createOrganization: ({
    ctx,
    input,
  }: {
    ctx: TRPCContext;
    input: {
      name: string;
      subDomain: string;
      domain?: string | null;
      timezone?: string | null;
      locale?: string | null;
      ownerName: string;
      ownerEmail: string;
      ownerPhone?: string | null;
      ownerDesignation?: string | null;
      sendInvite?: boolean;
      logoUrl?: string | null;
    };
  }) => hrOrganizationService.createOrganization(ctx, input),
  deleteOrganization: ({
    ctx,
    input,
  }: {
    ctx: TRPCContext;
    input: { organizationId: string; password: string };
  }) => hrOrganizationService.deleteOrganization(ctx, input),
  verifyDeletePassword: ({
    ctx,
    input,
  }: {
    ctx: TRPCContext;
    input: { password: string };
  }) => hrOrganizationService.verifyDeletePassword(ctx, input.password),
};
