import Link from "next/link";

export default function TenantOrgNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center text-slate-800 dark:text-slate-100">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-500 dark:text-sky-400">
          Workspace missing
        </p>
        <h1 className="text-3xl font-semibold">This organization doesn&apos;t exist</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Double-check the URL or ask your admin for the correct workspace link.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
        <Link
          href="/support"
          className="rounded-full border border-slate-200 px-6 py-2 text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
        >
          Contact support
        </Link>
        <Link
          href="/"
          className="rounded-full border border-indigo-500 bg-indigo-500 px-6 py-2 text-white transition hover:bg-indigo-600 dark:border-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
