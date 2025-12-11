"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FiLayers,
  FiLogOut,
  FiPlusCircle,
  FiSettings,
  FiShield,
} from "react-icons/fi";
import { MdOutlineDashboardCustomize } from "react-icons/md";

import { Modal } from "@/app/components/atoms/frame/Modal";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/system-owner",
    icon: <MdOutlineDashboardCustomize />,
  },
  {
    label: "Organizations",
    href: "/system-owner/organization",
    icon: <FiLayers />,
  },
  {
    label: "Create organization",
    href: "/system-owner/create",
    icon: <FiPlusCircle />,
  },
  {
    label: "Settings",
    href: "/system-owner/settings",
    icon: <FiSettings />,
  },
];

type SystemOwnerLeftMenuProps = {
  viewerName?: string | null;
  viewerEmail?: string | null;
};

export default function SystemOwnerLeftMenu({
  viewerName,
  viewerEmail,
}: SystemOwnerLeftMenuProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const normalizedPath = pathname?.replace(/\/$/, "") || "";

  const matchesPath = (href: string) => {
    if (!href) return normalizedPath === "";
    if (normalizedPath === href) return true;
    return normalizedPath.startsWith(`${href}/`);
  };

  const hasLongerMatch = (href: string) =>
    navItems.some((item) => {
      const candidate = item.href.replace(/\/$/, "");
      if (candidate.length <= href.length) return false;
      return matchesPath(candidate);
    });

  const isActive = (href: string) => {
    const normalizedHref = href.replace(/\/$/, "");
    if (!matchesPath(normalizedHref)) return false;
    if (normalizedPath === normalizedHref) return true;
    return !hasLongerMatch(normalizedHref);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await signOut({
        callbackUrl: "/auth/super_admin",
      });
    } catch (error) {
      console.error(error);
      setLogoutError("Unable to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
      setIsOpenModal(false);
    }
  };

  const containerClasses = [
    "flex min-h-full w-full flex-col gap-4 rounded border border-white/60 bg-white/90 px-2 py-6 text-slate-700 shadow-2xl shadow-indigo-100 backdrop-blur transition-colors duration-200",
    "dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-slate-900/60",
  ].join(" ");

  const getNavClasses = (active: boolean) =>
    [
      "flex w-full items-center gap-3 rounded px-4 py-3 text-sm font-semibold transition-all duration-200",
      active
        ? "bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30 dark:shadow-sky-900/40"
        : "text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-slate-100",
    ].join(" ");

  return (
    <div className={containerClasses}>
      <div className="rounded border border-slate-200/70 bg-white/95 px-4 py-5 text-center shadow-lg shadow-indigo-50 dark:border-slate-700/60 dark:bg-slate-900/80">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:text-left">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded border border-indigo-100 bg-indigo-50 text-2xl text-indigo-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <FiShield />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
              System Owner
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              Global workspace control
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provision, audit, and secure every tenant.
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={getNavClasses(isActive(item.href))}>
                <span className="text-lg">{item.icon}</span>
                <span className="text-[16px] font-semibold">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto rounded border border-slate-200/80 bg-white/85 p-4 text-sm dark:border-slate-700/70 dark:bg-slate-900/70">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
          Signed in as
        </p>
        <p className="text-base font-semibold text-slate-900 dark:text-white">
          {viewerName || "Super Admin"}
        </p>
        {viewerEmail ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{viewerEmail}</p>
        ) : null}
        <button
          type="button"
          onClick={() => setIsOpenModal(true)}
          disabled={isLoggingOut}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 dark:from-rose-600 dark:via-amber-500 dark:to-orange-400 dark:shadow-rose-900/40"
        >
          <FiLogOut />
          {isLoggingOut ? "Signing out..." : "Log out"}
        </button>
        {logoutError ? (
          <p className="mt-3 text-xs font-semibold text-rose-600 dark:text-rose-300">
            {logoutError}
          </p>
        ) : null}
      </div>

      <Modal
        doneButtonText="Log out"
        cancelButtonText="Cancel"
        isCancelButton
        className="h-auto w-[496px]"
        open={isOpenModal}
        setOpen={setIsOpenModal}
        title="Log out?"
        buttonWidth="120px"
        buttonHeight="40px"
        onDoneClick={handleLogout}
        closeOnClick={() => setIsOpenModal(false)}
      >
        <div>Are you sure you want to log out of the System Owner console?</div>
      </Modal>
    </div>
  );
}
