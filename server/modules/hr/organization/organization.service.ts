import bcrypt from "bcryptjs";
import {
  EmploymentStatus,
  EmploymentType,
  Prisma,
  UserRole,
  WorkModel,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "@/server/api/trpc";
import type {
  HrOrganizationDetailsResponse,
  HrOrganizationEmployeeProfileResponse,
  HrOrganizationEmployeeProfileRow,
  HrOrganizationListResponse,
  HrOrganizationManagementResponse,
  HrCreateOrganizationResponse,
  HrOrganizationDeleteResponse,
  HrOrganizationMembersResponse,
  HrOrganizationStatus,
  HrOrganizationPasswordVerificationResponse,
} from "@/types/hr-organization";
import { canManageOrganization } from "@/types/hr-organization";
import {
  INVITE_TOKEN_TTL_HOURS,
  buildInviteLink,
  createPlaceholderPasswordHash,
  normalizeEmail,
  normalizePhoneNumber,
  sanitizeOptional,
  sendInvitationEmail,
  splitFullName,
} from "@/server/modules/hr/employees/invite.helpers";
import { deleteUserCascade } from "@/server/modules/hr/employees/delete-user";
import {
  requireOrganizationManager,
  requireSuperAdmin,
} from "@/server/modules/hr/utils";
import { addHours, createRandomToken, hashToken } from "@/server/utils/token";
import { DEFAULT_ORGANIZATION_LOGO } from "@/lib/organization-branding";
const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const normalizeSubDomain = (value: string) => value.trim().toLowerCase();

const buildDisplayName = (
  profile: {
    firstName: string | null;
    lastName: string | null;
    preferredName: string | null;
  } | null,
  fallback: string,
) => {
  if (!profile) {
    return fallback;
  }
  if (profile.preferredName?.trim()) {
    return profile.preferredName.trim();
  }
  const names = [profile.firstName, profile.lastName].filter(Boolean);
  if (names.length) {
    return names.join(" ");
  }
  return fallback;
};

const mapOrganizationRecord = (
  record: {
    id: string;
    name: string;
    subDomain: string;
    domain: string | null;
    timezone: string | null;
    locale: string | null;
    logoUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: { users: number };
  },
  overrides?: { status?: HrOrganizationStatus; monthlyActiveUsers?: number },
) => {
  const baseStatus: HrOrganizationStatus =
    record._count.users === 0 ? "ONBOARDING" : "ACTIVE";
  return {
    id: record.id,
    name: record.name,
    subDomain: record.subDomain,
    domain: record.domain,
    timezone: record.timezone,
    locale: record.locale,
    logoUrl: record.logoUrl ?? DEFAULT_ORGANIZATION_LOGO,
    createdAtIso: record.createdAt.toISOString(),
    updatedAtIso: record.updatedAt.toISOString(),
    totalEmployees: record._count.users,
    status: overrides?.status ?? baseStatus,
    monthlyActiveUsers: overrides?.monthlyActiveUsers ?? 0,
  };
};

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ORG_OWNER: "Org Owner",
  ORG_ADMIN: "Org Admin",
  HR_ADMIN: "HR Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
};

const formatEnumLabel = (value?: string | null) => {
  if (!value) {
    return "—";
  }
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatDateValue = (value?: Date | string | null) => {
  if (!value) {
    return "—";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const ensureValue = (value?: string | null) =>
  value && value.trim().length ? value : "—";

const buildMonthlyBuckets = (months: number) => {
  const now = new Date();
  const buckets: Array<{ label: string; start: Date; end: Date }> = [];
  for (let index = months - 1; index >= 0; index -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - index + 1, 0, 23, 59, 59, 999);
    buckets.push({
      label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(start),
      start,
      end,
    });
  }
  return buckets;
};

const MONTHS_IN_TREND = 6;

const generateOwnerEmployeeCode = (organizationName: string) => {
  const normalized = organizationName
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase();
  const prefix = normalized.slice(0, 4) || "ORG";
  return `${prefix}-OWNER-1`;
};

const handlePrismaError = (error: unknown): never => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const target = Array.isArray(error.meta?.target)
      ? error.meta?.target.join(", ")
      : (error.meta?.target as string | undefined);
    if (target?.includes("domain")) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "That organization domain is already in use.",
      });
    }
    if (target?.includes("subDomain")) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "That sub-domain is already in use.",
      });
    }
    if (target?.includes("email")) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "An account already exists for that email address.",
      });
    }
  }
  throw error;
};

export const hrOrganizationService = {
  async management(
    ctx: TRPCContext,
    organizationId?: string,
  ): Promise<HrOrganizationManagementResponse> {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const user = ctx.session.user;
    const viewerRole = user.role as UserRole;
    if (!canManageOrganization(viewerRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Organization management access denied.",
      });
    }

    let totalOrganizations = 0;
    if (viewerRole === "SUPER_ADMIN") {
      totalOrganizations = await ctx.prisma.organization.count();
    }
    const canCreateOrganizations =
      viewerRole === "SUPER_ADMIN" && totalOrganizations === 0;
    let targetOrganizationId = user.organizationId ?? null;

    if (viewerRole === "SUPER_ADMIN" && organizationId) {
      targetOrganizationId = organizationId;
    } else if (organizationId && organizationId !== targetOrganizationId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only manage your own organization.",
      });
    }

    if (!targetOrganizationId) {
      return {
        viewerRole,
        canManage: true,
        organization: null,
        admins: [],
        eligibleMembers: [],
        canCreateOrganizations,
      };
    }

    const [organization, adminRecords, eligibleRecords] = await Promise.all([
      ctx.prisma.organization.findUnique({
        where: { id: targetOrganizationId },
        select: {
          id: true,
          name: true,
          subDomain: true,
          domain: true,
          timezone: true,
          locale: true,
          logoUrl: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { users: true },
          },
        },
      }),
      ctx.prisma.user.findMany({
        where: {
          organizationId: targetOrganizationId,
          role: "ORG_ADMIN",
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          email: true,
          role: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              preferredName: true,
              profilePhotoUrl: true,
            },
          },
          employment: {
            select: {
              designation: true,
            },
          },
        },
      }),
      ctx.prisma.user.findMany({
        where: {
          organizationId: targetOrganizationId,
          role: { in: ["HR_ADMIN", "MANAGER", "EMPLOYEE"] },
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          email: true,
          role: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              preferredName: true,
            },
          },
          employment: {
            select: {
              designation: true,
            },
          },
        },
      }),
    ]);

    if (!organization) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found.",
      });
    }

    return {
      viewerRole,
      canManage: true,
      organization: mapOrganizationRecord(organization),
      admins: adminRecords.map((admin) => ({
        id: admin.id,
        name: buildDisplayName(admin.profile, admin.email),
        email: admin.email,
        role: admin.role as UserRole,
        designation: admin.employment?.designation ?? null,
        avatarUrl: admin.profile?.profilePhotoUrl ?? null,
      })),
      eligibleMembers: eligibleRecords.map((member) => ({
        id: member.id,
        name: buildDisplayName(member.profile, member.email),
        email: member.email,
        role: member.role as UserRole,
        designation: member.employment?.designation ?? null,
      })),
      canCreateOrganizations,
    };
  },

  async listAll(ctx: TRPCContext): Promise<HrOrganizationListResponse> {
    requireSuperAdmin(ctx);
    const organizations = await ctx.prisma.organization.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        subDomain: true,
        domain: true,
        timezone: true,
        locale: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { users: true },
        },
      },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [monthlyActiveGroups, activeEmployeeGroups] = await Promise.all([
      ctx.prisma.user.groupBy({
        by: ["organizationId"],
        where: {
          lastLoginAt: {
            gte: thirtyDaysAgo,
          },
        },
        _count: { _all: true },
      }),
      ctx.prisma.user.groupBy({
        by: ["organizationId"],
        where: {
          status: EmploymentStatus.ACTIVE,
        },
        _count: { _all: true },
      }),
    ]);

    const monthlyActiveMap = new Map(
      monthlyActiveGroups.map((group) => [group.organizationId, group._count._all]),
    );
    const activeEmployeeMap = new Map(
      activeEmployeeGroups.map((group) => [group.organizationId, group._count._all]),
    );

    return {
      organizations: organizations.map((organization) => {
        const activeCount = activeEmployeeMap.get(organization.id) ?? 0;
        let status: HrOrganizationStatus =
          organization._count.users === 0 ? "ONBOARDING" : "ACTIVE";
        if (organization._count.users > 0 && activeCount === 0) {
          status = "SUSPENDED";
        }

        return mapOrganizationRecord(organization, {
          status,
          monthlyActiveUsers: monthlyActiveMap.get(organization.id) ?? 0,
        });
      }),
    };
  },

  async listMembers(
    ctx: TRPCContext,
    input: {
      organizationId: string;
      cursor?: string | null;
      limit?: number;
    },
  ): Promise<HrOrganizationMembersResponse> {
    requireSuperAdmin(ctx);
    const organizationId = input.organizationId?.trim();
    if (!organizationId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Select an organization to inspect.",
      });
    }

    const organization = await ctx.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });

    if (!organization) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found.",
      });
    }

    const limit = Math.min(Math.max(input.limit ?? 10, 1), 50);
    const total = await ctx.prisma.user.count({
      where: { organizationId },
    });

    const members = await ctx.prisma.user.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      skip: input.cursor ? 1 : 0,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            preferredName: true,
            profilePhotoUrl: true,
          },
        },
        employment: {
          select: {
            designation: true,
            status: true,
            startDate: true,
            employeeCode: true,
          },
        },
      },
    });

    let nextCursor: string | undefined;
    if (members.length > limit) {
      const nextItem = members.pop();
      nextCursor = nextItem?.id;
    }

    return {
      organizationId: organization.id,
      total,
      nextCursor,
      members: members.map((member) => ({
        id: member.id,
        name: buildDisplayName(member.profile, member.email),
        email: member.email,
        role: member.role as UserRole,
        designation: member.employment?.designation ?? null,
        status: member.employment?.status ?? EmploymentStatus.ACTIVE,
        joinedAtIso: member.employment?.startDate
          ? member.employment.startDate.toISOString()
          : member.createdAt.toISOString(),
        employeeCode: member.employment?.employeeCode ?? null,
        avatarUrl: member.profile?.profilePhotoUrl ?? null,
      })),
    };
  },

  async details(
    ctx: TRPCContext,
    organizationId: string,
  ): Promise<HrOrganizationDetailsResponse> {
    requireSuperAdmin(ctx);
    const targetOrganizationId = organizationId.trim();
    if (!targetOrganizationId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Select an organization to inspect.",
      });
    }

    const organizationRecord = await ctx.prisma.organization.findUnique({
      where: { id: targetOrganizationId },
      select: {
        id: true,
        name: true,
        subDomain: true,
        domain: true,
        timezone: true,
        locale: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { users: true },
        },
      },
    });

    if (!organizationRecord) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found.",
      });
    }

    const [
      statusGroups,
      departmentRecords,
      teamRecords,
      roleGroups,
      hireRecords,
    ] = await Promise.all([
      ctx.prisma.employmentDetail.groupBy({
        by: ["status"],
        where: { organizationId: targetOrganizationId },
        _count: { _all: true },
      }),
      ctx.prisma.department.findMany({
        where: { organizationId: targetOrganizationId },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              employees: true,
              teams: true,
            },
          },
        },
      }),
      ctx.prisma.team.findMany({
        where: { organizationId: targetOrganizationId },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          department: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              primaryMembers: true,
            },
          },
        },
      }),
      ctx.prisma.user.groupBy({
        by: ["role"],
        where: { organizationId: targetOrganizationId },
        _count: { _all: true },
      }),
      ctx.prisma.employmentDetail.findMany({
        where: {
          organizationId: targetOrganizationId,
        },
        select: {
          startDate: true,
        },
        orderBy: { startDate: "asc" },
      }),
    ]);

    const statusCounts: Record<EmploymentStatus, number> = {
      [EmploymentStatus.ACTIVE]: 0,
      [EmploymentStatus.PROBATION]: 0,
      [EmploymentStatus.INACTIVE]: 0,
      [EmploymentStatus.TERMINATED]: 0,
      [EmploymentStatus.SABBATICAL]: 0,
    };

    statusGroups.forEach((group) => {
      statusCounts[group.status] = group._count._all;
    });

    const departments = departmentRecords.map((dept) => ({
      id: dept.id,
      name: dept.name,
      memberCount: dept._count.employees,
      teamCount: dept._count.teams,
    }));

    const teams = teamRecords.map((team) => ({
      id: team.id,
      name: team.name,
      departmentName: team.department?.name ?? null,
      memberCount: team._count.primaryMembers,
    }));

    const roleDistribution = roleGroups.map((group) => ({
      label: ROLE_LABELS[group.role as UserRole] ?? group.role,
      value: group._count._all,
    }));

    const bucketedTrend = buildMonthlyBuckets(MONTHS_IN_TREND).map((bucket) => {
      const value = hireRecords.filter((hire) => {
        if (!hire.startDate) {
          return false;
        }
        const timestamp = hire.startDate.getTime();
        return (
          timestamp >= bucket.start.getTime() &&
          timestamp <= bucket.end.getTime()
        );
      }).length;
      return {
        label: bucket.label,
        value,
      };
    });

    const organization = mapOrganizationRecord(organizationRecord);

    return {
      organization,
      stats: {
        headcount: organization.totalEmployees,
        active: statusCounts[EmploymentStatus.ACTIVE] ?? 0,
        probation: statusCounts[EmploymentStatus.PROBATION] ?? 0,
        inactive:
          (statusCounts[EmploymentStatus.INACTIVE] ?? 0) +
          (statusCounts[EmploymentStatus.TERMINATED] ?? 0) +
          (statusCounts[EmploymentStatus.SABBATICAL] ?? 0),
        departments: departments.length,
        teams: teams.length,
      },
      departments,
      teams,
      charts: {
        headcountTrend: bucketedTrend,
        roleDistribution,
      },
    };
  },

  async employeeProfile(
    ctx: TRPCContext,
    input: { organizationId: string; employeeId: string },
  ): Promise<HrOrganizationEmployeeProfileResponse> {
    requireSuperAdmin(ctx);
    const organizationId = input.organizationId?.trim();
    const employeeId = input.employeeId?.trim();
    if (!organizationId || !employeeId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Organization and employee are required.",
      });
    }

    const employee = await ctx.prisma.user.findFirst({
      where: { id: employeeId, organizationId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            preferredName: true,
            bio: true,
            gender: true,
            nationality: true,
            dateOfBirth: true,
            profilePhotoUrl: true,
            workModel: true,
            currentAddress: true,
            permanentAddress: true,
            workEmail: true,
            workPhone: true,
            personalEmail: true,
            personalPhone: true,
          },
        },
        employment: {
          select: {
            employeeCode: true,
            designation: true,
            employmentType: true,
            status: true,
            startDate: true,
            department: {
              select: { name: true },
            },
            team: {
              select: { name: true },
            },
            manager: {
              select: {
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    preferredName: true,
                  },
                },
              },
            },
          },
        },
        emergencyContacts: {
          select: {
            name: true,
            relationship: true,
            phone: true,
          },
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
    });

    if (!employee) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Employee not found in this organization.",
      });
    }

    const profile = employee.profile;
    const employment = employee.employment;
    const emergencyContact = employee.emergencyContacts[0];
    const managerName = employment?.manager
      ? buildDisplayName(employment.manager.profile, employment.manager.email)
      : null;

    const overviewStats = [
      {
        label: "Status",
        value: formatEnumLabel(employment?.status ?? EmploymentStatus.ACTIVE),
      },
      {
        label: "Employment Type",
        value: formatEnumLabel(employment?.employmentType),
      },
      {
        label: "Joined",
        value: formatDateValue(employment?.startDate),
      },
    ];

    const tags = [
      employment?.department?.name ?? undefined,
      employment?.team?.name ?? undefined,
      formatEnumLabel(profile?.workModel),
    ].filter((value): value is string => Boolean(value && value !== "—"));

    const basicInfo: HrOrganizationEmployeeProfileRow[] = [
      { label: "Employee ID", value: ensureValue(employment?.employeeCode) },
      { label: "Department", value: ensureValue(employment?.department?.name) },
      { label: "Team", value: ensureValue(employment?.team?.name) },
      { label: "Manager", value: ensureValue(managerName) },
      { label: "Role", value: ensureValue(employment?.designation) },
      {
        label: "User Role",
        value: ROLE_LABELS[employee.role as UserRole] ?? employee.role,
      },
    ];

    const contactInfo: HrOrganizationEmployeeProfileRow[] = [
      {
        label: "Work Email",
        value: ensureValue(profile?.workEmail ?? employee.email),
      },
      {
        label: "Personal Email",
        value: ensureValue(profile?.personalEmail),
      },
      {
        label: "Work Phone",
        value: ensureValue(profile?.workPhone),
      },
      {
        label: "Personal Phone",
        value: ensureValue(profile?.personalPhone ?? employee.phone),
      },
      {
        label: "Emergency Contact",
        value: emergencyContact
          ? `${emergencyContact.name} (${emergencyContact.relationship})`
          : "—",
      },
      {
        label: "Emergency Phone",
        value: ensureValue(emergencyContact?.phone),
      },
    ];

    const addressPreferences: HrOrganizationEmployeeProfileRow[] = [
      {
        label: "Current Address",
        value: ensureValue(profile?.currentAddress),
      },
      {
        label: "Permanent Address",
        value: ensureValue(profile?.permanentAddress),
      },
      {
        label: "Work Model",
        value: formatEnumLabel(profile?.workModel),
      },
      {
        label: "Nationality",
        value: ensureValue(profile?.nationality),
      },
    ];

    return {
      profile: {
        id: employee.id,
        name: buildDisplayName(profile, employee.email),
        email: employee.email,
        avatarUrl: profile?.profilePhotoUrl ?? null,
        role: employee.role as UserRole,
        designation: employment?.designation ?? null,
        department: employment?.department?.name ?? null,
        team: employment?.team?.name ?? null,
        managerName,
        employeeCode: employment?.employeeCode ?? null,
        employmentType: employment?.employmentType ?? null,
        workModel: profile?.workModel ?? null,
        status: employment?.status ?? EmploymentStatus.ACTIVE,
        startDateIso: employment?.startDate
          ? employment.startDate.toISOString()
          : null,
        bio: profile?.bio ?? null,
      },
      overview: {
        stats: overviewStats,
        tags,
      },
      basicInfo,
      contactInfo,
      addressPreferences,
    };
  },

  async updateDetails(
    ctx: TRPCContext,
    input: {
      name: string;
      domain?: string | null;
      timezone?: string | null;
      locale?: string | null;
      organizationId?: string | null;
      logoUrl?: string | null;
      subDomain?: string;
    },
  ) {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const viewer = ctx.session.user;
    let targetOrganizationId: string | null = viewer.organizationId ?? null;

    if (viewer.role === "SUPER_ADMIN") {
      targetOrganizationId = input.organizationId ?? targetOrganizationId;
    } else {
      const manager = requireOrganizationManager(ctx);
      targetOrganizationId = manager.organizationId;
      if (input.organizationId && input.organizationId !== targetOrganizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot edit another organization.",
        });
      }
    }

    if (!targetOrganizationId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Select an organization to update.",
      });
    }

    const nextName = input.name.trim();
    if (!nextName) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Organization name cannot be empty.",
      });
    }

    const currentOrganization = await ctx.prisma.organization.findUnique({
      where: { id: targetOrganizationId },
      select: { id: true, subDomain: true },
    });

    if (!currentOrganization) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found.",
      });
    }

    const nextDomain = sanitizeOptional(input.domain)?.toLowerCase() ?? null;
    const nextTimezone = sanitizeOptional(input.timezone);
    const nextLocale = sanitizeOptional(input.locale);
    const nextLogo = sanitizeOptional(input.logoUrl);
    let nextSubDomain: string | undefined;

    if (typeof input.subDomain === "string") {
      nextSubDomain = normalizeSubDomain(input.subDomain);
      if (!nextSubDomain.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sub-domain cannot be empty.",
        });
      }
      if (nextSubDomain.length < 3 || nextSubDomain.length > 63) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sub-domain must be between 3 and 63 characters.",
        });
      }
      if (!SUBDOMAIN_PATTERN.test(nextSubDomain)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Sub-domain can only include lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.",
        });
      }
      if (nextSubDomain !== currentOrganization.subDomain) {
        const existingSubDomain = await ctx.prisma.organization.findUnique({
          where: { subDomain: nextSubDomain },
          select: { id: true },
        });

        if (existingSubDomain) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "That sub-domain is already in use.",
          });
        }
      }
    }

    if (!nextLogo) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Organization logo is required.",
      });
    }

    try {
      const updatePayload: Prisma.OrganizationUpdateInput = {
        name: nextName,
        domain: nextDomain,
        timezone: nextTimezone ?? null,
        locale: nextLocale ?? null,
        logoUrl: nextLogo,
      };

      if (typeof input.subDomain === "string" && nextSubDomain) {
        updatePayload.subDomain = nextSubDomain;
      }

      const updated = await ctx.prisma.organization.update({
        where: { id: targetOrganizationId },
        data: updatePayload,
        select: {
          id: true,
          name: true,
          subDomain: true,
          domain: true,
          timezone: true,
          locale: true,
          logoUrl: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { users: true },
          },
        },
      });

      return { organization: mapOrganizationRecord(updated) };
    } catch (error) {
      return handlePrismaError(error);
    }
  },

  async addAdmin(ctx: TRPCContext, userId: string) {
    const sessionUser = requireOrganizationManager(ctx);
    const organizationId = sessionUser.organizationId;

    const target = await ctx.prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!target) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Employee not found in this organization.",
      });
    }

    if (target.role === "ORG_OWNER" || target.role === "SUPER_ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You cannot change this role to Org Admin.",
      });
    }

    if (target.role === "ORG_ADMIN") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "This employee is already an Org Admin.",
      });
    }

    await ctx.prisma.user.update({
      where: { id: target.id },
      data: { role: "ORG_ADMIN" },
    });

    return { userId: target.id, role: "ORG_ADMIN" as UserRole };
  },

  async removeAdmin(ctx: TRPCContext, userId: string) {
    const sessionUser = requireOrganizationManager(ctx);
    const organizationId = sessionUser.organizationId;

    const target = await ctx.prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
        role: "ORG_ADMIN",
      },
      select: { id: true },
    });

    if (!target) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Org Admin not found.",
      });
    }

    await ctx.prisma.user.update({
      where: { id: target.id },
      data: { role: "HR_ADMIN" },
    });

    return { userId: target.id, role: "HR_ADMIN" as UserRole };
  },

  async createOrganization(
    ctx: TRPCContext,
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
    },
  ): Promise<HrCreateOrganizationResponse> {
    const sessionUser = requireSuperAdmin(ctx);

    const organizationName = input.name.trim();
    if (!organizationName) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Organization name is required.",
      });
    }

    const normalizedSubDomain = normalizeSubDomain(input.subDomain ?? "");
    if (normalizedSubDomain.length < 3 || normalizedSubDomain.length > 63) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Sub-domain must be between 3 and 63 characters.",
      });
    }
    if (!SUBDOMAIN_PATTERN.test(normalizedSubDomain)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Sub-domain can only include lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.",
      });
    }

    const normalizedEmail = normalizeEmail(input.ownerEmail);
    const normalizedPhone = normalizePhoneNumber(input.ownerPhone);
    const ownerDesignation = sanitizeOptional(input.ownerDesignation) ?? "Org Owner";
    const timezone = sanitizeOptional(input.timezone) ?? "Asia/Dhaka";
    const locale = sanitizeOptional(input.locale) ?? "en-US";
    const domain = sanitizeOptional(input.domain)?.toLowerCase() ?? null;
    const logoUrl = sanitizeOptional(input.logoUrl) ?? DEFAULT_ORGANIZATION_LOGO;

    const existingSubDomain = await ctx.prisma.organization.findUnique({
      where: { subDomain: normalizedSubDomain },
      select: { id: true },
    });

    if (existingSubDomain) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "That sub-domain is already in use.",
      });
    }

    const existingUser = await ctx.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "An account already exists for that email.",
      });
    }

    const placeholderPasswordHash = await createPlaceholderPasswordHash();
    const { firstName, lastName } = splitFullName(input.ownerName);
    const employeeCode = generateOwnerEmployeeCode(organizationName);

    try {
      const creation = await ctx.prisma.$transaction(async (tx) => {
        const organization = await tx.organization.create({
          data: {
            name: organizationName,
            subDomain: normalizedSubDomain,
            domain,
            timezone,
            locale,
            logoUrl,
          },
        });

        const owner = await tx.user.create({
          data: {
            organizationId: organization.id,
            email: normalizedEmail,
            phone: normalizedPhone,
            passwordHash: placeholderPasswordHash,
            role: "ORG_OWNER",
            status: EmploymentStatus.INACTIVE,
            invitedAt: new Date(),
            invitedById: sessionUser.id,
          },
          select: {
            id: true,
            email: true,
          },
        });

        await tx.employeeProfile.create({
          data: {
            userId: owner.id,
            firstName,
            lastName,
            preferredName: firstName,
            workEmail: normalizedEmail,
            workPhone: normalizedPhone,
            workModel: WorkModel.HYBRID,
          },
        });

        await tx.employmentDetail.create({
          data: {
            userId: owner.id,
            organizationId: organization.id,
            employeeCode,
            designation: ownerDesignation,
            employmentType: EmploymentType.FULL_TIME,
            status: EmploymentStatus.INACTIVE,
            startDate: new Date(),
            primaryLocation: null,
          },
        });

        await tx.invitationToken.deleteMany({
          where: { userId: owner.id },
        });

        const rawToken = createRandomToken();
        const tokenHash = hashToken(rawToken);
        const expiresAt = addHours(INVITE_TOKEN_TTL_HOURS);

        await tx.invitationToken.create({
          data: {
            userId: owner.id,
            tokenHash,
            expiresAt,
          },
        });

        return {
          organization,
          owner,
          rawToken,
          expiresAt,
        };
      });

      const inviteLink = buildInviteLink(
        creation.organization.subDomain,
        creation.rawToken,
        normalizedEmail,
      );
      let invitationSent = false;

      if (input.sendInvite ?? true) {
        try {
          const senderDisplayName =
            ctx.session?.user?.profile?.preferredName ??
            ctx.session?.user?.profile?.firstName ??
            ctx.session?.user?.email ??
            sessionUser.email ??
            null;

          invitationSent = await sendInvitationEmail({
            to: normalizedEmail,
            inviteLink,
            organizationName,
            invitedRole: "ORG_OWNER",
            recipientName: firstName,
            expiresAt: creation.expiresAt,
            senderName: senderDisplayName,
          });
        } catch (error) {
          console.error("Failed to send org owner invite:", error);
          invitationSent = false;
        }
      }

      return {
        organizationId: creation.organization.id,
        organizationName,
        organizationSubDomain: creation.organization.subDomain,
        ownerId: creation.owner.id,
        ownerEmail: normalizedEmail,
        inviteUrl: inviteLink,
        invitationSent,
      };
    } catch (error) {
      return handlePrismaError(error);
    }
  },

  async verifyDeletePassword(
    ctx: TRPCContext,
    password: string,
  ): Promise<HrOrganizationPasswordVerificationResponse> {
    const sessionUser = requireSuperAdmin(ctx);
    const authRecord = await ctx.prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { passwordHash: true },
    });

    if (!authRecord?.passwordHash) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unable to verify your account.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, authRecord.passwordHash);
    if (!isPasswordValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Incorrect password. Try again.",
      });
    }

    return { valid: true };
  },

  async deleteOrganization(
    ctx: TRPCContext,
    input: { organizationId: string; password: string },
  ): Promise<HrOrganizationDeleteResponse> {
    const sessionUser = requireSuperAdmin(ctx);

    const authRecord = await ctx.prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { passwordHash: true },
    });

    if (!authRecord?.passwordHash) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unable to verify your account.",
      });
    }

    const isPasswordValid = await bcrypt.compare(input.password, authRecord.passwordHash);
    if (!isPasswordValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Incorrect password. Try again.",
      });
    }

    const organization = await ctx.prisma.organization.findUnique({
      where: { id: input.organizationId },
      select: { id: true },
    });

    if (!organization) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found." });
    }

    await ctx.prisma.$transaction(
      async (tx) => {
        const organizationId = input.organizationId;

        // Remove nested records that do not automatically cascade on organization delete.
        await tx.threadParticipant.deleteMany({
          where: { thread: { organizationId } },
        });
        await tx.chatMessage.deleteMany({
          where: { thread: { organizationId } },
        });
        await tx.notificationReceipt.deleteMany({
          where: { notification: { organizationId } },
        });
        await tx.dailyReportEntry.deleteMany({
          where: { report: { organizationId } },
        });
        await tx.monthlyReportEntry.deleteMany({
          where: { report: { organizationId } },
        });
        await tx.invoiceItem.deleteMany({
          where: { invoice: { organizationId } },
        });
        await tx.teamLead.deleteMany({
          where: { team: { organizationId } },
        });
        await tx.teamManager.deleteMany({
          where: { team: { organizationId } },
        });

        await tx.thread.deleteMany({ where: { organizationId } });
        await tx.notification.deleteMany({ where: { organizationId } });
        await tx.dailyReport.deleteMany({ where: { organizationId } });
        await tx.monthlyReport.deleteMany({ where: { organizationId } });
        await tx.invoice.deleteMany({ where: { organizationId } });
        await tx.project.deleteMany({ where: { organizationId } });
        await tx.holiday.deleteMany({ where: { organizationId } });
        await tx.workPolicy.deleteMany({ where: { organizationId } });
        await tx.team.deleteMany({ where: { organizationId } });
        await tx.department.deleteMany({ where: { organizationId } });
        await tx.employmentDetail.deleteMany({ where: { organizationId } });

        const orgUsers = await tx.user.findMany({
          where: { organizationId },
          select: { id: true },
        });

        for (const orgUser of orgUsers) {
          await deleteUserCascade(tx, orgUser.id);
        }

        await tx.organization.delete({ where: { id: organizationId } });
      },
      { timeout: 20000 },
    );

    return {
      organizationId: input.organizationId,
      message: "Organization deleted.",
    };
  },
};
