import { randomUUID } from "crypto";

import {
  EmploymentStatus,
  NotificationAudience,
  NotificationStatus,
  NotificationType,
  Prisma,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "@/server/api/trpc";
import {
  type HrAnnouncementFeedResponse,
  type HrAnnouncementRecipient,
  type HrAnnouncementRecipientsResponse,
  type HrAnnouncementRecipientScope,
  type HrAnnouncementSendInput,
  type HrAnnouncementSendResponse,
  type HrAnnouncementSummary,
  type HrAnnouncementSender,
} from "@/types/hr-announcement";
import { requireHrAdmin } from "@/server/modules/hr/utils";
import {
  emitNotificationRealtimeEvent,
  notificationRealtimeSelect,
} from "@/server/modules/notification/notification.events";

const ANNOUNCEMENT_HISTORY_LIMIT = 40;
const ANNOUNCEMENT_FETCH_LIMIT = 200;

const announcementSelect = {
  id: true,
  title: true,
  body: true,
  audience: true,
  status: true,
  metadata: true,
  createdAt: true,
  sentAt: true,
  scheduledAt: true,
  sender: {
    select: {
      id: true,
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
  targetUser: {
    select: {
      id: true,
      email: true,
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
  },
} as const satisfies Prisma.NotificationSelect;

type AnnouncementRecord = Prisma.NotificationGetPayload<{
  select: typeof announcementSelect;
}>;

type AnnouncementScope = HrAnnouncementRecipientScope;

type AnnouncementMetadata = {
  batchId: string | null;
  scope: AnnouncementScope | null;
};

type AnnouncementGroup = {
  id: string;
  title: string;
  body: string;
  audience: NotificationAudience;
  status: NotificationStatus;
  createdAt: Date;
  deliveredAt: Date;
  scope: AnnouncementScope;
  sender: HrAnnouncementSender;
  people: Map<string, HrAnnouncementRecipient>;
  notificationCount: number;
};

const toRecordMetadata = (value: Prisma.JsonValue | null): AnnouncementMetadata => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { batchId: null, scope: null };
  }
  const record = value as Record<string, unknown>;
  const batchId = typeof record.announcementBatchId === "string" ? record.announcementBatchId : null;
  const scope =
    record.announcementScope === "SPECIFIC"
      ? "SPECIFIC"
      : record.announcementScope === "ROLE"
        ? "ROLE"
        : record.announcementScope === "ORGANIZATION"
          ? "ORGANIZATION"
          : null;
  return { batchId, scope };
};

const formatName = (
  profile: { firstName: string | null; lastName: string | null; preferredName: string | null } | null,
  fallback: string,
) => {
  if (!profile) {
    return fallback;
  }
  if (profile.preferredName?.trim()) {
    return profile.preferredName.trim();
  }
  const parts = [profile.firstName, profile.lastName].filter((piece) => piece && piece.trim().length);
  if (parts.length) {
    return parts.join(" ");
  }
  return fallback;
};

const buildSender = (record: AnnouncementRecord): HrAnnouncementSender => {
  if (!record.sender) {
    return { id: null, name: null, email: null };
  }
  return {
    id: record.sender.id,
    email: record.sender.email,
    name: formatName(record.sender.profile, record.sender.email),
  };
};

const scopeFromAudience = (audience: NotificationAudience): AnnouncementScope => {
  switch (audience) {
    case NotificationAudience.ORGANIZATION:
      return "ORGANIZATION";
    case NotificationAudience.ROLE:
      return "ROLE";
    case NotificationAudience.INDIVIDUAL:
    default:
      return "SPECIFIC";
  }
};

const toRecipient = (record: AnnouncementRecord): HrAnnouncementRecipient | null => {
  if (!record.targetUser) {
    return null;
  }
  return {
    id: record.targetUser.id,
    name: formatName(record.targetUser.profile, record.targetUser.email),
    email: record.targetUser.email,
    designation: record.targetUser.employment?.designation ?? null,
    avatarUrl: record.targetUser.profile?.profilePhotoUrl ?? null,
  };
};

const buildRecipientLabel = (
  scope: AnnouncementScope,
  count: number,
): { label: string; showCount: boolean } => {
  if (scope === "ORGANIZATION") {
    return { label: "Entire organization", showCount: false };
  }
  if (scope === "ROLE") {
    return { label: "Targeted roles", showCount: false };
  }
  return {
    label: count === 1 ? "Selected teammate" : "Selected teammates",
    showCount: true,
  };
};

const toSummary = (group: AnnouncementGroup): HrAnnouncementSummary => {
  const { label, showCount } = buildRecipientLabel(group.scope, group.notificationCount);
  const people = group.scope === "SPECIFIC" ? Array.from(group.people.values()) : [];
  return {
    id: group.id,
    title: group.title,
    body: group.body,
    audience: group.audience,
    status: group.status,
    deliveredAtIso: group.deliveredAt.toISOString(),
    createdAtIso: group.createdAt.toISOString(),
    sender: group.sender,
    recipients: {
      scope: group.scope,
      label,
      count: showCount ? group.notificationCount : null,
      people,
    },
  };
};

const sanitizeText = (value: string) => value.trim();

const buildAnnouncementGroup = (
  record: AnnouncementRecord,
  scope: AnnouncementScope,
  deliveredAt: Date,
): AnnouncementGroup => ({
  id: record.id,
  title: record.title,
  body: record.body,
  audience: record.audience,
  status: record.status,
  createdAt: record.createdAt,
  deliveredAt,
  scope,
  sender: buildSender(record),
  people: new Map(),
  notificationCount: 0,
});

export const hrAnnouncementsService = {
  async list(ctx: TRPCContext): Promise<HrAnnouncementFeedResponse> {
    const user = requireHrAdmin(ctx);
    const organizationId = user.organizationId;

    if (!organizationId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Join an organization to view announcements.",
      });
    }

    const records = await ctx.prisma.notification.findMany({
      where: {
        organizationId,
        type: NotificationType.ANNOUNCEMENT,
      },
      select: announcementSelect,
      orderBy: { createdAt: "desc" },
      take: ANNOUNCEMENT_FETCH_LIMIT,
    });

    const groupMap = new Map<string, AnnouncementGroup>();

    records.forEach((record) => {
      const metadata = toRecordMetadata(record.metadata);
      const batchId = metadata.batchId ?? record.id;
      const deliveredAt = record.sentAt ?? record.scheduledAt ?? record.createdAt;
      const scope = metadata.scope ?? scopeFromAudience(record.audience);
      const existing = groupMap.get(batchId);
      const group = existing ?? buildAnnouncementGroup(record, scope, deliveredAt);
      if (!existing) {
        group.id = batchId;
        groupMap.set(batchId, group);
      } else if (deliveredAt > group.deliveredAt) {
        group.deliveredAt = deliveredAt;
      }
      group.notificationCount += 1;
      if (scope === "SPECIFIC") {
        const recipient = toRecipient(record);
        if (recipient) {
          group.people.set(recipient.id, recipient);
        }
      }
    });

    const summaries = Array.from(groupMap.values())
      .sort((a, b) => b.deliveredAt.getTime() - a.deliveredAt.getTime())
      .slice(0, ANNOUNCEMENT_HISTORY_LIMIT)
      .map((group) => toSummary(group));

    return {
      announcements: summaries,
      total: summaries.length,
    };
  },

  async recipients(ctx: TRPCContext): Promise<HrAnnouncementRecipientsResponse> {
    const user = requireHrAdmin(ctx);
    const organizationId = user.organizationId;

    if (!organizationId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Join an organization to send announcements.",
      });
    }

    const records = await ctx.prisma.user.findMany({
      where: {
        organizationId,
        status: { not: EmploymentStatus.TERMINATED },
      },
      orderBy: [
        { profile: { preferredName: "asc" } },
        { profile: { firstName: "asc" } },
        { email: "asc" },
      ],
      select: {
        id: true,
        email: true,
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
    });

    const employees = records.map((record) => ({
      id: record.id,
      email: record.email,
      name: formatName(record.profile, record.email),
      designation: record.employment?.designation ?? null,
      avatarUrl: record.profile?.profilePhotoUrl ?? null,
    }));

    return { employees };
  },

  async send(
    ctx: TRPCContext,
    input: HrAnnouncementSendInput,
  ): Promise<HrAnnouncementSendResponse> {
    const user = requireHrAdmin(ctx);
    const organizationId = user.organizationId;

    if (!organizationId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Join an organization to send announcements.",
      });
    }

    const topic = sanitizeText(input.topic);
    const details = sanitizeText(input.details);

    const now = new Date();
    const batchId = randomUUID();

    if (input.mode === "ORGANIZATION") {
      const record = await ctx.prisma.notification.create({
        data: {
          organizationId,
          senderId: user.id,
          title: topic,
          body: details,
          type: NotificationType.ANNOUNCEMENT,
          audience: NotificationAudience.ORGANIZATION,
          status: NotificationStatus.SENT,
          metadata: {
            announcementBatchId: batchId,
            announcementScope: "ORGANIZATION",
          },
          sentAt: now,
        },
        select: notificationRealtimeSelect,
      });
      void emitNotificationRealtimeEvent(ctx.prisma, record);
      return { deliveredCount: 1 };
    }

    const uniqueRecipientIds = Array.from(new Set(input.recipientIds ?? []));
    if (!uniqueRecipientIds.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Select at least one teammate to notify.",
      });
    }

    const recipients = await ctx.prisma.user.findMany({
      where: {
        id: { in: uniqueRecipientIds },
        organizationId,
        status: { not: EmploymentStatus.TERMINATED },
      },
      select: { id: true },
    });

    if (recipients.length !== uniqueRecipientIds.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "One or more selected teammates could not be found.",
      });
    }

    const notifications = await ctx.prisma.$transaction((tx) =>
      Promise.all(
        recipients.map((recipient) =>
          tx.notification.create({
            data: {
              organizationId,
              senderId: user.id,
              title: topic,
              body: details,
              type: NotificationType.ANNOUNCEMENT,
              audience: NotificationAudience.INDIVIDUAL,
              targetUserId: recipient.id,
              status: NotificationStatus.SENT,
              metadata: {
                announcementBatchId: batchId,
                announcementScope: "SPECIFIC",
              },
              sentAt: now,
            },
            select: notificationRealtimeSelect,
          }),
        ),
      ),
    );

    if (notifications.length) {
      void emitNotificationRealtimeEvent(ctx.prisma, notifications);
    }

    return { deliveredCount: notifications.length };
  },
};
