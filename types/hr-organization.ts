import type {
  EmploymentStatus,
  EmploymentType,
  UserRole,
  WorkModel,
} from "@prisma/client";

export type HrOrganizationStatus = "ACTIVE" | "SUSPENDED" | "ONBOARDING";

export const ORGANIZATION_MANAGEMENT_ROLES = ["ORG_OWNER", "SUPER_ADMIN"] as const;

export type OrganizationManagementRole =
  (typeof ORGANIZATION_MANAGEMENT_ROLES)[number];

export const canManageOrganization = (
  role?: UserRole | null,
): role is OrganizationManagementRole => {
  if (!role) {
    return false;
  }
  return (ORGANIZATION_MANAGEMENT_ROLES as readonly UserRole[]).includes(role);
};

export type HrOrganizationDetails = {
  id: string;
  name: string;
  subDomain: string;
  domain: string | null;
  timezone: string | null;
  locale: string | null;
  logoUrl: string;
  createdAtIso: string;
  updatedAtIso: string;
  totalEmployees: number;
  status: HrOrganizationStatus;
  monthlyActiveUsers: number;
};

export type HrOrganizationAdmin = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string | null;
  avatarUrl: string | null;
};

export type HrOrganizationMember = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string | null;
};

export type HrOrganizationMemberSummary = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string | null;
  status: EmploymentStatus;
  joinedAtIso: string | null;
  employeeCode: string | null;
  avatarUrl: string | null;
};

export type HrOrganizationManagementResponse = {
  viewerRole: UserRole;
  canManage: boolean;
  organization: HrOrganizationDetails | null;
  admins: HrOrganizationAdmin[];
  eligibleMembers: HrOrganizationMember[];
  canCreateOrganizations: boolean;
};

export type HrCreateOrganizationResponse = {
  organizationId: string;
  organizationName: string;
  organizationSubDomain: string;
  ownerId: string;
  ownerEmail: string;
  inviteUrl: string;
  invitationSent: boolean;
};

export type HrOrganizationListResponse = {
  organizations: HrOrganizationDetails[];
};

export type HrOrganizationDeleteResponse = {
  organizationId: string;
  message: string;
};

export type HrOrganizationPasswordVerificationResponse = {
  valid: boolean;
};

export type HrOrganizationMembersResponse = {
  organizationId: string;
  members: HrOrganizationMemberSummary[];
  total: number;
  nextCursor?: string;
};

export type HrOrganizationDepartmentSummary = {
  id: string;
  name: string;
  memberCount: number;
  teamCount: number;
};

export type HrOrganizationTeamSummary = {
  id: string;
  name: string;
  departmentName: string | null;
  memberCount: number;
};

export type HrOrganizationInsightPoint = {
  label: string;
  value: number;
};

export type HrOrganizationDetailsResponse = {
  organization: HrOrganizationDetails;
  stats: {
    headcount: number;
    active: number;
    probation: number;
    inactive: number;
    departments: number;
    teams: number;
  };
  departments: HrOrganizationDepartmentSummary[];
  teams: HrOrganizationTeamSummary[];
  charts: {
    headcountTrend: HrOrganizationInsightPoint[];
    roleDistribution: HrOrganizationInsightPoint[];
  };
};

export type HrOrganizationEmployeeProfileRow = {
  label: string;
  value: string;
};

export type HrOrganizationEmployeeProfileResponse = {
  profile: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: UserRole;
    designation: string | null;
    department: string | null;
    team: string | null;
    managerName: string | null;
    employeeCode: string | null;
    employmentType: EmploymentType | null;
    workModel: WorkModel | null;
    status: EmploymentStatus;
    startDateIso: string | null;
    bio: string | null;
  };
  overview: {
    stats: HrOrganizationEmployeeProfileRow[];
    tags: string[];
  };
  basicInfo: HrOrganizationEmployeeProfileRow[];
  contactInfo: HrOrganizationEmployeeProfileRow[];
  addressPreferences: HrOrganizationEmployeeProfileRow[];
};
