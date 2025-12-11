"use client";

import { useMemo } from "react";
import { FiMail, FiPhone, FiUser } from "react-icons/fi";

import { Modal } from "@/app/components/atoms/frame/Modal";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { trpc } from "@/trpc/client";

type SystemOwnerEmployeeProfileModalProps = {
  organizationId?: string | null;
  employeeId?: string | null;
  open: boolean;
  onClose: () => void;
};

const formatValue = (value?: string | null) =>
  value && value.trim().length ? value : "—";

const SectionGrid = ({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: string }>;
}) => {
  if (!rows.length) return null;
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
        {title}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={`${title}-${row.label}`}
            className="rounded-2xl border border-slate-100/80 bg-white/80 px-4 py-3 shadow-sm transition-colors duration-200 dark:border-slate-800/70 dark:bg-slate-900/60"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
              {row.label}
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SystemOwnerEmployeeProfileModal({
  organizationId,
  employeeId,
  open,
  onClose,
}: SystemOwnerEmployeeProfileModalProps) {
  const handleSetOpen: React.Dispatch<React.SetStateAction<boolean>> = (
    value,
  ) => {
    const nextValue = typeof value === "function" ? value(open) : value;
    if (!nextValue) {
      onClose();
    }
  };

  const profileQuery = trpc.hrOrganization.employeeProfile.useQuery(
    {
      organizationId: organizationId ?? "",
      employeeId: employeeId ?? "",
    },
    {
      enabled: open && Boolean(organizationId && employeeId),
    },
  );

  const headerSubtitle = useMemo(() => {
    if (!profileQuery.data) {
      return "";
    }
    const profile = profileQuery.data.profile;
    const parts = [
      formatValue(profile.designation),
      formatValue(profile.department),
      formatValue(profile.team),
    ].filter((value) => value !== "—");
    return parts.join(" • ");
  }, [profileQuery.data]);

  return (
    <Modal
      open={open}
      setOpen={handleSetOpen}
      className="max-h-[82vh]"
      closeOnClick={onClose}
      crossOnClick={onClose}
      doneButtonText=""
      isDoneButton={false}
      isCancelButton
      cancelButtonText="Close"
      title={
        profileQuery.data?.profile.name ?? "Employee profile overview"
      }
    >
      {profileQuery.isLoading ? (
        <LoadingSpinner
          label="Loading employee profile..."
          helper="Fetching workspace record details."
        />
      ) : profileQuery.isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
          Unable to load employee profile.{" "}
          <button
            type="button"
            className="font-semibold underline decoration-rose-300 hover:decoration-rose-500"
            onClick={() => profileQuery.refetch()}
          >
            Retry
          </button>
        </div>
      ) : !profileQuery.data ? (
        <p className="text-sm text-slate-500">
          Select an employee to view their details.
        </p>
      ) : (
        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-100/70 bg-white/80 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {profileQuery.data.profile.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {headerSubtitle || "Workspace member"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                {profileQuery.data.overview.tags.length
                  ? profileQuery.data.overview.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))
                  : null}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {profileQuery.data.overview.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-2">
                <FiMail className="text-base" />
                {formatValue(profileQuery.data.profile.email)}
              </span>
              <span className="inline-flex items-center gap-2">
                <FiPhone className="text-base" />
                {formatValue(profileQuery.data.contactInfo.find((row) => row.label === "Work Phone")?.value)}
              </span>
              {profileQuery.data.profile.employeeCode ? (
                <span className="inline-flex items-center gap-2">
                  <FiUser className="text-base" />
                  ID: {profileQuery.data.profile.employeeCode}
                </span>
              ) : null}
            </div>
          </div>

          <SectionGrid
            title="Basic Info"
            rows={profileQuery.data.basicInfo}
          />
          <SectionGrid
            title="Contact & Emergency"
            rows={profileQuery.data.contactInfo}
          />
          <SectionGrid
            title="Address & Preferences"
            rows={profileQuery.data.addressPreferences}
          />
        </div>
      )}
    </Modal>
  );
}
