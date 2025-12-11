"use client";

import { useMemo, useState } from "react";
import { FiFlag, FiTarget, FiToggleLeft, FiUsers } from "react-icons/fi";

import Button from "@/app/components/atoms/buttons/Button";

type EnvironmentKey = "production" | "staging" | "beta";

type FlagConfig = {
  key: string;
  name: string;
  description: string;
  owner: string;
  impact: string;
  segments: string[];
};

const environments: Array<{
  key: EnvironmentKey;
  label: string;
  helper: string;
}> = [
  { key: "production", label: "Production", helper: "Live tenants" },
  { key: "staging", label: "Staging", helper: "Preview orgs" },
  { key: "beta", label: "Beta", helper: "Opt-in groups" },
];

const flags: FlagConfig[] = [
  {
    key: "precision-payroll",
    name: "Precision payroll approvals",
    description: "Second reviewer required for payouts above $250k.",
    owner: "Finance platform",
    impact: "Hold queue drops by 37%",
    segments: ["Finance controllers", "Tier-1 tenants"],
  },
  {
    key: "smart-onboarding",
    name: "Smart onboarding journeys",
    description: "Dynamic checklists with AI suggestions.",
    owner: "People ops",
    impact: "Time-to-live cut by 22%",
    segments: ["APAC pilots", "Hybrid roles"],
  },
  {
    key: "ai-auditor",
    name: "AI auditor guardrails",
    description: "Detects risky manual overrides and escalates.",
    owner: "Security",
    impact: "Blocks 12 anomalies / week",
    segments: ["High-risk permissions"],
  },
];

const initialMatrix: Record<string, Record<EnvironmentKey, boolean>> = {
  "precision-payroll": {
    production: true,
    staging: true,
    beta: true,
  },
  "smart-onboarding": {
    production: false,
    staging: true,
    beta: true,
  },
  "ai-auditor": {
    production: true,
    staging: true,
    beta: false,
  },
};

const overrideEvents = [
  {
    id: "FF-9321",
    flag: "Precision payroll approvals",
    actor: "Lena (Security)",
    action: "Paused in production",
    time: "11:20 UTC",
  },
  {
    id: "FF-9318",
    flag: "Smart onboarding journeys",
    actor: "API",
    action: "Staged rollout to beta cohort",
    time: "07:43 UTC",
  },
  {
    id: "FF-9305",
    flag: "AI auditor guardrails",
    actor: "Ravi (Support)",
    action: "Temporary disablement (30 mins)",
    time: "Yesterday",
  },
];

export default function SystemOwnerFeatureFlagsPage() {
  const [flagMatrix, setFlagMatrix] = useState(initialMatrix);

  const enabledCount = useMemo(
    () =>
      Object.values(flagMatrix).reduce(
        (sum, envs) =>
          sum +
          Object.values(envs).reduce((envSum, enabled) => envSum + (enabled ? 1 : 0), 0),
        0,
      ),
    [flagMatrix],
  );

  const toggleFlag = (flagKey: string, envKey: EnvironmentKey) => {
    setFlagMatrix((previous) => ({
      ...previous,
      [flagKey]: {
        ...previous[flagKey],
        [envKey]: !previous[flagKey]?.[envKey],
      },
    }));
  };

  return (
    <div className="space-y-8">
      <div className="glass-panel gap-4">
        <div className="flex items-start gap-4">
          <span className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 shadow-inner dark:bg-slate-800 dark:text-slate-100">
            <FiFlag className="text-xl" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              Experiments
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
              Feature Flags
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Launch segmented rollouts across every tenant from a single console.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button theme="secondary">Create flag</Button>
          <Button>Sync to Git</Button>
        </div>
      </div>

      <section className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              Rollout grid
            </p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {enabledCount} environments active
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            {environments.map((env) => (
              <span
                key={env.key}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-500 dark:bg-slate-800/70 dark:text-slate-200"
              >
                <FiToggleLeft />
                {env.label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {flags.map((flag) => {
            const state = flagMatrix[flag.key];
            return (
              <div
                key={flag.key}
                className="rounded-3xl border border-slate-100 bg-white/80 p-5 text-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/70"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {flag.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Owner: {flag.owner} · {flag.impact}
                    </p>
                  </div>
                  <Button theme="white" className="text-xs">
                    View diff
                  </Button>
                </div>
                <p className="mt-3 text-slate-600 dark:text-slate-400">{flag.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                  {flag.segments.map((segment) => (
                    <span
                      key={segment}
                      className="rounded-full bg-slate-100 px-3 py-1 font-semibold dark:bg-slate-800/70 dark:text-slate-300"
                    >
                      {segment}
                    </span>
                  ))}
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {environments.map((env) => {
                    const enabled = state?.[env.key];
                    return (
                      <button
                        key={env.key}
                        type="button"
                        onClick={() => toggleFlag(flag.key, env.key)}
                        className={`flex h-full flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                          enabled
                            ? "border-indigo-400 bg-indigo-50/70 text-indigo-700 shadow-lg shadow-indigo-100 dark:border-sky-500 dark:bg-sky-500/20 dark:text-sky-200 dark:shadow-sky-900/40"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em]">
                          <span>{env.label}</span>
                          <span>{enabled ? "ON" : "OFF"}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{env.helper}</p>
                        <span
                          className={`mt-2 inline-flex h-6 w-12 items-center rounded-full ${
                            enabled ? "bg-indigo-500/80 dark:bg-sky-500" : "bg-slate-300/80 dark:bg-slate-700"
                          }`}
                        >
                          <span
                            className={`ml-1 inline-block h-5 w-5 rounded-full bg-white transition-all duration-200 ${
                              enabled ? "translate-x-5" : ""
                            }`}
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <div className="space-y-5">
          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 dark:bg-slate-800 dark:text-slate-100">
                <FiUsers className="text-xl" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Cohorts
                </p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  38k users targeted
                </h3>
              </div>
            </div>
            <div className="mt-5 grid gap-4 text-sm md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  Production
                </p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">21k</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Flagged tenants</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  Experiments
                </p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">17k</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Opt-in beta users</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Targeting logic
                </p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Active rules
                </h3>
              </div>
              <FiTarget className="text-2xl text-indigo-500 dark:text-slate-100" />
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="rounded-2xl border border-slate-100 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                • Tenants with SOC 2 compliance automatically receive AI auditor guardrails.
              </li>
              <li className="rounded-2xl border border-slate-100 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                • APAC organizations route to smart onboarding staging flows.
              </li>
              <li className="rounded-2xl border border-slate-100 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                • Finance admins flagged for precision payroll when payouts exceed thresholds.
              </li>
            </ul>
            <Button theme="secondary" className="mt-5 w-full">
              Edit rule tree
            </Button>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Override log
              </p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Recent changes
              </h3>
            </div>
            <Button theme="white" className="text-xs">
              Subscribe
            </Button>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
            <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50/70 text-left text-xs uppercase tracking-[0.2em] text-slate-400 dark:bg-slate-900/40 dark:text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Flag</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-200">
                {overrideEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="px-4 py-3 font-semibold">{event.id}</td>
                    <td className="px-4 py-3">{event.flag}</td>
                    <td className="px-4 py-3">{event.action}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      <div>{event.time}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">{event.actor}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
