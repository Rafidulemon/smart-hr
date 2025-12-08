import { PrismaClient } from "@prisma/client";

const baseDate = new Date("2025-01-10T00:00:00+06:00");

const attendanceRecords = [
  {
    id: "att-1",
    employeeId: "manager-drew",
    attendanceDate: baseDate,
    checkInAt: new Date("2025-01-10T09:05:00+06:00"),
    checkOutAt: new Date("2025-01-10T18:05:00+06:00"),
    totalWorkSeconds: 9 * 3600,
    status: "PRESENT" as const,
    note: "Customer steering call in the morning.",
    location: "Dhaka HQ",
    source: "Turnstile",
  },
  {
    id: "att-2",
    employeeId: "employee-ivy",
    attendanceDate: baseDate,
    checkInAt: new Date("2025-01-10T09:15:00+06:00"),
    checkOutAt: new Date("2025-01-10T18:10:00+06:00"),
    totalWorkSeconds: 8.25 * 3600,
    status: "REMOTE" as const,
    note: "Remote sprint work + afternoon customer training.",
    location: "Remote",
    source: "VPN",
  },
  {
    id: "att-3",
    employeeId: "manager-drew",
    attendanceDate: new Date("2025-01-11T00:00:00+06:00"),
    checkInAt: new Date("2025-01-11T09:10:00+06:00"),
    checkOutAt: new Date("2025-01-11T13:00:00+06:00"),
    totalWorkSeconds: 4 * 3600,
    status: "HALF_DAY" as const,
    note: "Left early for site inspection.",
    location: "Client site",
    source: "Mobile",
  },
];

export const seedAttendance = async (prisma: PrismaClient) => {
  await prisma.attendanceRecord.createMany({ data: attendanceRecords });
};
