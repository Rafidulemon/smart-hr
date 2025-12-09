"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FiLogOut,
  FiPlusCircle,
  FiShield,
} from "react-icons/fi";
import { MdOutlineDashboardCustomize } from "react-icons/md";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  {
    label: "Organizations",
    href: "/system-owner",
    icon: <MdOutlineDashboardCustomize />,
  },
  {
    label: "Create organization",
    href: "/system-owner/create",
    icon: <FiPlusCircle />,
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

  const normalizedPath = pathname?.replace(/\/$/, "") || "";

  const isActive = (href: string) => {
    const normalizedHref = href.replace(/\/$/, "");
    return normalizedPath === normalizedHref;
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
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="w-full max-w-xs">
      <div className="sticky top-6 space-y-6 rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-xl shadow-indigo-100 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/80 dark:shadow-slate-950/40">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
          <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-200">
            <FiShield />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
              System Owner
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Global workspace control
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive(item.href)
                  ? "bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-slate-100"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
            Signed in as
          </p>
          <p className="text-base font-semibold text-slate-900 dark:text-white">
            {viewerName || "Super Admin"}
          </p>
          {viewerEmail ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {viewerEmail}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-rose-400/50 dark:hover:text-rose-300"
          >
            <FiLogOut />
            {isLoggingOut ? "Signing out..." : "Log out"}
          </button>
          {logoutError ? (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">
              {logoutError}
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
