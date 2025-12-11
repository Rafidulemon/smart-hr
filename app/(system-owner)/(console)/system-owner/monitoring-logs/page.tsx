import {
  FiActivity,
  FiAlertTriangle,
  FiEye,
  FiSearch,
  FiServer,
  FiTerminal,
} from "react-icons/fi";

import Button from "@/app/components/atoms/buttons/Button";

const healthMetrics = [
  {
    label: "Realtime uptime",
    value: "99.982%",
    helper: "Last 30 days",
  },
  {
    label: "Median latency",
    value: "312 ms",
    helper: "API gateway (p95: 820 ms)",
  },
  {
    label: "Log ingestion",
    value: "11.4 M events",
    helper: "Past 24h",
  },
];

const timelineEvents = [
  {
    time: "14:02 UTC",
    title: "Webhook spike auto-throttled",
    detail: "Queue drained in 58s across APAC cluster.",
    severity: "warning",
  },
  {
    time: "11:40 UTC",
    title: "AI auditor redeployed",
    detail: "Rolling update completed across 3 regions.",
    severity: "info",
  },
  {
    time: "08:05 UTC",
    title: "Database failover rehearsal",
    detail: "Replica promotion performed (no impact).",
    severity: "info",
  },
];

const logEntries = [
  {
    id: "LOG-88213",
    source: "api-gateway",
    level: "info",
    message: "Dispatched 1,245 events to webhook target //acme",
  },
  {
    id: "LOG-88210",
    source: "audit-core",
    level: "warn",
    message: "Manual override attempt flagged in tenant globex",
  },
  {
    id: "LOG-88198",
    source: "stream-worker",
    level: "info",
    message: "Synchronized payroll batch for northwind (314 rows)",
  },
  {
    id: "LOG-88195",
    source: "alerts",
    level: "error",
    message: "Pager escalation triggered for finance-latency",
  },
];

const streamWindows = [
  {
    label: "Realtime events",
    rate: "14.2k /s",
    helper: "Kafka partition 0-8",
    status: "Healthy",
  },
  {
    label: "Audit trail",
    rate: "620 /s",
    helper: "Immutable ledger writes",
    status: "Healthy",
  },
  {
    label: "AI insights",
    rate: "2.1k /s",
    helper: "Inference output + signals",
    status: "Observing",
  },
];

export default function SystemOwnerMonitoringLogsPage() {
  return (
    <div className="space-y-8">
      <div className="glass-panel gap-4">
        <div className="flex items-start gap-4">
          <span className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 shadow-inner dark:bg-slate-800 dark:text-slate-100">
            <FiTerminal className="text-xl" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              Control room
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
              Monitoring & Logs
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Stream live telemetry, flag anomalies, and keep the console resilient.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button theme="secondary">Pause ingest</Button>
          <Button>Open explorer</Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {healthMetrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-lg shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              {metric.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              {metric.value}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{metric.helper}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Timeline
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Active signals
                </h2>
              </div>
              <FiActivity className="text-2xl text-indigo-500 dark:text-slate-200" />
            </div>
            <div className="mt-6 space-y-5">
              {timelineEvents.map((event) => (
                <div key={event.time} className="relative pl-8">
                  <span
                    className={`absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      event.severity === "warning"
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-200"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <FiAlertTriangle />
                  </span>
                  <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{event.time}</span>
                      <span>{event.severity === "warning" ? "Attention" : "Info"}</span>
                    </div>
                    <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                      {event.title}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{event.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Streams
                </p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Live ingest windows
                </h3>
              </div>
              <FiServer className="text-2xl text-indigo-500 dark:text-slate-200" />
            </div>
            <div className="mt-4 space-y-4">
              {streamWindows.map((stream) => (
                <div
                  key={stream.label}
                  className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                    <span>{stream.label}</span>
                    <span>{stream.rate}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stream.helper}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Status: {stream.status}</span>
                    <Button theme="white" className="px-3 py-1 text-xs">
                      Inspect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Log search
                </p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Live tail</h3>
              </div>
              <Button theme="white" className="text-xs">
                <span className="flex items-center gap-2">
                  <FiSearch />
                  Filter
                </span>
              </Button>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
              <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
                <thead className="bg-slate-50/70 text-left text-xs uppercase tracking-[0.2em] text-slate-400 dark:bg-slate-900/40 dark:text-slate-500">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Level</th>
                    <th className="px-4 py-3">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-200">
                  {logEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-3 font-semibold">{entry.id}</td>
                      <td className="px-4 py-3 text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        {entry.source}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            entry.level === "error"
                              ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
                              : entry.level === "warn"
                              ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
                              : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200"
                          }`}
                        >
                          {entry.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{entry.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 text-white shadow-2xl shadow-slate-900/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                watchers
              </span>
              <FiEye className="text-xl" />
            </div>
            <p className="mt-3 text-lg font-semibold">Pager roster</p>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li>• Platform (primary): Ivana · pager@smart-hr.app</li>
              <li>• Database: Chen · db-watch@smart-hr.app</li>
              <li>• AI guardrails: Hadi · ai@smart-hr.app</li>
            </ul>
            <Button href="#" theme="white" className="mt-4 text-slate-900">
              Update schedule
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
