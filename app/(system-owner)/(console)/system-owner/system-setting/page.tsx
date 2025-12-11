"use client";

import { useState } from "react";
import {
  FiGlobe,
  FiLock,
  FiSettings,
  FiShield,
  FiToggleLeft,
  FiWifi,
} from "react-icons/fi";

import Button from "@/app/components/atoms/buttons/Button";

const replicationRegions = [
  {
    key: "us-east-1",
    label: "us-east-1",
    helper: "Primary",
  },
  {
    key: "eu-central-1",
    label: "eu-central-1",
    helper: "GDPR workloads",
  },
  {
    key: "ap-southeast-1",
    label: "ap-southeast-1",
    helper: "APAC overflow",
  },
];

const accessWindows = [
  {
    label: "Maintenance mode",
    helper: "Locks tenant logins and surfaces banner globally.",
    controlKey: "maintenance",
  },
  {
    label: "Enforce MFA for console",
    helper: "Overrides tenant preference to require security keys.",
    controlKey: "mfa",
  },
  {
    label: "Session auto-timeout",
    helper: "Logs out idle sessions beyond 30 minutes.",
    controlKey: "sessionTimeout",
  },
];

export default function SystemOwnerSystemSettingPage() {
  const [selectedRegions, setSelectedRegions] = useState<string[]>([
    "us-east-1",
    "eu-central-1",
  ]);
  const [controls, setControls] = useState<Record<string, boolean>>({
    maintenance: false,
    mfa: true,
    sessionTimeout: true,
  });
  const [zeroTrustMode, setZeroTrustMode] = useState(true);

  const toggleRegion = (region: string) => {
    setSelectedRegions((previous) =>
      previous.includes(region)
        ? previous.filter((value) => value !== region)
        : [...previous, region],
    );
  };

  const toggleControl = (key: string) => {
    setControls((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  return (
    <div className="space-y-8">
      <div className="glass-panel gap-4">
        <div className="flex items-start gap-4">
          <span className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 shadow-inner dark:bg-slate-800 dark:text-slate-100">
            <FiSettings className="text-xl" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              Global controls
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
              System Setting
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Toggle hardened defaults, data residency, and console safety nets.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button theme="secondary">Save policy</Button>
          <Button>Publish notice</Button>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-slate-100 p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                <FiGlobe className="text-xl" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Data residency
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Replication targets
                </h2>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {replicationRegions.map((region) => {
                const enabled = selectedRegions.includes(region.key);
                return (
                  <button
                    key={region.key}
                    type="button"
                    onClick={() => toggleRegion(region.key)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
                      enabled
                        ? "border-indigo-400 bg-indigo-50/70 text-indigo-700 shadow-lg shadow-indigo-100 dark:border-sky-500 dark:bg-sky-500/20 dark:text-sky-200"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    <p className="font-semibold">{region.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{region.helper}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <FiWifi />
              Selected regions are pinned for compliance exports and failover playbooks.
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Zero trust
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Network posture
                </h2>
              </div>
              <FiLock className="text-2xl text-indigo-500 dark:text-slate-200" />
            </div>
            <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Zero-trust mode</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Restrict console to VPN/IP allow list.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setZeroTrustMode((value) => !value)}
                  className={`inline-flex h-6 w-12 items-center rounded-full ${
                    zeroTrustMode ? "bg-indigo-500/80 dark:bg-sky-500" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`ml-1 inline-block h-5 w-5 rounded-full bg-white transition-all duration-200 ${
                      zeroTrustMode ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
              <div className="rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/70 p-4 text-xs text-slate-500 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-400">
                Active CIDR ranges: 13.54.0.0/18 · 54.240.196.0/24 · 3.18.12.0/26
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 dark:bg-slate-800 dark:text-slate-100">
                <FiShield className="text-xl" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Console guardrails
                </p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Access policies
                </h3>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {accessWindows.map((window) => {
                const enabled = controls[window.controlKey];
                return (
                  <div
                    key={window.controlKey}
                    className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{window.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{window.helper}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleControl(window.controlKey)}
                        className={`inline-flex h-6 w-12 items-center rounded-full ${
                          enabled ? "bg-indigo-500/80 dark:bg-sky-500" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <span
                          className={`ml-1 inline-block h-5 w-5 rounded-full bg-white transition-all duration-200 ${
                            enabled ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 text-white shadow-2xl shadow-slate-900/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                change log
              </span>
              <FiToggleLeft className="text-xl" />
            </div>
            <p className="mt-3 text-lg font-semibold">Last published</p>
            <p className="text-sm text-white/70">Apr 14, 2025 · by Priya (Security)</p>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>• Enabled stricter MFA for contractors.</li>
              <li>• Added APAC replica for latency control.</li>
              <li>• Rotated root tokens for automation bots.</li>
            </ul>
            <Button href="#" theme="white" className="mt-4 text-slate-900">
              View history
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
