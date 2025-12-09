"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEdit3,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

import Button from "@/app/components/atoms/buttons/Button";
import TextInput from "@/app/components/atoms/inputs/TextInput";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { uploadOrganizationLogo } from "@/lib/upload-organization-logo";
import { DEFAULT_ORGANIZATION_LOGO } from "@/lib/organization-branding";
import { trpc } from "@/trpc/client";

type AlertState = { type: "success" | "error"; message: string } | null;

const AlertBanner = ({ alert }: { alert: AlertState }) => {
  if (!alert) return null;
  const Icon = alert.type === "success" ? FiCheckCircle : FiAlertCircle;
  const palette =
    alert.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
      : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200";
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${palette}`}
    >
      <Icon className="text-base" />
      <p className="font-semibold">{alert.message}</p>
    </div>
  );
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "Not available";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export default function SystemOwnerOrganizationsClient() {
  const utils = trpc.useUtils();
  const organizationListQuery = trpc.hrOrganization.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const updateDetailsMutation = trpc.hrOrganization.updateDetails.useMutation();
  const deleteOrganizationMutation =
    trpc.hrOrganization.deleteOrganization.useMutation();

  const [selectedOrganizationId, setSelectedOrganizationId] = useState<
    string | null
  >(null);
  const [form, setForm] = useState({
    name: "",
    domain: "",
    timezone: "",
    locale: "",
    logoUrl: DEFAULT_ORGANIZATION_LOGO,
  });
  const [logoPreview, setLogoPreview] = useState(DEFAULT_ORGANIZATION_LOGO);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);
  const [deletePassword, setDeletePassword] = useState("");

  const organizations = useMemo(
    () => organizationListQuery.data?.organizations ?? [],
    [organizationListQuery.data?.organizations],
  );
  const selectedOrganization = useMemo(
    () => organizations.find((org) => org.id === selectedOrganizationId) ?? null,
    [organizations, selectedOrganizationId],
  );

  useEffect(() => {
    if (
      !selectedOrganizationId &&
      organizations.length > 0 &&
      !organizationListQuery.isLoading
    ) {
      setSelectedOrganizationId(organizations[0].id);
    }
    if (
      selectedOrganizationId &&
      organizations.length > 0 &&
      !organizations.some((org) => org.id === selectedOrganizationId)
    ) {
      setSelectedOrganizationId(
        organizations.length ? organizations[0].id : null,
      );
    }
  }, [organizations, selectedOrganizationId, organizationListQuery.isLoading]);

  useEffect(() => {
    if (selectedOrganization) {
      setForm({
        name: selectedOrganization.name,
        domain: selectedOrganization.domain ?? "",
        timezone: selectedOrganization.timezone ?? "",
        locale: selectedOrganization.locale ?? "",
        logoUrl: selectedOrganization.logoUrl,
      });
      setLogoPreview(selectedOrganization.logoUrl);
      setLogoError(null);
    } else {
      setForm({
        name: "",
        domain: "",
        timezone: "",
        locale: "",
        logoUrl: DEFAULT_ORGANIZATION_LOGO,
      });
      setLogoPreview(DEFAULT_ORGANIZATION_LOGO);
      setLogoError(null);
    }
  }, [selectedOrganization]);

  useEffect(() => {
    if (!alert) return;
    const timer = window.setTimeout(() => setAlert(null), 4000);
    return () => window.clearTimeout(timer);
  }, [alert]);

  const handleDetailsSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOrganization) {
      setAlert({
        type: "error",
        message: "Pick an organization to update.",
      });
      return;
    }
    const payload = {
      organizationId: selectedOrganization.id,
      name: form.name.trim(),
      domain: form.domain.trim() || undefined,
      timezone: form.timezone.trim() || undefined,
      locale: form.locale.trim() || undefined,
      logoUrl: form.logoUrl.trim(),
    };
    if (!payload.name.length) {
      setAlert({
        type: "error",
        message: "Organization name is required.",
      });
      return;
    }
    if (!payload.logoUrl.length) {
      setAlert({
        type: "error",
        message: "Organization logo is required.",
      });
      return;
    }
    updateDetailsMutation.mutate(payload, {
      onSuccess: () => {
        setAlert({
          type: "success",
          message: "Organization details updated.",
        });
        void utils.hrOrganization.list.invalidate();
      },
      onError: (error) =>
        setAlert({ type: "error", message: error.message }),
    });
  };

  const handleLogoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!selectedOrganization) {
      setAlert({
        type: "error",
        message: "Select an organization before uploading a logo.",
      });
      event.target.value = "";
      return;
    }
    setLogoError(null);
    setIsUploadingLogo(true);
    try {
      const uploadedUrl = await uploadOrganizationLogo(file, {
        organizationId: selectedOrganization.id,
      });
      setForm((prev) => ({ ...prev, logoUrl: uploadedUrl }));
      setLogoPreview(uploadedUrl);
    } catch (error) {
      setLogoError(
        error instanceof Error ? error.message : "Failed to upload logo.",
      );
    } finally {
      setIsUploadingLogo(false);
      event.target.value = "";
    }
  };

  const handleUseDefaultLogo = () => {
    setForm((prev) => ({ ...prev, logoUrl: DEFAULT_ORGANIZATION_LOGO }));
    setLogoPreview(DEFAULT_ORGANIZATION_LOGO);
    setLogoError(null);
  };

  const handleDeleteOrganization = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOrganization) {
      setAlert({
        type: "error",
        message: "Select an organization before deleting.",
      });
      return;
    }
    if (!deletePassword.trim()) {
      setAlert({
        type: "error",
        message: "Enter your password to confirm deletion.",
      });
      return;
    }
    deleteOrganizationMutation.mutate(
      {
        organizationId: selectedOrganization.id,
        password: deletePassword.trim(),
      },
      {
        onSuccess: () => {
          setAlert({
            type: "success",
            message: `${selectedOrganization.name} deleted.`,
          });
          setDeletePassword("");
          setSelectedOrganizationId(null);
          void utils.hrOrganization.list.invalidate();
        },
        onError: (error) =>
          setAlert({ type: "error", message: error.message }),
      },
    );
  };

  if (organizationListQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <LoadingSpinner
          label="Loading organizations..."
          helper="Fetching every workspace linked to your account."
        />
      </div>
    );
  }

  if (organizationListQuery.isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          We couldn&apos;t load the organization list right now.
        </p>
        <Button onClick={() => organizationListQuery.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!organizations.length) {
    return (
      <div className="space-y-6 rounded-[32px] border border-dashed border-slate-300 bg-white/80 p-8 text-center text-slate-600 shadow-inner dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
        <p className="text-lg font-semibold">
          No organizations found yet.
        </p>
        <p className="text-sm">
          Create your first workspace to unlock the rest of the System Owner
          console.
        </p>
        <Button href="/system-owner/create" className="rounded-xl px-4 py-2">
          Create organization
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AlertBanner alert={alert} />
      <div className="grid gap-6 lg:grid-cols-[minmax(300px,0.9fr),1.4fr]">
        <section className="space-y-4 rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-lg shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-950/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Workspaces
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
                {organizations.length} organization
                {organizations.length === 1 ? "" : "s"}
              </h2>
            </div>
            <Button
              href="/system-owner/create"
              className="rounded-2xl px-3 py-2 text-xs font-semibold"
            >
              <span className="flex items-center gap-1">
                <FiPlus />
                New
              </span>
            </Button>
          </div>
          <div className="space-y-3">
            {organizations.map((org) => {
              const isSelected = org.id === selectedOrganizationId;
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => setSelectedOrganizationId(org.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50/70 text-indigo-900 dark:border-indigo-400/80 dark:bg-indigo-400/10 dark:text-indigo-100"
                      : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/60 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-indigo-400/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{org.name}</p>
                      <p className="text-xs opacity-70">
                        {org.domain ?? "No domain"}
                      </p>
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {org.totalEmployees} people
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {selectedOrganization ? (
          <div className="space-y-6">
            <section className="space-y-4 rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-lg shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-indigo-500/10 p-3 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-200">
                  <FiEdit3 />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Edit workspace
                  </p>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {selectedOrganization.name}
                  </h3>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleDetailsSubmit}>
                <div className="space-y-3 rounded-2xl border border-dashed border-slate-200/70 p-4 dark:border-slate-700/60">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                    Organization logo
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                      <Image
                        src={logoPreview}
                        alt="Organization logo preview"
                        width={80}
                        height={80}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="space-y-2 text-sm">
                      <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-indigo-200 bg-white px-4 py-2 font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoChange}
                          disabled={isUploadingLogo}
                        />
                        {isUploadingLogo ? "Uploading..." : "Change logo"}
                      </label>
                      <button
                        type="button"
                        onClick={handleUseDefaultLogo}
                        disabled={isUploadingLogo}
                        className="block rounded-xl border border-slate-200 bg-transparent px-4 py-2 font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60"
                      >
                        Use default logo
                      </button>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        PNG, JPG, or WEBP files up to 5MB.
                      </p>
                      {logoError ? (
                        <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">
                          {logoError}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <TextInput
                  label="Organization name"
                  value={form.name}
                  isRequired
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
                <TextInput
                  label="Email domain"
                  placeholder="example.com"
                  value={form.domain}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, domain: event.target.value }))
                  }
                />
                <div>
                  <TextInput
                    label="Sub-domain"
                    value={selectedOrganization?.subDomain ?? ""}
                    readOnly
                    disabled
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Assigned during creation and used for tenant URLs.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput
                    label="Default timezone"
                    placeholder="Asia/Dhaka"
                    value={form.timezone}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        timezone: event.target.value,
                      }))
                    }
                  />
                  <TextInput
                    label="Locale"
                    placeholder="en-US"
                    value={form.locale}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        locale: event.target.value,
                      }))
                    }
                  />
                </div>

                <Button
                  type="submit"
                  disabled={
                    updateDetailsMutation.isPending ||
                    isUploadingLogo
                  }
                  className="rounded-2xl px-5 py-2 text-sm"
                >
                  {updateDetailsMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </form>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 text-sm dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-300">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Created
                  </p>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {formatDate(selectedOrganization.createdAtIso)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 text-sm dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-300">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Updated
                  </p>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {formatDate(selectedOrganization.updatedAtIso)}
                  </p>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-indigo-900 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200">
                  <p className="text-xs uppercase tracking-wide">
                    Team size
                  </p>
                  <p className="text-2xl font-bold">
                    {selectedOrganization.totalEmployees}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-[32px] border border-rose-200/70 bg-rose-50/60 p-6 shadow-inner dark:border-rose-500/40 dark:bg-rose-500/10">
              <div className="flex items-center gap-3 text-rose-700 dark:text-rose-200">
                <FiTrash2 />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em]">
                    Danger zone
                  </p>
                  <h3 className="text-lg font-semibold">Delete organization</h3>
                </div>
              </div>
              <p className="text-sm text-rose-600 dark:text-rose-100">
                Permanently remove <strong>{selectedOrganization.name}</strong>{" "}
                and every employee, record, and report linked to it. This action
                cannot be undone.
              </p>
              <form
                className="space-y-3"
                onSubmit={handleDeleteOrganization}
              >
                <TextInput
                  label="Confirm with your password"
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                />
                <Button
                  type="submit"
                  theme="cancel"
                  disabled={deleteOrganizationMutation.isPending}
                  className="rounded-2xl px-4 py-2 text-sm font-semibold"
                >
                  {deleteOrganizationMutation.isPending
                    ? "Deleting..."
                    : "Delete organization"}
                </Button>
              </form>
            </section>
          </div>
        ) : (
          <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/80 p-8 text-center text-slate-600 shadow-inner dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
            <p className="text-lg font-semibold">
              Select an organization to manage it.
            </p>
            <p className="mt-2 text-sm">
              Choose any workspace from the list to update its profile or delete
              it entirely.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
