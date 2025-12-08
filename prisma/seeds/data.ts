import type { Gender, UserRole, WorkModel } from "@prisma/client";

export type SeedOrganization = {
  id: string;
  name: string;
  domain: string;
  timezone: string;
  locale: string;
  logoUrl: string;
};

export type SeedDepartment = {
  id: string;
  name: string;
  code: string;
  description: string;
  headId?: string | null;
};

export type SeedTeam = {
  id: string;
  name: string;
  description: string;
  departmentId: string;
};

export type SeedUserConfig = {
  id: string;
  organizationId: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  preferredName: string;
  designation: string;
  employeeCode: string;
  teamId?: string | null;
  departmentId?: string | null;
  workModel?: WorkModel;
  workPhone?: string | null;
  personalPhone?: string | null;
  reportingManagerId?: string | null;
  gender?: Gender;
};

export const SMART_HR_ORG_ID = "org-smart-hr";

export const organizations: SeedOrganization[] = [
  {
    id: SMART_HR_ORG_ID,
    name: "Smart HR Labs",
    domain: "smart-hr.app",
    timezone: "Asia/Dhaka",
    locale: "en-US",
    logoUrl: "/logo/demo.logo.png",
  },
];

export const organizationNameById = organizations.reduce<Record<string, string>>(
  (acc, org) => {
    acc[org.id] = org.name;
    return acc;
  },
  {},
);

export const orgDepartments: Record<string, SeedDepartment[]> = {
  [SMART_HR_ORG_ID]: [
    {
      id: "dept-people",
      name: "People Operations",
      code: "PEO",
      description: "HR, recruiting, and employee experience.",
      headId: "org-admin-leanne",
    },
    {
      id: "dept-delivery",
      name: "Delivery & Product",
      code: "DEL",
      description: "Product delivery, engineering, and client projects.",
      headId: "manager-drew",
    },
  ],
};

export const orgTeams: Record<string, SeedTeam[]> = {
  [SMART_HR_ORG_ID]: [
    {
      id: "team-people",
      name: "People Team",
      description: "Employee programs and compliance.",
      departmentId: "dept-people",
    },
    {
      id: "team-delivery",
      name: "Delivery Team",
      description: "Product and customer delivery pods.",
      departmentId: "dept-delivery",
    },
  ],
};

export const teamDepartmentMap = Object.values(orgTeams)
  .flat()
  .reduce<Record<string, string>>((acc, team) => {
    acc[team.id] = team.departmentId;
    return acc;
  }, {});

const withPhones = (suffix: number) => ({
  workPhone: `+880130200${suffix.toString().padStart(4, "0")}`,
  personalPhone: null,
});

export const usersToCreate: SeedUserConfig[] = [
  {
    id: "super-admin-aria",
    organizationId: SMART_HR_ORG_ID,
    email: "aria.lopez@smart-hr.app",
    password: "Shr@2000",
    role: "SUPER_ADMIN",
    firstName: "Aria",
    lastName: "Lopez",
    preferredName: "Aria",
    designation: "Chief People Officer",
    employeeCode: "SHR-0001",
    teamId: "team-people",
    workModel: "HYBRID",
    reportingManagerId: null,
    gender: "FEMALE",
    ...withPhones(2000),
  },
  {
    id: "org-owner-kai",
    organizationId: SMART_HR_ORG_ID,
    email: "kai.roth@smart-hr.app",
    password: "Shr@2001",
    role: "ORG_OWNER",
    firstName: "Kai",
    lastName: "Roth",
    preferredName: "Kai",
    designation: "Founder & CEO",
    employeeCode: "SHR-0002",
    teamId: "team-people",
    workModel: "HYBRID",
    reportingManagerId: "super-admin-aria",
    gender: "MALE",
    ...withPhones(2001),
  },
  {
    id: "org-admin-leanne",
    organizationId: SMART_HR_ORG_ID,
    email: "leanne.kim@smart-hr.app",
    password: "Shr@2002",
    role: "ORG_ADMIN",
    firstName: "Leanne",
    lastName: "Kim",
    preferredName: "Leanne",
    designation: "Head of Operations",
    employeeCode: "SHR-0003",
    teamId: "team-people",
    workModel: "HYBRID",
    reportingManagerId: "org-owner-kai",
    gender: "FEMALE",
    ...withPhones(2002),
  },
  {
    id: "hr-admin-samir",
    organizationId: SMART_HR_ORG_ID,
    email: "samir.quinn@smart-hr.app",
    password: "Shr@2003",
    role: "HR_ADMIN",
    firstName: "Samir",
    lastName: "Quinn",
    preferredName: "Samir",
    designation: "HR Programs Lead",
    employeeCode: "SHR-0004",
    teamId: "team-people",
    workModel: "HYBRID",
    reportingManagerId: "org-admin-leanne",
    gender: "MALE",
    ...withPhones(2003),
  },
  {
    id: "manager-drew",
    organizationId: SMART_HR_ORG_ID,
    email: "drew.aden@smart-hr.app",
    password: "Shr@2004",
    role: "MANAGER",
    firstName: "Drew",
    lastName: "Aden",
    preferredName: "Drew",
    designation: "Delivery Manager",
    employeeCode: "SHR-0005",
    teamId: "team-delivery",
    departmentId: "dept-delivery",
    workModel: "ONSITE",
    reportingManagerId: "org-admin-leanne",
    gender: "MALE",
    ...withPhones(2004),
  },
  {
    id: "employee-ivy",
    organizationId: SMART_HR_ORG_ID,
    email: "ivy.patel@smart-hr.app",
    password: "Shr@2005",
    role: "EMPLOYEE",
    firstName: "Ivy",
    lastName: "Patel",
    preferredName: "Ivy",
    designation: "Product Specialist",
    employeeCode: "SHR-0006",
    teamId: "team-delivery",
    departmentId: "dept-delivery",
    workModel: "REMOTE",
    reportingManagerId: "manager-drew",
    gender: "FEMALE",
    ...withPhones(2005),
  },
];

export const teamLeadAssignments: Array<{ teamId: string; leadUserIds: string[] }> = [
  { teamId: "team-people", leadUserIds: ["org-owner-kai", "org-admin-leanne"] },
  { teamId: "team-delivery", leadUserIds: ["manager-drew"] },
];

export const teamManagerAssignments: Array<{ managerId: string; teamIds: string[] }> = [
  {
    managerId: "hr-admin-samir",
    teamIds: ["team-people"],
  },
  {
    managerId: "manager-drew",
    teamIds: ["team-delivery"],
  },
];
