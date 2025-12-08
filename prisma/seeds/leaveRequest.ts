import { Prisma, PrismaClient } from "@prisma/client";

const leaveRequests = [
  {
    id: "leave-1",
    employeeId: "employee-ivy",
    leaveType: "CASUAL" as const,
    startDate: new Date("2025-01-18"),
    endDate: new Date("2025-01-19"),
    totalDays: new Prisma.Decimal(2),
    status: "APPROVED" as const,
    reason: "Family trip.",
    reviewerId: "manager-drew",
    reviewedAt: new Date("2025-01-15T10:00:00+06:00"),
  },
  {
    id: "leave-2",
    employeeId: "manager-drew",
    leaveType: "ANNUAL" as const,
    startDate: new Date("2025-02-01"),
    endDate: new Date("2025-02-03"),
    totalDays: new Prisma.Decimal(3),
    status: "PENDING" as const,
    reason: "Short vacation.",
    note: "Awaiting org admin approval.",
    reviewerId: "org-admin-leanne",
  },
];

export const seedLeaveRequests = async (prisma: PrismaClient) => {
  await prisma.leaveRequest.createMany({ data: leaveRequests });
};
