"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiLayers,
  FiPieChart,
  FiUsers,
} from "react-icons/fi";

import Button from "@/app/components/atoms/buttons/Button";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import SystemOwnerEmployeeProfileModal from "@/app/components/system-owner/SystemOwnerEmployeeProfileModal";
import { trpc } from "@/trpc/client";

type SystemOwnerOrganizationDetailsClientProps = {
  organizationId: string;
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatValue = (value?: string | null) =>
  value && value.trim().length ? value : "—";

const formatEnumLabel = (value?: string | null) => {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const membersPerPage = 20;

export default function SystemOwnerOrganizationDetailsClient({
  organizationId,
}: SystemOwnerOrganizationDetailsClientProps) {
  const [memberCursor, setMemberCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const detailsQuery = trpc.hrOrganization.details.useQuery(
    { organizationId },
    { enabled: Boolean(organizationId), refetchOnWindowFocus: false },
  );
  const membersQuery = trpc.hrOrganization.members.useQuery(
    { organizationId, cursor: memberCursor, limit: membersPerPage },
    {
      enabled: Boolean(organizationId),
      refetchOnWindowFocus: false,
    },
  );

  const members = membersQuery.data?.members ?? [];
  const membersTotal = membersQuery.data?.total ?? 0;
  const pageIndex = cursorHistory.length;
  const pageStart = members.length ? pageIndex * membersPerPage + 1 : 0;
  const pageEnd = members.length
    ? Math.min(pageStart + members.length - 1, membersTotal)
    : 0;

  const handleNext = () => {
    if (!membersQuery.data?.nextCursor) return;
    setCursorHistory((prev) => [...prev, memberCursor ?? ""]);
    setMemberCursor(membersQuery.data.nextCursor ?? null);
  };

  const handlePrev = () => {
    setCursorHistory((prev) => {
      if (!prev.length) {
        setMemberCursor(null);
        return prev;
      }
      const next = [...prev];
      const cursor = next.pop();
      setMemberCursor(cursor && cursor.length ? cursor : null);
      return next;
    });
  };

  const openEmployeeProfile = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setIsProfileModalOpen(true);
  };

  const closeEmployeeProfile = () => {
    setIsProfileModalOpen(false);
    setSelectedEmployeeId(null);
  };

  const statsCards = useMemo(() => {
    if (!detailsQuery.data) return [];
    const stats = detailsQuery.data.stats;
    return [
      { label: "Headcount", value: stats.headcount },
      { label: "Active", value: stats.active },
      { label: "On Probation", value: stats.probation },
      { label: "Inactive / Leave", value: stats.inactive },
      { label: "Departments", value: stats.departments },
      { label: "Teams", value: stats.teams },
    ];
  }, [detailsQuery.data]);

const headcountTrend = detailsQuery.data?.charts.headcountTrend ?? [];
const roleDistribution = detailsQuery.data?.charts.roleDistribution ?? [];
const maxTrendValue = Math.max(
  ...headcountTrend.map((point) => point.value),
  1,
);
const maxRoleValue = Math.max(
  ...roleDistribution.map((point) => point.value),
  1,
);
const roleDistributionTotal = roleDistribution.reduce(
  (sum, role) => sum + role.value,
  0,
);
const roleChartColors = [
  "#6366F1",
  "#0EA5E9",
  "#F97316",
  "#EC4899",
  "#10B981",
  "#F59E0B",
];
const rolePieGradient = (() => {
  if (!roleDistributionTotal) return null;
  let cumulative = 0;
  return roleDistribution
    .map((role, index) => {
      const start = cumulative;
      cumulative += (role.value / roleDistributionTotal) * 100;
      return `${roleChartColors[index % roleChartColors.length]} ${start}% ${cumulative}%`;
    })
    .join(", ");
})();

  if (detailsQuery.isLoading) {
    return (
      <LoadingSpinner
        fullscreen
        label="Loading organization"
        helper="Preparing workspace insights..."
      />
    );
  }

  if (detailsQuery.isError || !detailsQuery.data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Unable to load this organization right now.
        </p>
        <Button onClick={() => detailsQuery.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const organization = detailsQuery.data.organization;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/system-owner"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <FiArrowLeft />
            Back to overview
          </Link>
          <Link
            href={`/system-owner/organization/${organization.id}/edit`}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 dark:bg-sky-500 dark:hover:bg-sky-400"
          >
            Manage organization
          </Link>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-400">
          <FiUsers />
          System Owner Console
        </div>
      </div>

      <section className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-950/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={organization.logoUrl}
              alt={`${organization.name} logo`}
              width={64}
              height={64}
              className="h-16 w-16 rounded-2xl border border-slate-200 object-contain dark:border-slate-700"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Organization
              </p>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {organization.name}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {organization.domain ?? "Domain unavailable"} • Tenant: {organization.subDomain}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500 dark:text-slate-400">
            <p>Created {formatDate(organization.createdAtIso)}</p>
            <p>Updated {formatDate(organization.updatedAtIso)}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {statsCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-100/80 bg-white/80 px-4 py-3 text-center shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60"
            >
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full">
        <article className="flex flex-col rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-500 dark:bg-amber-500/20 dark:text-amber-200">
              <FiPieChart />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                Role distribution
              </p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Permission mix
              </h3>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-4 lg:flex-row">
            <div className="flex-1 space-y-3">
              {roleDistribution.map((role) => (
                <div
                  key={role.label}
                  className="rounded-2xl border border-slate-100/80 bg-white/80 p-3 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60"
                >
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {role.label}
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {role.value} people
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400"
                      style={{
                        width: `${Math.max((role.value / maxRoleValue) * 100, 6)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {rolePieGradient ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100/80 bg-white/80 p-4 text-center shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60 lg:w-60">
                <div className="relative h-40 w-40">
                  <div
                    className="absolute inset-0 rounded-full border border-white/60 bg-slate-50 shadow-inner dark:border-slate-800 dark:bg-slate-900/50"
                    aria-hidden="true"
                  />
                  <div
                    className="relative h-full w-full rounded-full border border-white/60 shadow-lg shadow-slate-200/40 dark:border-slate-900 dark:shadow-slate-950/80"
                    style={{ backgroundImage: `conic-gradient(${rolePieGradient})` }}
                    aria-label="Role mix"
                  />
                  <div className="absolute inset-10 flex flex-col items-center justify-center rounded-full bg-white text-center text-sm font-semibold text-slate-700 dark:bg-slate-950 dark:text-slate-100">
                    {roleDistributionTotal}
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                      total
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Snapshot of every role on this tenant
                </p>
              </div>
            ) : null}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-950/60">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Departments
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Structural overview of reporting lines.
          </p>
          <div className="mt-4 space-y-3">
            {detailsQuery.data.departments.map((dept) => (
              <div
                key={dept.id}
                className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60"
              >
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {dept.name}
                </p>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {dept.memberCount} member{dept.memberCount === 1 ? "" : "s"} •{" "}
                  {dept.teamCount} team{dept.teamCount === 1 ? "" : "s"}
                </div>
              </div>
            ))}
            {!detailsQuery.data.departments.length ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No departments recorded yet.
              </p>
            ) : null}
          </div>
        </div>
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-950/60">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Teams
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Workstreams within the workspace.
          </p>
          <div className="mt-4 space-y-3">
            {detailsQuery.data.teams.map((team) => (
              <div
                key={team.id}
                className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {team.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {team.departmentName ?? "No department"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {team.memberCount} people
                  </span>
                </div>
              </div>
            ))}
            {!detailsQuery.data.teams.length ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No teams were added for this organization yet.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-950/60">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
              Employee directory
            </p>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              All members
            </h3>
          </div>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Total {membersTotal}
          </span>
        </div>

        {membersQuery.isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-200/70 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700/60 dark:text-slate-400">
            Loading employee list...
          </div>
        ) : members.length ? (
          <>
            <ul className="space-y-3">
              {members.map((member) => (
                <li key={member.id}>
                  <button
                    type="button"
                    onClick={() => openEmployeeProfile(member.id)}
                    className="flex w-full flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-left text-sm shadow-sm transition hover:border-indigo-200 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900/60"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {member.name}
                      </p>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {member.email}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
                        {member.designation ?? "Team member"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                        {member.employeeCode ?? "No ID"}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200">
                        {formatEnumLabel(member.role)}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                        {formatEnumLabel(member.status)}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Joined {formatDate(member.joinedAtIso)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 pt-4 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {pageStart}-{pageEnd} of {membersTotal}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!cursorHistory.length || membersQuery.isFetching}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-600 transition enabled:hover:border-indigo-200 enabled:hover:text-indigo-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <FiChevronLeft />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!membersQuery.data?.nextCursor || membersQuery.isFetching}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-600 transition enabled:hover:border-indigo-200 enabled:hover:text-indigo-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  Next
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200/70 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700/60 dark:text-slate-400">
            No employees available for this organization.
          </div>
        )}
      </section>

      <SystemOwnerEmployeeProfileModal
        organizationId={organization.id}
        employeeId={selectedEmployeeId}
        open={isProfileModalOpen}
        onClose={closeEmployeeProfile}
      />
    </div>
  );
}
