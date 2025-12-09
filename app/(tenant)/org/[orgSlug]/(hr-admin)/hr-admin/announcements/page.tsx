const announcements = [
  {
    title: "Welcome the design residency cohort",
    audience: "Design + Product",
    publishedAt: "Scheduled · May 8",
    summary:
      "Introduce the four new designers joining from the summer residency program.",
    status: "Scheduled",
  },
  {
    title: "Policy refresh: Remote work stipends",
    audience: "All employees",
    publishedAt: "Live · May 3",
    summary:
      "Clarified what expenses qualify and how to submit reimbursements inside Rippling.",
    status: "Published",
  },
  {
    title: "Leadership AMA with CEO",
    audience: "Dhaka HQ",
    publishedAt: "Draft",
    summary:
      "Collect top of mind questions from teams ahead of the June all-hands.",
    status: "Draft",
  },
];

const statusBadge: Record<string, string> = {
  Published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  Scheduled: "bg-indigo-100 text-indigo-700 dark:bg-sky-500/10 dark:text-sky-200",
  Draft: "bg-slate-100 text-slate-600 dark:bg-slate-800/70 dark:text-slate-300",
};

export default function HrAdminAnnouncementsPage() {
  return (
    <div className="space-y-8">
      <header className="rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Announcements
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Share updates, celebrate wins, and keep every office in sync.
        </p>
      </header>

      <section className="space-y-5">
        {announcements.map((announcement) => (
          <article
            key={announcement.title}
            className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-lg shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {announcement.audience}
                </p>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {announcement.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {announcement.summary}
                </p>
              </div>
              <div className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span>{announcement.publishedAt}</span>
                <span
                  className={`w-fit rounded-full px-4 py-1 text-xs font-semibold uppercase ${statusBadge[announcement.status] ?? ""}`}
                >
                  {announcement.status}
                </span>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
              >
                Edit Draft
              </button>
              <button
                type="button"
                className="rounded-xl border border-indigo-200 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-500/20 dark:border-slate-600 dark:text-sky-200"
              >
                Share Preview
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
