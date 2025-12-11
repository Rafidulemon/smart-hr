import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { hrOrganizationController } from "./organization.controller";

const managementInput = z.object({
  organizationId: z.string().min(1).optional(),
});

const membersInput = z.object({
  organizationId: z.string().min(1, "Organization is required."),
  cursor: z.string().optional().nullable(),
  limit: z.number().int().min(1).max(50).optional(),
});

const organizationDetailsInput = z.object({
  organizationId: z.string().min(1, "Organization is required."),
});

const organizationEmployeeProfileInput = z.object({
  organizationId: z.string().min(1, "Organization is required."),
  employeeId: z.string().min(1, "Employee is required."),
});

const updateOrganizationInput = z.object({
  name: z.string().min(3, "Organization name is required."),
  domain: z
    .string()
    .min(3, "Domain must be at least 3 characters.")
    .max(120)
    .optional()
    .nullable(),
  timezone: z.string().min(2).max(120).optional().nullable(),
  locale: z.string().min(2).max(32).optional().nullable(),
  organizationId: z.string().min(1).optional().nullable(),
  logoUrl: z
    .string()
    .min(5, "Organization logo is required.")
    .max(1024, "Logo URL must be less than 1024 characters."),
  subDomain: z
    .string()
    .trim()
    .min(3, "Sub-domain must be at least 3 characters.")
    .max(63, "Sub-domain must be at most 63 characters.")
    .regex(
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      "Sub-domain can only include letters, numbers, and hyphens, and cannot start or end with a hyphen.",
    )
    .optional(),
});

const organizationUserInput = z.object({
  userId: z.string().min(1, "Select a team member."),
});

const createOrganizationInput = z.object({
  name: z.string().min(3, "Organization name is required."),
  subDomain: z
    .string()
    .trim()
    .min(3, "Sub-domain must be at least 3 characters.")
    .max(63, "Sub-domain must be at most 63 characters.")
    .regex(
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      "Sub-domain can only include letters, numbers, and hyphens, and cannot start or end with a hyphen.",
    )
    .transform((value) => value.toLowerCase()),
  domain: z
    .string()
    .min(3, "Domain must be at least 3 characters.")
    .max(120)
    .optional()
    .nullable(),
  timezone: z.string().min(2).max(120).optional().nullable(),
  locale: z.string().min(2).max(32).optional().nullable(),
  ownerName: z.string().min(3, "Owner name is required."),
  ownerEmail: z.string().email("Provide a valid email address."),
  ownerPhone: z
    .string()
    .min(7, "Provide a valid phone number.")
    .max(32)
    .regex(/^\+?[0-9()\s-]{7,32}$/, "Use digits, spaces, parentheses, or dashes.")
    .optional()
    .nullable(),
  ownerDesignation: z.string().max(120).optional().nullable(),
  sendInvite: z.boolean().optional(),
  logoUrl: z
    .string()
    .min(5, "Logo URL must be at least 5 characters.")
    .max(1024, "Logo URL must be less than 1024 characters.")
    .optional()
    .nullable(),
});

const deleteOrganizationInput = z.object({
  organizationId: z.string().min(1, "Organization is required."),
  password: z.string().min(6, "Password is required."),
});

const verifyDeletePasswordInput = z.object({
  password: z.string().min(6, "Password is required."),
});

export const hrOrganizationRouter = createTRPCRouter({
  management: protectedProcedure
    .input(managementInput.optional())
    .query(({ ctx, input }) =>
      hrOrganizationController.management({ ctx, input }),
    ),
  list: protectedProcedure.query(({ ctx }) =>
    hrOrganizationController.list({ ctx }),
  ),
  members: protectedProcedure
    .input(membersInput)
    .query(({ ctx, input }) =>
      hrOrganizationController.members({ ctx, input }),
    ),
  details: protectedProcedure
    .input(organizationDetailsInput)
    .query(({ ctx, input }) =>
      hrOrganizationController.details({ ctx, input }),
    ),
  employeeProfile: protectedProcedure
    .input(organizationEmployeeProfileInput)
    .query(({ ctx, input }) =>
      hrOrganizationController.employeeProfile({ ctx, input }),
    ),
  updateDetails: protectedProcedure
    .input(updateOrganizationInput)
    .mutation(({ ctx, input }) =>
      hrOrganizationController.updateDetails({ ctx, input }),
    ),
  addAdmin: protectedProcedure
    .input(organizationUserInput)
    .mutation(({ ctx, input }) =>
      hrOrganizationController.addAdmin({ ctx, userId: input.userId }),
    ),
  removeAdmin: protectedProcedure
    .input(organizationUserInput)
    .mutation(({ ctx, input }) =>
      hrOrganizationController.removeAdmin({ ctx, userId: input.userId }),
    ),
  createOrganization: protectedProcedure
    .input(createOrganizationInput)
    .mutation(({ ctx, input }) =>
      hrOrganizationController.createOrganization({ ctx, input }),
    ),
  deleteOrganization: protectedProcedure
    .input(deleteOrganizationInput)
    .mutation(({ ctx, input }) =>
      hrOrganizationController.deleteOrganization({ ctx, input }),
    ),
  verifyDeletePassword: protectedProcedure
    .input(verifyDeletePasswordInput)
    .mutation(({ ctx, input }) =>
      hrOrganizationController.verifyDeletePassword({ ctx, input }),
    ),
});
