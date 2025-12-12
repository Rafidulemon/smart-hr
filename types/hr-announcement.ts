import type {
  NotificationAudience,
  NotificationStatus,
} from "@prisma/client";

export type HrAnnouncementRecipientScope =
  | "ORGANIZATION"
  | "SPECIFIC"
  | "ROLE";

export type HrAnnouncementRecipient = {
  id: string;
  name: string;
  email: string;
  designation: string | null;
  avatarUrl: string | null;
};

export type HrAnnouncementSender = {
  id: string | null;
  name: string | null;
  email: string | null;
};

export type HrAnnouncementSummary = {
  id: string;
  title: string;
  body: string;
  status: NotificationStatus;
  audience: NotificationAudience;
  deliveredAtIso: string;
  createdAtIso: string;
  sender: HrAnnouncementSender;
  recipients: {
    scope: HrAnnouncementRecipientScope;
    label: string;
    count: number | null;
    people: HrAnnouncementRecipient[];
  };
};

export type HrAnnouncementFeedResponse = {
  announcements: HrAnnouncementSummary[];
  total: number;
};

export type HrAnnouncementRecipientsResponse = {
  employees: HrAnnouncementRecipient[];
};

export type HrAnnouncementSendInput = {
  topic: string;
  details: string;
  mode: "ORGANIZATION" | "SPECIFIC";
  recipientIds?: string[];
};

export type HrAnnouncementSendResponse = {
  deliveredCount: number;
};
