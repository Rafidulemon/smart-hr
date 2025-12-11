"use client";

import Image from "next/image";
import { ReactNode } from "react";
import Header from "@/app/components/navigations/Header";
import { DEFAULT_ORGANIZATION_LOGO } from "@/lib/organization-branding";

type AuthLayoutProps = {
  children: ReactNode;
  tenantName?: string | null;
  tenantLogo?: string | null;
};

export default function AuthLayout({
  children,
  tenantName,
  tenantLogo,
}: AuthLayoutProps) {
  const brandName = tenantName?.trim() || "Smart HR";
  const brandLogo = tenantLogo || DEFAULT_ORGANIZATION_LOGO;
  const highlightItems = [
    {
      title: "One identity",
      description: `Sign in, accept invites, and reset passwords with the same secure ${brandName} credentials.`,
    },
    {
      title: "Tenant-aware security",
      description:
        "Every action takes place inside your dedicated workspace, keeping data scoped to the right organization.",
    },
    {
      title: "Human support",
      description:
        "Need help? People Ops teams can resend invites or unlock accounts in a few clicks.",
    },
  ];

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-[-20%] top-[-30%] h-96 bg-gradient-to-b from-indigo-600/40 via-slate-900 to-slate-950 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] h-80 w-80 rounded-full bg-sky-500/30 blur-[140px]" />
        <div className="absolute right-[-15%] top-1/4 h-96 w-96 rounded-full bg-cyan-500/30 blur-[160px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="px-6 pt-6">
          <Header tenantBrand={{ name: brandName, logoUrl: tenantLogo }} />
        </div>

        <div className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-6 pb-12 pt-10 lg:grid-cols-[1.05fr,0.95fr] lg:pt-16">
          <aside className="rounded-[32px] border border-white/10 bg-white/5 p-10 text-white shadow-[0_25px_80px_rgba(15,23,42,0.45)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-200">
              {brandName} workspace
            </p>
            <h1 className="mt-6 text-3xl font-semibold leading-tight text-white lg:text-4xl">
              Secure identities for every HR ritual
            </h1>
            <p className="mt-4 text-base text-slate-200">
              Use the same trusted gateway whether you are logging in, accepting
              an invitation, or recovering an account.
            </p>

            <ul className="mt-10 space-y-6 text-sm text-slate-100">
              {highlightItems.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-300" />
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-slate-200/80">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-12 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/20 bg-white/10">
                <Image
                  src={brandLogo}
                  alt={`${brandName} logo`}
                  fill
                  className="object-contain p-2"
                  sizes="56px"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                  Organization
                </p>
                <p className="text-base font-semibold text-white">
                  {brandName}
                </p>
                <p className="text-slate-200/70">
                  Managed access · HR & payroll apps
                </p>
              </div>
            </div>
          </aside>

          <main className="relative flex items-start justify-center lg:items-stretch">
            <div className="w-full max-w-xl rounded-[32px] border border-white/80 bg-white/95 p-10 text-slate-900 shadow-2xl shadow-slate-200/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-100 dark:shadow-slate-950/70">
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white">
                  →
                </span>
                <span>Authenticate</span>
              </div>
              <p className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                Access {brandName}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Complete the steps below to manage your workspace access.
              </p>

              <div className="mt-8">{children}</div>

              <p className="mt-10 text-center text-xs text-slate-400 dark:text-slate-500">
                Need help? Contact your HR administrator or{" "}
                <a
                  className="font-semibold text-indigo-600 dark:text-sky-400"
                  href="mailto:support@smart-hr.app"
                >
                  support@smart-hr.app
                </a>
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
