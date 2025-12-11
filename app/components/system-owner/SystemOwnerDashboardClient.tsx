"use client";

import Link from "next/link";

import LoadingSpinner from "@/app/components/LoadingSpinner";
import Button from "@/app/components/atoms/buttons/Button";
import { trpc } from "@/trpc/client";

const formatNumber = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
};

const fallbackOrgChart: Array<{
  id: string;
  name: string;
  totalEmployees: number;
}> = [
  { id: "fallback-1", name: "Demo Org", totalEmployees: 320 },
  { id: "fallback-2", name: "Acme Labs", totalEmployees: 260 },
  { id: "fallback-3", name: "Globex", totalEmployees: 210 },
];

export default function SystemOwnerDashboardClient() {
  const organizationListQuery = trpc.hrOrganization.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  if (organizationListQuery.isLoading) {
    return (
      <LoadingSpinner
        label="Loading dashboard..."
        helper="Fetching every organization to build insights."
      />
    );
  }

  if (organizationListQuery.isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-6 text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
        <p>Unable to build the dashboard right now.</p>
        <Button
          onClick={() => organizationListQuery.refetch()}
          className="mt-4 rounded-xl px-4 py-2 text-xs"
        >
          Retry
        </Button>
      </div>
    );
  }

  const organizations = organizationListQuery.data?.organizations ?? [];
  const totalOrganizations = organizations.length;
  const totalEmployees = organizations.reduce(
    (sum, org) => sum + Number(org.totalEmployees ?? 0),
    0,
  );
  const activeOrganizations = organizations.filter(
    (org) => org.totalEmployees > 0,
  ).length;

  const chartOrganizations = (organizations.length
    ? organizations
    : fallbackOrgChart
  )
    .slice()
    .sort((a, b) => b.totalEmployees - a.totalEmployees)
    .slice(0, 7);

  const shortList = organizations
    .slice()
    .sort((a, b) => b.totalEmployees - a.totalEmployees)
    .slice(0, 5);

  const maxEmployees = Math.max(
    ...chartOrganizations.map((org) => org.totalEmployees),
    1,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Total Organizations",
            value: totalOrganizations,
          },
          {
            label: "Active Organizations",
            value: activeOrganizations,
          },
          {
            label: "Total Employees",
            value: totalEmployees,
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-[28px] border border-white/70 bg-white/90 px-6 py-5 text-center shadow-lg shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-slate-950/60"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              {metric.label}
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {formatNumber(metric.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
        <section className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Organization overview
              </p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Employee distribution
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Top workspaces ranked by team size.
              </p>
            </div>
          </div>
          {chartOrganizations.length ? (
            <div className="mt-6 flex items-end gap-3 overflow-x-auto pb-4">
              {chartOrganizations.map((org) => {
                const height = Math.max(
                  12,
                  (org.totalEmployees / maxEmployees) * 100,
                );
                return (
                  <div
                    key={org.id ?? org.name}
                    className="flex min-w-[80px] flex-1 flex-col items-center gap-2"
                  >
                    <div className="flex h-48 w-full items-end rounded-3xl bg-slate-50/80 p-1 dark:bg-slate-900/40">
                      <div
                        className="w-full rounded-2xl bg-gradient-to-t from-indigo-500 via-sky-500 to-cyan-400 shadow-inner shadow-indigo-200/50 dark:shadow-slate-950/40"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center line-clamp-1">
                      {org.name}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {org.totalEmployees}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Add at least one organization to see employee distribution.
            </p>
          )}
        </section>

        <section className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Organization list
              </p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Recent workspaces
              </h3>
            </div>
            <Link
              href="/system-owner/organization"
              className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-sky-400"
            >
              See all
            </Link>
          </div>

          {shortList.length ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
              <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
                <thead className="bg-slate-50/70 text-left uppercase tracking-[0.2em] text-slate-400 dark:bg-slate-900/40 dark:text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Organization</th>
                    <th className="px-4 py-3 text-right">Employees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-200">
                  {shortList.map((org) => (
                    <tr key={org.id}>
                      <td className="px-4 py-3 font-semibold">{org.name}</td>
                      <td className="px-4 py-3 text-right">
                        {org.totalEmployees}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No organizations have been created yet.
            </p>
          )}
        </section>
      </div>

    </div>
  );
}
