import { PrismaClient } from "@prisma/client";

import { SMART_HR_ORG_ID } from "./data";

const projects = [
  {
    id: "proj-people-suite",
    organizationId: SMART_HR_ORG_ID,
    name: "People Suite Expansion",
    code: "SMART-HR-001",
    description: "Rolling out onboarding, payroll, and insights to pilot customers.",
    clientName: "Smart HR Labs",
    status: "ACTIVE" as const,
    startDate: new Date("2024-12-15"),
    projectManager: "manager-drew",
  },
];

const projectAssignments = [
  {
    userId: "manager-drew",
    projectId: "proj-people-suite",
    note: "Owns delivery for the Smart HR pilot rollout.",
  },
  {
    userId: "employee-ivy",
    projectId: "proj-people-suite",
    note: "Implements onboarding wizard refinements.",
  },
];

export const seedProjects = async (prisma: PrismaClient) => {
  for (const project of projects) {
    await prisma.project.create({ data: project });
  }

  for (const assignment of projectAssignments) {
    await prisma.employmentDetail.update({
      where: { userId: assignment.userId },
      data: {
        currentProjectId: assignment.projectId,
        currentProjectNote: assignment.note,
      },
    });
  }
};
