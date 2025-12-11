"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiInfo,
  FiTrash2,
} from "react-icons/fi";

import Button from "@/app/components/atoms/buttons/Button";
import TextInput from "@/app/components/atoms/inputs/TextInput";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { DEFAULT_ORGANIZATION_LOGO } from "@/lib/organization-branding";
import { uploadOrganizationLogo } from "@/lib/upload-organization-logo";
import { trpc } from "@/trpc/client";

type AlertState = { type: "success" | "error"; message: string } | null;

const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const AlertBanner = ({ alert }: { alert: AlertState }) => {
  if (!alert) return null;
  const Icon = alert.type === "success" ? FiCheckCircle : FiAlertCircle;
  const palette =
    alert.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
      : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200";
  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${palette}`}>
      <Icon className="text-base" />
      <p className="font-semibold">{alert.message}</p>
    </div>
  );
};

type SystemOwnerOrganizationEditClientProps = {
  organizationId: string;
};

export default function SystemOwnerOrganizationEditClient({
  organizationId,
}: SystemOwnerOrganizationEditClientProps) {
  const utils = trpc.useUtils();
  const router = useRouter();
  const detailsQuery = trpc.hrOrganization.details.useQuery(
    { organizationId },
    { enabled: Boolean(organizationId), refetchOnWindowFocus: false },
  );
  const updateDetailsMutation = trpc.hrOrganization.updateDetails.useMutation();
  const verifyDeletePasswordMutation =
    trpc.hrOrganization.verifyDeletePassword.useMutation();
  const deleteOrganizationMutation =
    trpc.hrOrganization.deleteOrganization.useMutation();

  const [alert, setAlert] = useState<AlertState>(null);
  const [form, setForm] = useState({
    name: "",
    domain: "",
    timezone: "",
    locale: "",
    subDomain: "",
    logoUrl: DEFAULT_ORGANIZATION_LOGO,
  });
  const [logoPreview, setLogoPreview] = useState(DEFAULT_ORGANIZATION_LOGO);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

  const organization = detailsQuery.data?.organization ?? null;
  const createdAt = organization?.createdAtIso
    ? new Date(organization.createdAtIso)
    : null;
  const updatedAt = organization?.updatedAtIso
    ? new Date(organization.updatedAtIso)
    : null;
  const detailFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  useEffect(() => {
    if (organization) {
      setForm({
        name: organization.name,
        domain: organization.domain ?? "",
        timezone: organization.timezone ?? "",
        locale: organization.locale ?? "",
        subDomain: organization.subDomain,
        logoUrl: organization.logoUrl,
      });
      setLogoPreview(organization.logoUrl);
      setLogoError(null);
    }
  }, [organization?.id]);

  useEffect(() => {
    if (!alert) return;
    const timer = window.setTimeout(() => setAlert(null), 4000);
    return () => window.clearTimeout(timer);
  }, [alert]);

  useEffect(() => {
    setIsPasswordVerified(false);
  }, [deletePassword]);

  const handleLogoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoError(null);
    setIsUploadingLogo(true);
    try {
      const uploadedUrl = await uploadOrganizationLogo(file, {
        organizationId,
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!organization) {
      setAlert({
        type: "error",
        message: "Organization not found.",
      });
      return;
    }

    const trimmedName = form.name.trim();
    if (!trimmedName.length) {
      setAlert({ type: "error", message: "Organization name is required." });
      return;
    }

    const trimmedLogo = form.logoUrl.trim();
    if (!trimmedLogo.length) {
      setAlert({
        type: "error",
        message: "Organization logo is required.",
      });
      return;
    }

    const normalizedSubDomain = form.subDomain.trim().toLowerCase();
    if (!normalizedSubDomain.length) {
      setAlert({
        type: "error",
        message: "Sub-domain cannot be blank.",
      });
      return;
    }
    if (
      normalizedSubDomain.length < 3 ||
      normalizedSubDomain.length > 63 ||
      !SUBDOMAIN_PATTERN.test(normalizedSubDomain)
    ) {
      setAlert({
        type: "error",
        message:
          "Use 3-63 lowercase letters, digits, or hyphens, and avoid leading/trailing hyphens.",
      });
      return;
    }

    updateDetailsMutation.mutate(
      {
        organizationId: organization.id,
        name: trimmedName,
        domain: form.domain.trim() || undefined,
        timezone: form.timezone.trim() || undefined,
        locale: form.locale.trim() || undefined,
        logoUrl: trimmedLogo,
        subDomain: normalizedSubDomain,
      },
      {
        onSuccess: () => {
          setAlert({
            type: "success",
            message: "Organization updated successfully.",
          });
          setIsPasswordVerified(false);
          void Promise.all([
            utils.hrOrganization.list.invalidate(),
            utils.hrOrganization.details.invalidate({ organizationId }),
          ]);
        },
        onError: (error) =>
          setAlert({ type: "error", message: error.message }),
      },
    );
  };

  const handleVerifyPassword = (event: React.FormEvent) => {
    event.preventDefault();
    if (!deletePassword.trim()) {
      setAlert({
        type: "error",
        message: "Enter your password to continue.",
      });
      return;
    }
    verifyDeletePasswordMutation.mutate(
      { password: deletePassword.trim() },
      {
        onSuccess: () => {
          setIsPasswordVerified(true);
          setAlert({
            type: "success",
            message: "Password verified. You can delete this organization.",
          });
        },
        onError: (error) => {
          setIsPasswordVerified(false);
          setAlert({ type: "error", message: error.message });
        },
      },
    );
  };

  const handleDelete = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!organization) {
      setAlert({
        type: "error",
        message: "Organization not found.",
      });
      return;
    }
    if (!deletePassword.trim()) {
      setAlert({
        type: "error",
        message: "Enter your password to delete this organization.",
      });
      return;
    }
    if (!isPasswordVerified) {
      setAlert({
        type: "error",
        message: "Verify your password before deleting.",
      });
      return;
    }

    deleteOrganizationMutation.mutate(
      { organizationId: organization.id, password: deletePassword.trim() },
      {
        onSuccess: () => {
          setAlert({
            type: "success",
            message: `${organization.name} deleted.`,
          });
          void utils.hrOrganization.list.invalidate();
          router.push("/system-owner/organization");
        },
        onError: (error) =>
          setAlert({ type: "error", message: error.message }),
      },
    );
  };

  if (detailsQuery.isLoading) {
    return (
      <LoadingSpinner
        fullscreen
        label="Loading organization..."
        helper="Fetching workspace profile."
      />
    );
  }

  if (detailsQuery.isError || !organization) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Unable to load this organization right now.
        </p>
        <Button onClick={() => detailsQuery.refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Link
          href={`/system-owner/organization/${organization.id}/details`}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <FiArrowLeft />
          Back to details
        </Link>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-400">
          Edit organization
          <FiInfo />
        </div>
      </div>

      <AlertBanner alert={alert} />

      <div className="grid gap-6 lg:grid-cols-[minmax(320px,1.1fr),minmax(280px,0.8fr)]">
        <section className="space-y-6 rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
          <div className="flex items-center gap-4">
            <Image
              src={logoPreview}
              alt={`${organization.name} logo`}
              width={64}
              height={64}
              className="h-16 w-16 rounded-2xl border border-slate-200 object-contain dark:border-slate-700"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                Workspace
              </p>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {organization.name}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tenant: {organization.subDomain}.smart-hr.app
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-3 rounded-2xl border border-dashed border-slate-200/70 p-4 dark:border-slate-700/60">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                Organization logo
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
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
                      disabled={isUploadingLogo}
                      onChange={handleLogoChange}
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
                    PNG, JPG, or WEBP up to 5MB.
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
            <TextInput
              label="Sub-domain"
              placeholder="org-name"
              value={form.subDomain}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  subDomain: event.target.value,
                }))
              }
              isRequired
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Used in tenant URLs (org-name.smart-hr.app). Must be unique.
            </p>
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
              disabled={updateDetailsMutation.isPending || isUploadingLogo}
              className="rounded-2xl px-5 py-2 text-sm"
            >
              {updateDetailsMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Metadata
            </h3>
            <dl className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <dt>Created</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {createdAt ? detailFormatter.format(createdAt) : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Updated</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {updatedAt ? detailFormatter.format(updatedAt) : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Employees</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {organization.totalEmployees}
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-4 rounded-[32px] border border-rose-200/70 bg-rose-50/70 p-6 shadow-inner dark:border-rose-500/40 dark:bg-rose-500/10">
            <div className="flex items-center gap-3 text-rose-700 dark:text-rose-200">
              <FiTrash2 />
              <div>
                <p className="text-xs uppercase tracking-[0.3em]">Danger zone</p>
                <h3 className="text-lg font-semibold">Delete organization</h3>
              </div>
            </div>
            <p className="text-sm text-rose-600 dark:text-rose-100">
              Permanently remove {organization.name} and all related data. This
              action cannot be undone.
            </p>
            <form className="space-y-3" onSubmit={handleDelete}>
              <TextInput
                label="Confirm with your password"
                type="password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  onClick={handleVerifyPassword}
                  disabled={
                    !deletePassword.trim() || verifyDeletePasswordMutation.isPending
                  }
                  className="rounded-2xl px-4 py-2 text-sm"
                >
                  {verifyDeletePasswordMutation.isPending
                    ? "Verifying..."
                    : "Verify password"}
                </Button>
                <Button
                  type="submit"
                  theme="cancel"
                  disabled={
                    !isPasswordVerified || deleteOrganizationMutation.isPending
                  }
                  className="rounded-2xl px-4 py-2 text-sm font-semibold"
                >
                  {deleteOrganizationMutation.isPending
                    ? "Deleting..."
                    : "Delete organization"}
                </Button>
              </div>
              {!isPasswordVerified && deletePassword.trim() ? (
                <p className="text-xs text-rose-600 dark:text-rose-200">
                  Verify your password to enable deletion.
                </p>
              ) : null}
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
