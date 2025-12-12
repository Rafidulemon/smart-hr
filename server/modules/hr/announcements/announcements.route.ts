import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { hrAnnouncementsController } from "./announcements.controller";

const baseAnnouncementFields = {
  topic: z
    .string()
    .trim()
    .min(3, "Announcement topic is required.")
    .max(200, "Keep the topic under 200 characters."),
  details: z
    .string()
    .trim()
    .min(10, "Share a bit more context for the announcement.")
    .max(4000, "Announcements can be up to 4,000 characters."),
};

const sendAnnouncementInput = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("ORGANIZATION"),
    ...baseAnnouncementFields,
  }),
  z.object({
    mode: z.literal("SPECIFIC"),
    ...baseAnnouncementFields,
    recipientIds: z
      .array(z.string().min(1, "Recipient is required."))
      .min(1, "Select at least one teammate."),
  }),
]);

export const hrAnnouncementsRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx }) =>
    hrAnnouncementsController.list({ ctx }),
  ),
  recipients: protectedProcedure.query(({ ctx }) =>
    hrAnnouncementsController.recipients({ ctx }),
  ),
  send: protectedProcedure
    .input(sendAnnouncementInput)
    .mutation(({ ctx, input }) =>
      hrAnnouncementsController.send({ ctx, input }),
    ),
});
