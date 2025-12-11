"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiPlus,
  FiSearch,
} from "react-icons/fi";

import Button from "@/app/components/atoms/buttons/Button";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { trpc } from "@/trpc/client";
import type { HrOrganizationStatus } from "@/types/hr-organization";

const PAGE_SIZE = 10;
const numberFormatter = new Intl.NumberFormat("en-US");

const statusLabels: Record<HrOrganizationStatus, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  ONBOARDING: "Onboarding",
};

const statusClasses: Record<HrOrganizationStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  SUSPENDED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200",
  ONBOARDING: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200",
};

const sortOptions = [
  { value: "employees-desc", label: "Employees (high → low)" },
  { value: "employees-asc", label: "Employees (low → high)" },
  { value: "name-asc", label: "Name (A → Z)" },
  { value: "name-desc", label: "Name (Z → A)" },
  { value: "mau-desc", label: "Monthly active (high → low)" },
  { value: "mau-asc", label: "Monthly active (low → high)" },
] as const;

type SortOption = (typeof sortOptions)[number]["value"];
type StatusFilter = "all" | HrOrganizationStatus;

const formatNumber = (value: number) => numberFormatter.format(value);

export default function SystemOwnerOrganizationsClient() {
  const organizationListQuery = trpc.hrOrganization.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOption>("employees-desc");
  const [currentPage, setCurrentPage] = useState(1);

  const organizations = organizationListQuery.data?.organizations ?? [];

  const filteredOrganizations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = organizations.filter((organization) => {
      const matchesTerm =
        !term ||
        organization.name.toLowerCase().includes(term) ||
        organization.subDomain.toLowerCase().includes(term) ||
        (organization.domain ?? "").toLowerCase().includes(term);
      const matchesStatus =
        statusFilter === "all" || organization.status === statusFilter;
      return matchesTerm && matchesStatus;
    });

    const sorted = filtered.slice().sort((a, b) => {
      switch (sortOrder) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "employees-asc":
          return a.totalEmployees - b.totalEmployees;
        case "employees-desc":
          return b.totalEmployees - a.totalEmployees;
        case "mau-asc":
          return a.monthlyActiveUsers - b.monthlyActiveUsers;
        case "mau-desc":
          return b.monthlyActiveUsers - a.monthlyActiveUsers;
        default:
          return 0;
      }
    });

    return sorted;
  }, [organizations, searchTerm, sortOrder, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortOrder, organizations.length]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrganizations.length / PAGE_SIZE),
  );

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const pageIndex = currentPage - 1;
  const paginatedOrganizations = filteredOrganizations.slice(
    pageIndex * PAGE_SIZE,
    pageIndex * PAGE_SIZE + PAGE_SIZE,
  );
  const showingStart = paginatedOrganizations.length ? pageIndex * PAGE_SIZE + 1 : 0;
  const showingEnd = paginatedOrganizations.length
    ? pageIndex * PAGE_SIZE + paginatedOrganizations.length
    : 0;

  if (organizationListQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <LoadingSpinner
          label="Loading organizations..."
          helper="Preparing every workspace for review."
        />
      </div>
    );
  }

  if (organizationListQuery.isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          We couldn&apos;t load the organization list right now.
        </p>
        <Button onClick={() => organizationListQuery.refetch()}>Retry</Button>
      </div>
    );
  }

  if (!organizations.length) {
    return (
      <div className="space-y-6 rounded-[32px] border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-600 shadow-inner dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            No organizations yet
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Create your first workspace to unlock the System Owner console.
          </p>
        </div>
        <Button href="/system-owner/create" className="rounded-2xl px-4 py-2 text-sm font-semibold">
          <span className="flex items-center justify-center gap-2">
            <FiPlus />
            Add organization
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
            System owner
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Organizations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Search, filter, and jump into any workspace from one place.
          </p>
        </div>
        <Button
          href="/system-owner/create"
          className="w-full rounded-2xl px-4 py-2 text-sm font-semibold sm:w-auto"
        >
          <span className="flex items-center justify-center gap-2">
            <FiPlus />
            Add organization
          </span>
        </Button>
      </div>

      <div className="rounded-[32px] border border-white/70 bg-white/95 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
        <div className="flex flex-col gap-3 border-b border-slate-100/70 px-6 py-4 dark:border-slate-800/60 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none ring-indigo-100 transition focus:border-indigo-400 focus:ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
              placeholder="Search organizations"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <FiFilter className="text-slate-400 dark:text-slate-500" />
              <select
                className="bg-transparent text-sm outline-none"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
              >
                <option value="all">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="ONBOARDING">Onboarding</option>
              </select>
            </div>
            <select
              className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none ring-indigo-100 transition focus:border-indigo-400 focus:ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-slate-500"
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value as SortOption)
              }
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {paginatedOrganizations.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:bg-slate-900/40 dark:text-slate-500">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Employees</th>
                  <th className="px-6 py-3 text-right">Monthly active</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-200">
                {paginatedOrganizations.map((organization) => (
                  <tr key={organization.id} className="transition hover:bg-indigo-50/60 dark:hover:bg-slate-900/40">
                    <td className="px-6 py-3">
                      <Link
                        href={`/system-owner/organization/${organization.id}/details`}
                        className="font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-sky-300 dark:hover:text-sky-200"
                      >
                        {organization.name}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {organization.domain ?? `${organization.subDomain}.smart-hr.app`}
                      </p>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[organization.status]}`}
                      >
                        {statusLabels[organization.status]}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-semibold">
                      {formatNumber(organization.totalEmployees)}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold">
                      {formatNumber(organization.monthlyActiveUsers)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2 text-xs font-semibold">
                        <Link
                          href={`/system-owner/organization/${organization.id}/details`}
                          className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
                        >
                          View
                        </Link>
                        <Link
                          href={`/system-owner/organization/${organization.id}/edit`}
                          className="rounded-full bg-indigo-600 px-3 py-1 text-white transition hover:bg-indigo-500 dark:bg-sky-500 dark:hover:bg-sky-400"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No organizations match those filters.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {showingStart ? (
            <>
              Showing {showingStart}-{showingEnd} of{" "}
              {filteredOrganizations.length} organizations
            </>
          ) : (
            <>No organizations match the current filters.</>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setCurrentPage((prev) => Math.max(prev - 1, 1))
            }
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-600 transition enabled:hover:border-indigo-200 enabled:hover:text-indigo-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <FiChevronLeft />
            Prev
          </button>
          <div className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:border-slate-700 dark:text-slate-300">
            Page {currentPage} / {totalPages}
          </div>
          <button
            type="button"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || !filteredOrganizations.length}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-600 transition enabled:hover:border-indigo-200 enabled:hover:text-indigo-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Next
            <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
