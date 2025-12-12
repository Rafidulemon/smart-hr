import type { TRPCContext } from "@/server/api/trpc";
import type {
  HrAnnouncementSendInput,
} from "@/types/hr-announcement";
import { hrAnnouncementsService } from "./announcements.service";

export const hrAnnouncementsController = {
  list: ({ ctx }: { ctx: TRPCContext }) => hrAnnouncementsService.list(ctx),
  recipients: ({ ctx }: { ctx: TRPCContext }) =>
    hrAnnouncementsService.recipients(ctx),
  send: ({ ctx, input }: { ctx: TRPCContext; input: HrAnnouncementSendInput }) =>
    hrAnnouncementsService.send(ctx, input),
};
