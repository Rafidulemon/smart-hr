import {
  FiAperture,
  FiCpu,
  FiLink2,
  FiRefreshCw,
  FiShield,
  FiZap,
} from "react-icons/fi";

import Button from "@/app/components/atoms/buttons/Button";

const connectors = [
  {
    name: "Workday",
    type: "HRIS",
    status: "Synced 2m ago",
    coverage: "12 tenants",
  },
  {
    name: "BambooHR",
    type: "HRIS",
    status: "Queued · 4k records",
    coverage: "8 tenants",
  },
  {
    name: "Slack",
    type: "Collaboration",
    status: "Streaming live events",
    coverage: "18 tenants",
  },
  {
    name: "Netsuite",
    type: "Finance",
    status: "Signed · next sync 00:10 UTC",
    coverage: "6 tenants",
  },
];

const aiPipelines = [
  {
    title: "Payroll anomaly detection",
    helper: "Flags unusual net-pay jumps and missing approvals.",
    signal: "+12 high-risk events/week",
    status: "Active",
  },
  {
    title: "AI onboarding concierge",
    helper: "Surfaces suggested tasks based on role + location.",
    signal: "Saves ~3 hours setup",
    status: "Pilot",
  },
  {
    title: "Benefits enrollment co-pilot",
    helper: "Automates eligibility and plan reminders.",
    signal: "+18% on-time enrollment",
    status: "Active",
  },
];

const syncHistory = [
  {
    id: "SYNC-4411",
    source: "Workday",
    scope: "Acme Labs · 518 employees",
    result: "Success",
    duration: "2m 14s",
  },
  {
    id: "SYNC-4410",
    source: "Slack",
    scope: "Globex · events",
    result: "Streaming",
    duration: "Live",
  },
  {
    id: "SYNC-4407",
    source: "Netsuite",
    scope: "Northwind · payroll batch",
    result: "Warnings",
    duration: "6m 02s",
  },
];

const assuranceBadges = [
  "SOC 2 scoped",
  "PII encrypted in transit",
  "Secrets rotated every 24h",
];

export default function SystemOwnerAIIntegrationsPage() {
  return (
    <div className="space-y-8">
      <div className="glass-panel gap-4">
        <div className="flex items-start gap-4">
          <span className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 shadow-inner dark:bg-slate-800 dark:text-slate-100">
            <FiCpu className="text-xl" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              Intelligence Layer
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
              AL & Integrations
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage AI assistants, vendor connectors, and cross-tenant sync windows.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button theme="secondary">Add connector</Button>
          <Button>Sync everything</Button>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-5">
          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Connected systems
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {connectors.length} integrations live
                </h2>
              </div>
              <FiLink2 className="text-2xl text-indigo-500 dark:text-slate-200" />
            </div>
            <div className="mt-5 space-y-4">
              {connectors.map((connector) => (
                <div
                  key={connector.name}
                  className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {connector.name}
                      </p>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                        {connector.type}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800/70 dark:text-slate-200">
                      {connector.coverage}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{connector.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 dark:bg-slate-800 dark:text-slate-100">
                <FiZap className="text-xl" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  AI pipelines
                </p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Assistants & signals
                </h3>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {aiPipelines.map((pipeline) => (
                <div
                  key={pipeline.title}
                  className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900 dark:text-white">{pipeline.title}</p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800/70 dark:text-slate-200">
                      {pipeline.status}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">{pipeline.helper}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{pipeline.signal}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Sync health
                </p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent jobs</h3>
              </div>
              <Button theme="white" className="text-xs">
                View logs
              </Button>
            </div>
            <div className="mt-4 space-y-4">
              {syncHistory.map((sync) => (
                <div
                  key={sync.id}
                  className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                    <span>{sync.id}</span>
                    <span>{sync.result}</span>
                  </div>
                  <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                    {sync.source}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{sync.scope}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Duration: {sync.duration}</span>
                    <button className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-500 dark:text-sky-400">
                      <FiRefreshCw />
                      Retry
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 text-white shadow-2xl shadow-slate-900/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                assurance
              </span>
              <FiShield className="text-xl" />
            </div>
            <h3 className="mt-3 text-lg font-semibold">Integration controls</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              {assuranceBadges.map((badge) => (
                <li key={badge} className="flex items-center gap-2">
                  <FiAperture />
                  {badge}
                </li>
              ))}
            </ul>
            <Button href="#" theme="white" className="mt-4 text-slate-900">
              Download evidence pack
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
