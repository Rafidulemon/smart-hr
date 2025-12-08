import type { PrismaClient } from "@prisma/client";

import { SMART_HR_ORG_ID } from "./data";

type DailySeed = {
  employeeId: string;
  reportDate: string;
  note?: string;
  entries: Array<{
    workType: string;
    taskName: string;
    details: string;
    workingHours: number;
    others?: string;
  }>;
};

type MonthlySeed = {
  employeeId: string;
  reportMonth: string;
  entries: Array<{
    taskName: string;
    storyPoint: number;
    workingHours: number;
  }>;
};

const dailyReports: DailySeed[] = [
  {
    employeeId: "employee-ivy",
    reportDate: "2025-01-05",
    note: "Focused on onboarding workflow polish.",
    entries: [
      {
        workType: "Development",
        taskName: "Checklist builder",
        details: "Added drag-and-drop ordering for onboarding tasks.",
        workingHours: 3.5,
      },
      {
        workType: "Support",
        taskName: "Client sync",
        details: "Walked Acme HR through the new approvals view.",
        workingHours: 2,
        others: "Customer call",
      },
    ],
  },
  {
    employeeId: "manager-drew",
    reportDate: "2025-01-05",
    note: "Morning on roadmap planning, afternoon reviews.",
    entries: [
      {
        workType: "Planning",
        taskName: "Q1 roadmap",
        details: "Sequenced payroll automation milestones.",
        workingHours: 2.5,
      },
      {
        workType: "Review",
        taskName: "Code reviews",
        details: "Reviewed PTO accrual refactor and messaging fixes.",
        workingHours: 2,
      },
    ],
  },
];

const monthlyReports: MonthlySeed[] = [
  {
    employeeId: "employee-ivy",
    reportMonth: "2024-12-01",
    entries: [
      { taskName: "Onboarding wizard", storyPoint: 13, workingHours: 48 },
      { taskName: "Leave insights", storyPoint: 8, workingHours: 26 },
    ],
  },
  {
    employeeId: "manager-drew",
    reportMonth: "2024-12-01",
    entries: [
      { taskName: "Roadmap planning", storyPoint: 5, workingHours: 20 },
      { taskName: "Delivery coaching", storyPoint: 3, workingHours: 12 },
    ],
  },
];

export const seedReports = async (prisma: PrismaClient) => {
  const dailyCount = await prisma.dailyReport.count();
  if (dailyCount === 0) {
    for (const report of dailyReports) {
      await prisma.dailyReport.create({
        data: {
          organizationId: SMART_HR_ORG_ID,
          employeeId: report.employeeId,
          reportDate: new Date(report.reportDate),
          note: report.note,
          entries: {
            create: report.entries.map((entry) => ({
              workType: entry.workType,
              taskName: entry.taskName,
              details: entry.details,
              workingHours: entry.workingHours,
              others: entry.others ?? null,
            })),
          },
        },
      });
    }
    console.log("Seeded example daily reports.");
  } else {
    console.log("Daily reports already present, skipping daily report seed.");
  }

  const monthlyCount = await prisma.monthlyReport.count();
  if (monthlyCount === 0) {
    for (const report of monthlyReports) {
      await prisma.monthlyReport.create({
        data: {
          organizationId: SMART_HR_ORG_ID,
          employeeId: report.employeeId,
          reportMonth: new Date(report.reportMonth),
          entries: {
            create: report.entries.map((entry) => ({
              taskName: entry.taskName,
              storyPoint: entry.storyPoint,
              workingHours: entry.workingHours,
            })),
          },
        },
      });
    }
    console.log("Seeded example monthly reports.");
  } else {
    console.log("Monthly reports already present, skipping monthly report seed.");
  }
};
