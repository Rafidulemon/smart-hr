import SystemOwnerDashboardClient from "./SystemOwnerDashboardClient";

export default async function SystemOwnerPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
          System Owner
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
          Workspace intelligence
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Monitor growth across tenants, spot onboarding activity, and jump into any
          organization&apos;s details in a single click.
        </p>
      </section>

      <SystemOwnerDashboardClient />
    </div>
  );
}
