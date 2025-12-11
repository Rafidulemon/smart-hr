import SystemOwnerOrganizationsClient from "../SystemOwnerOrganizationsClient";

export default function SystemOwnerOrganizationPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-950/60">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          System Owner
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
          Oversee every organization
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Review each workspace, update branding details, or permanently delete an
          organization from this console. Use the Create button to spin up a new tenant
          whenever needed.
        </p>
      </section>

      <SystemOwnerOrganizationsClient />
    </div>
  );
}
