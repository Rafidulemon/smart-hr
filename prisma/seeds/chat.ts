import type { PrismaClient } from "@prisma/client";

import { SMART_HR_ORG_ID } from "./data";

type ThreadSeed = {
  id: string;
  title: string;
  organizationId: string;
  createdById: string;
  isPrivate?: boolean;
  participantIds: string[];
  messages: Array<{
    id: string;
    senderId: string;
    body: string;
    createdAt: Date;
  }>;
};

const threadSeeds: ThreadSeed[] = [
  {
    id: "thread-people-ops",
    title: "People Ops Squad",
    organizationId: SMART_HR_ORG_ID,
    createdById: "hr-admin-samir",
    isPrivate: false,
    participantIds: [
      "super-admin-aria",
      "org-owner-kai",
      "org-admin-leanne",
      "hr-admin-samir",
    ],
    messages: [
      {
        id: "chat-msg-ops-1",
        senderId: "org-admin-leanne",
        body: "Reminder: policy refresh workshop on Thursday. Slides are ready in Drive.",
        createdAt: new Date("2025-01-04T09:14:00.000Z"),
      },
      {
        id: "chat-msg-ops-2",
        senderId: "hr-admin-samir",
        body: "Thanks! I will add the comp benchmarks before EOD.",
        createdAt: new Date("2025-01-04T09:16:00.000Z"),
      },
    ],
  },
  {
    id: "thread-delivery-weekly",
    title: "Delivery Weekly",
    organizationId: SMART_HR_ORG_ID,
    createdById: "manager-drew",
    participantIds: ["manager-drew", "employee-ivy", "org-admin-leanne"],
    messages: [
      {
        id: "chat-msg-delivery-1",
        senderId: "manager-drew",
        body: "Please drop blockers ahead of tomorrow's roadmap sync.",
        createdAt: new Date("2025-01-05T04:05:00.000Z"),
      },
      {
        id: "chat-msg-delivery-2",
        senderId: "employee-ivy",
        body: "All green on onboarding wizard—QA finishes today.",
        createdAt: new Date("2025-01-05T04:07:00.000Z"),
      },
    ],
  },
];

export const seedChat = async (prisma: PrismaClient) => {
  for (const thread of threadSeeds) {
    const exists = await prisma.thread.findUnique({
      where: { id: thread.id },
      select: { id: true },
    });

    if (exists) continue;

    const createdThread = await prisma.thread.create({
      data: {
        id: thread.id,
        title: thread.title,
        organizationId: thread.organizationId,
        createdById: thread.createdById,
        isPrivate: thread.isPrivate ?? true,
        lastMessageAt:
          thread.messages.length > 0
            ? thread.messages[thread.messages.length - 1]?.createdAt
            : undefined,
      },
    });

    for (const participantId of thread.participantIds) {
      await prisma.threadParticipant.create({
        data: {
          threadId: createdThread.id,
          userId: participantId,
          joinedAt: new Date("2024-05-01T00:00:00.000Z"),
          lastReadAt: thread.messages.length
            ? thread.messages[thread.messages.length - 1]?.createdAt
            : null,
        },
      });
    }

    for (const message of thread.messages) {
      await prisma.chatMessage.create({
        data: {
          id: message.id,
          threadId: createdThread.id,
          senderId: message.senderId,
          body: message.body,
          createdAt: message.createdAt,
        },
      });
    }
  }
};
