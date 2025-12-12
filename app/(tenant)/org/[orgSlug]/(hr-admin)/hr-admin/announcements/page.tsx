"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { NotificationStatus } from "@prisma/client";
import { api } from "@/app/utils/api";
import TextInput from "@/app/components/atoms/inputs/TextInput";
import TextArea from "@/app/components/atoms/inputs/TextArea";
import Button from "@/app/components/atoms/buttons/Button";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { Modal } from "@/app/components/atoms/frame/Modal";
import type {
  HrAnnouncementRecipient,
  HrAnnouncementSummary,
} from "@/types/hr-announcement";

const sendAnnouncementSchema = z
  .object({
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
    mode: z.enum(["ORGANIZATION", "SPECIFIC"]),
    recipientIds: z.array(z.string()),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "SPECIFIC" && data.recipientIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one teammate.",
        path: ["recipientIds"],
      });
    }
  });

type AnnouncementFormValues = z.infer<typeof sendAnnouncementSchema>;
type AlertState = { type: "success" | "error"; message: string } | null;

type RecipientMode = AnnouncementFormValues["mode"];

const statusLabels: Record<NotificationStatus, string> = {
  SENT: "Published",
  SCHEDULED: "Scheduled",
  DRAFT: "Draft",
  CANCELLED: "Cancelled",
};

const statusThemes: Record<NotificationStatus, string> = {
  SENT:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  SCHEDULED:
    "bg-indigo-100 text-indigo-700 dark:bg-sky-500/10 dark:text-sky-200",
  DRAFT:
    "bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-200",
  CANCELLED:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const recipientModeOptions: Array<{
  id: RecipientMode;
  title: string;
  description: string;
}> = [
  {
    id: "ORGANIZATION",
    title: "To organization",
    description: "Every active teammate receives this instantly.",
  },
  {
    id: "SPECIFIC",
    title: "Specific teammates",
    description: "Pick one or many people to target.",
  },
];

const formatDateTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return dateFormatter.format(parsed);
};

const RecipientChips = ({
  people,
}: {
  people: HrAnnouncementRecipient[];
}) => {
  if (!people.length) {
    return null;
  }
  const maxVisible = 4;
  const visible = people.slice(0, maxVisible);
  const remaining = people.length - visible.length;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {visible.map((person) => (
        <span
          key={person.id}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/80 dark:text-slate-200"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[0.6rem] font-bold uppercase text-indigo-700 dark:bg-slate-800 dark:text-slate-200">
            {person.name
              .split(" ")
              .map((part) => part.charAt(0).toUpperCase())
              .slice(0, 2)
              .join("")}
          </span>
          {person.name}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-300">
          +{remaining} more
        </span>
      )}
    </div>
  );
};

const AnnouncementCard = ({
  announcement,
  onViewDetails,
}: {
  announcement: HrAnnouncementSummary;
  onViewDetails: (announcement: HrAnnouncementSummary) => void;
}) => {
  const statusClass = statusThemes[announcement.status] ?? statusThemes.SENT;
  const statusLabel = statusLabels[announcement.status] ?? announcement.status;
  return (
    <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-lg shadow-indigo-100 transition dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-900/50">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
            {announcement.recipients.label}
            {announcement.recipients.count ? ` • ${announcement.recipients.count}` : ""}
          </p>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            {announcement.title}
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {announcement.body}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 text-sm text-slate-500 md:items-end">
          <span className={`rounded-full px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.3em] ${statusClass}`}>
            {statusLabel}
          </span>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
            {formatDateTime(announcement.deliveredAtIso)}
          </span>
        </div>
      </div>
      {announcement.recipients.scope === "SPECIFIC" && (
        <RecipientChips people={announcement.recipients.people} />
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
          {announcement.sender.name && <span>By {announcement.sender.name}</span>}
          <span>Audience: {announcement.recipients.label}</span>
        </div>
        <Button
          theme="secondary"
          onClick={() => onViewDetails(announcement)}
          className="px-4 py-1 text-xs"
        >
          View details
        </Button>
      </div>
    </article>
  );
};

const AlertBanner = ({ alert }: { alert: AlertState }) => {
  if (!alert) return null;
  const isSuccess = alert.type === "success";
  const classes = isSuccess
    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200"
    : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200";
  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${classes}`}>
      <span>{alert.message}</span>
    </div>
  );
};

export default function HrAdminAnnouncementsPage() {
  const utils = api.useUtils();
  const [alert, setAlert] = useState<AlertState>(null);
  const announcementsQuery = api.hrAnnouncements.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const recipientsQuery = api.hrAnnouncements.recipients.useQuery(undefined, {
    staleTime: 60_000,
  });

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(sendAnnouncementSchema),
    defaultValues: {
      topic: "",
      details: "",
      mode: "ORGANIZATION",
      recipientIds: [],
    },
  });

  const mode = form.watch("mode");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<HrAnnouncementSummary | null>(
    null,
  );

  useEffect(() => {
    if (!alert) return;
    const timer = window.setTimeout(() => setAlert(null), 5000);
    return () => window.clearTimeout(timer);
  }, [alert]);

  const sendAnnouncement = api.hrAnnouncements.send.useMutation({
    onSuccess: async () => {
      const currentMode = form.getValues("mode");
      const recipients = form.getValues("recipientIds");
      form.reset({
        topic: "",
        details: "",
        mode: currentMode,
        recipientIds: currentMode === "SPECIFIC" ? recipients : [],
      });
      setAlert({ type: "success", message: "Announcement sent." });
      await utils.hrAnnouncements.list.invalidate();
    },
    onError: (error) => {
      setAlert({ type: "error", message: error.message || "Failed to send announcement." });
    },
  });

  const handleSubmitForm = (values: AnnouncementFormValues) => {
    const topic = values.topic.trim();
    const details = values.details.trim();
    if (values.mode === "SPECIFIC") {
      sendAnnouncement.mutate({
        topic,
        details,
        mode: "SPECIFIC",
        recipientIds: values.recipientIds,
      });
      return;
    }
    sendAnnouncement.mutate({
      topic,
      details,
      mode: "ORGANIZATION",
    });
  };

  const announcements = announcementsQuery.data?.announcements ?? [];
  const recipients = recipientsQuery.data?.employees ?? [];
  const recipientCount = recipients.length;
  const recipientSelectSize = useMemo(() => {
    if (!recipientCount) return 4;
    return Math.max(4, Math.min(8, recipientCount));
  }, [recipientCount]);

  const isSending = sendAnnouncement.isPending;
  const isHistoryLoading = announcementsQuery.isLoading;
  const isHistoryError = announcementsQuery.isError;
  const openDetails = (announcement: HrAnnouncementSummary) => {
    setSelectedAnnouncement(announcement);
    setDetailModalOpen(true);
  };
  const closeDetails = () => {
    setDetailModalOpen(false);
    setSelectedAnnouncement(null);
  };

  return (
    <div className="space-y-8">
      <header className="rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
          Broadcasts
        </p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Announcements</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Share policy changes, cultural moments, or urgent updates. Teammates will see these in their notifications instantly.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <section className="space-y-4 rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create announcement</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Compose the message and choose who should receive it.
            </p>
          </div>
          <AlertBanner alert={alert} />
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmitForm)}>
            <TextInput
              label="Announcement topic"
              placeholder="Ex: Remote work stipend refresh"
              isRequired
              error={form.formState.errors.topic}
              name="topic"
              register={form.register}
            />
            <TextArea
              label="Details"
              placeholder="Add extra context, dates, or actions you expect people to take."
              height="150px"
              isRequired
              error={form.formState.errors.details}
              name="details"
              register={form.register}
            />
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recipients</p>
              <div className="grid gap-3 md:grid-cols-2">
                {recipientModeOptions.map((option) => {
                  const isActive = mode === option.id;
                  return (
                    <button
                      type="button"
                      key={option.id}
                      onClick={() => form.setValue("mode", option.id)}
                      className={`text-left transition ${
                        isActive
                          ? "rounded-2xl border border-transparent bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 p-[2px]"
                          : "rounded-2xl border border-slate-200 bg-white dark:border-slate-700/70 dark:bg-slate-900"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          isActive
                            ? "bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <p className="text-sm font-semibold">{option.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{option.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {mode === "SPECIFIC" && (
                <div className="space-y-2">
                  <Controller
                    control={form.control}
                    name="recipientIds"
                    render={({ field }) => (
                      <select
                        multiple
                        size={recipientSelectSize}
                        value={field.value}
                        onChange={(event) => {
                          const options = Array.from(event.target.selectedOptions, (option) => option.value);
                          field.onChange(options);
                        }}
                        disabled={recipientsQuery.isLoading || recipientsQuery.isError}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800"
                      >
                        {recipients.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name}
                            {employee.designation ? ` • ${employee.designation}` : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {recipientsQuery.isLoading && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Loading teammates…</p>
                  )}
                  {recipientsQuery.isError && (
                    <p className="text-xs text-rose-500">
                      We couldn&apos;t load teammates. <button type="button" className="underline" onClick={() => recipientsQuery.refetch()}>Retry</button>
                    </p>
                  )}
                  {form.formState.errors.recipientIds && (
                    <p className="text-xs text-rose-500">{form.formState.errors.recipientIds.message}</p>
                  )}
                </div>
              )}
            </div>
            <Button type="submit" disabled={isSending}>
              {isSending ? "Sending..." : "Send announcement"}
            </Button>
          </form>
        </section>

        <section className="flex flex-col gap-4 rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Delivery insights</h2>
          <div className="rounded-2xl border border-dashed border-slate-200/70 bg-white/80 p-5 text-sm text-slate-600 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
              Total announcements
            </p>
            <p className="mt-2 text-4xl font-semibold text-slate-900 dark:text-white">
              {announcementsQuery.data?.total ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              This includes policy broadcasts, holiday notices, and HR follow-ups.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-indigo-50/60 p-5 text-sm text-slate-700 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500 dark:text-sky-300">
              Tip
            </p>
            <p className="mt-2">
              Need richer formatting or attachments? Send a message thread instead and drop this announcement link inside.
            </p>
          </div>
        </section>
      </div>

      <section className="space-y-4 rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent announcements</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Everything your teammates will see in their notification feed.
            </p>
          </div>
          <Button theme="secondary" onClick={() => announcementsQuery.refetch()} disabled={announcementsQuery.isFetching}>
            {announcementsQuery.isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        {isHistoryLoading && (
          <div className="flex min-h-[200px] items-center justify-center text-slate-500">
            <LoadingSpinner label="Loading announcements..." />
          </div>
        )}
        {isHistoryError && !isHistoryLoading && (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center text-sm text-slate-500">
            <p>We couldn&apos;t load the announcement history.</p>
            <Button theme="secondary" onClick={() => announcementsQuery.refetch()}>
              Retry
            </Button>
          </div>
        )}
        {!isHistoryLoading && !isHistoryError && announcements.length === 0 && (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center text-slate-500 dark:text-slate-400">
            <p className="text-base font-semibold">No announcements yet</p>
            <p className="text-sm">Your first broadcast will show up here.</p>
          </div>
        )}
        {!isHistoryLoading && !isHistoryError && announcements.length > 0 && (
          <div className="space-y-5">
            {announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onViewDetails={openDetails}
              />
            ))}
          </div>
        )}
      </section>

      {selectedAnnouncement && (
        <Modal
          open={detailModalOpen}
          setOpen={setDetailModalOpen}
          title="Announcement details"
          doneButtonText=""
          isDoneButton={false}
          closeOnClick={closeDetails}
          crossOnClick={closeDetails}
        >
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                {statusLabels[selectedAnnouncement.status] ?? selectedAnnouncement.status}
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
                {selectedAnnouncement.title}
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                Delivered {formatDateTime(selectedAnnouncement.deliveredAtIso)}
              </p>
            </div>

            <p className="rounded-2xl border border-slate-100 bg-white/90 p-4 text-sm leading-relaxed text-slate-700 shadow-inner dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200">
              {selectedAnnouncement.body}
            </p>

            <div className="grid gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 text-sm shadow-inner dark:border-slate-700/70 dark:bg-slate-900/80">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  Audience
                </span>
                <span className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  {selectedAnnouncement.recipients.label}
                  {selectedAnnouncement.recipients.count
                    ? ` • ${selectedAnnouncement.recipients.count}`
                    : ""}
                </span>
              </div>
              {selectedAnnouncement.sender.name && (
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                    Sender
                  </span>
                  <span className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    {selectedAnnouncement.sender.name}
                  </span>
                </div>
              )}
            </div>

            {selectedAnnouncement.recipients.scope === "SPECIFIC" && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  Recipients ({selectedAnnouncement.recipients.people.length})
                </p>
                <div className="max-h-60 space-y-2 overflow-y-auto rounded-2xl border border-slate-100 bg-white/80 p-3 shadow-inner dark:border-slate-700/70 dark:bg-slate-900/70">
                  {selectedAnnouncement.recipients.people.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/90 px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {person.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {person.email}
                        </span>
                      </div>
                      {person.designation && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {person.designation}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
