import {
  FiBarChart2,
  FiCheckCircle,
  FiCreditCard,
  FiFileText,
  FiLayers,
  FiRefreshCcw,
  FiSettings,
  FiShield,
  FiTarget,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import Button from "@/app/components/atoms/buttons/Button";

type PlanStatus = "Active" | "Draft" | "Retiring";

type PlanConfig = {
  name: string;
  description: string;
  monthly: string;
  yearly: string;
  trial: string;
  status: PlanStatus;
  quotas: Array<{ label: string; value: string }>;
  features: string[];
  controls: string[];
  promo?: string;
};

type BillingProvider = {
  name: string;
  helper: string;
  status: "Connected" | "Not connected";
  account: string;
  currency: string;
  lastSync: string;
  health: string;
  taxRules: string[];
  refundPolicy: string;
  proration: string;
  actions: string[];
  statusTone: "healthy" | "warning";
};

type TenantStatus = "Active" | "Trial" | "Past Due" | "Canceled";

type TenantBillingRow = {
  tenant: string;
  plan: string;
  status: TenantStatus;
  cycle: "Monthly" | "Yearly";
  usage: string[];
  invoice: string;
  amount: string;
  notes?: string;
  actions: string[];
};

type AnalyticsMetric = {
  label: string;
  value: string;
  helper: string;
};

type InvoiceStatus = "Paid" | "Due" | "Past Due";

type Invoice = {
  id: string;
  period: string;
  amount: string;
  status: InvoiceStatus;
  description: string;
  paymentMethod: string;
};

type BillingBehaviorConfig = {
  label: string;
  detail: string;
  helper: string;
};

type RevenueOpsTool = {
  label: string;
  detail: string;
  helper: string;
  action?: string;
};

type ComplianceField = {
  label: string;
  value: string;
  helper?: string;
};

type AuditLogEntry = {
  id: string;
  action: string;
  actor: string;
  time: string;
};

const planConfigs: PlanConfig[] = [
  {
    name: "Growth",
    description: "Default plan for orgs scaling up to 400 employees.",
    monthly: "$249",
    yearly: "$2,490",
    trial: "21-day free trial · includes 250 seats",
    status: "Active",
    quotas: [
      { label: "Employee limit", value: "400 seats" },
      { label: "Storage limit", value: "5 TB" },
      { label: "API rate limit", value: "400 req/min" },
      { label: "Support tier", value: "Priority email · 24h SLA" },
    ],
    features: [
      "Feature access: Workflow automation, SSO, integrations",
      "Usage alerts + auto overage emails",
      "Free trials auto-convert unless canceled",
    ],
    controls: [
      "Promo: 10% off for 3 months (Q2-LAUNCH)",
      "Coupons enabled: PARTNER-25, COMP-90",
      "Employee/storage adjustments sync to billing",
    ],
    promo: "Yearly upgrade adds 2 free months automatically.",
  },
  {
    name: "Scale",
    description: "Enterprise controls for compliance-heavy tenants.",
    monthly: "$599",
    yearly: "$5,990",
    trial: "30-day free trial · 800 seats & 8 TB storage",
    status: "Active",
    quotas: [
      { label: "Employee limit", value: "Soft cap 2k (alerts at 90%)" },
      { label: "Storage limit", value: "12 TB" },
      { label: "API rate limit", value: "1,200 req/min + burst" },
      { label: "Support tier", value: "Premium SLA · 4h response" },
    ],
    features: [
      "Feature access: AI add-ons, audit logs, SCIM",
      "Usage-based overage: API & storage credits",
      "Dedicated success manager & sandbox tenants",
    ],
    controls: [
      "Prorations: Upgrades charge immediately",
      "Downgrades scheduled next billing cycle",
      "Coupons enabled: ENTERPRISE-EAP only",
    ],
    promo: "Free priority onboarding + concierge migration until Jun 30.",
  },
  {
    name: "Legacy Lite",
    description: "Sunset pilot plan reserved for early adopters.",
    monthly: "$149",
    yearly: "$1,490",
    trial: "14-day trial · manual approval required",
    status: "Retiring",
    quotas: [
      { label: "Employee limit", value: "120 seats" },
      { label: "Storage limit", value: "1 TB" },
      { label: "API rate limit", value: "120 req/min" },
      { label: "Support tier", value: "Basic email · 72h SLA" },
    ],
    features: [
      "Feature access: Core HR + payroll only",
      "No AI automations or audit logs",
      "Manual review for mid-cycle upgrades",
    ],
    controls: [
      "Trials auto-cancel if inactive day 14",
      "Coupons disabled to protect migration path",
      "Force-migrate to Growth on Aug 31",
    ],
  },
];

const billingProviders: BillingProvider[] = [
  {
    name: "Stripe",
    helper: "Primary billing provider",
    status: "Connected",
    account: "acct_1PH39292L (Live)",
    currency: "USD default · EUR, GBP enabled",
    lastSync: "Synced 2m ago",
    health: "Webhooks healthy · 4/4 endpoints acked",
    taxRules: [
      "EU: collect VAT then reverse charge if tax ID present.",
      "APAC: add 7% GST when no registration is stored.",
    ],
    refundPolicy: "Auto-approve refunds < $200 within 48h; manual review after.",
    proration: "Upgrades charge immediately · downgrades defer until next cycle.",
    actions: ["Refresh webhooks", "Test connection", "Open dashboard"],
    statusTone: "healthy",
  },
  {
    name: "Lemon Squeezy",
    helper: "Marketplace checkout (optional)",
    status: "Not connected",
    account: "—",
    currency: "Supports 10+ currencies",
    lastSync: "Never",
    health: "No webhooks configured",
    taxRules: ["Provider handles VAT/GST remittance once connected."],
    refundPolicy: "Manual refunds until integration is enabled.",
    proration: "Follows provider defaults after connection.",
    actions: ["Connect account"],
    statusTone: "warning",
  },
];

const tenantBilling: TenantBillingRow[] = [
  {
    tenant: "Acme HR",
    plan: "Scale",
    status: "Active",
    cycle: "Monthly",
    usage: ["Employees: 780 / 800", "Storage: 4.2 TB / 12 TB", "MAU: 38k"],
    invoice: "#INV-8821",
    amount: "$12,800",
    notes: "Priority support + AI add-on",
    actions: ["Switch plan", "Adjust cycle", "Apply credit", "View invoices"],
  },
  {
    tenant: "Northwind Retail",
    plan: "Growth",
    status: "Past Due",
    cycle: "Monthly",
    usage: ["Employees: 410 / 400", "Storage: 5.1 TB / 5 TB", "MAU: 22k"],
    invoice: "#INV-8812",
    amount: "$2,310 outstanding",
    notes: "Overage emails sent · 2nd dunning notice",
    actions: ["Trigger invoice regen", "Apply credit", "Force cancel"],
  },
  {
    tenant: "FutureCorp Labs",
    plan: "Scale",
    status: "Trial",
    cycle: "Yearly",
    usage: ["Employees: 320 / 800", "Storage: 1.2 TB / 12 TB", "MAU: 9k"],
    invoice: "#INV-TRIAL-301",
    amount: "Trial · 18 days left",
    notes: "AI automation pilot",
    actions: ["Convert to paid", "Extend trial", "Switch plan"],
  },
  {
    tenant: "Orbit Health",
    plan: "Legacy Lite",
    status: "Canceled",
    cycle: "Monthly",
    usage: ["Employees: 80 / 120", "Storage: 0.6 TB / 1 TB", "MAU: 4k"],
    invoice: "#INV-8733",
    amount: "$0 (canceled)",
    notes: "Force-canceled Mar 15 for compliance",
    actions: ["Reinstate", "View invoices", "Export usage"],
  },
];

const analyticsMetrics: AnalyticsMetric[] = [
  { label: "MRR", value: "$82.4K", helper: "+6.2% vs last month" },
  { label: "ARR", value: "$988K", helper: "+8.4% YoY" },
  { label: "Active paid tenants", value: "146", helper: "+5 new this week" },
  { label: "Trial → Paid", value: "38%", helper: "Goal: 35%" },
  { label: "Failed payments / dunning", value: "12", helper: "3 at final reminder" },
  { label: "Churn rate", value: "2.4%", helper: "-0.4% vs last quarter" },
];

const planDistribution = [
  { plan: "Scale", percent: 48, helper: "Enterprise orgs" },
  { plan: "Growth", percent: 37, helper: "Default plan" },
  { plan: "Legacy lite", percent: 15, helper: "Sunsetting" },
];

const topTenants = [
  { tenant: "Acme HR", amount: "$12.8K / mo", plan: "Scale" },
  { tenant: "Pulse Security", amount: "$9.3K / mo", plan: "Scale" },
  { tenant: "Atlas Logistics", amount: "$6.7K / mo", plan: "Growth" },
  { tenant: "Nova Media", amount: "$5.4K / mo", plan: "Growth" },
];

const invoices: Invoice[] = [
  {
    id: "INV-2043",
    period: "Mar 2024",
    amount: "$1,480",
    status: "Paid",
    description: "R2 storage, email + SMS credits",
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: "INV-2042",
    period: "Feb 2024",
    amount: "$1,320",
    status: "Paid",
    description: "Usage + platform subscription",
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: "INV-2041",
    period: "Jan 2024",
    amount: "$1,210",
    status: "Paid",
    description: "AI inference overage adjustments",
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: "INV-2044",
    period: "Apr 2024",
    amount: "$1,560 (due May 05)",
    status: "Due",
    description: "Draft invoice · awaiting MAU sync",
    paymentMethod: "Visa •••• 4242",
  },
];

const billingBehaviors: BillingBehaviorConfig[] = [
  {
    label: "Proration controls",
    detail: "Upgrades bill immediately; downgrades defer until next cycle.",
    helper: "Applies to all plans unless overridden per tenant.",
  },
  {
    label: "Trial logic",
    detail: "Default trial length 21 days with 3-day reminders.",
    helper: "Auto-convert to paid unless manually canceled.",
  },
  {
    label: "Usage-based billing",
    detail: "MAU overage: $0.40 per user; storage: $18/TB; API: credits.",
    helper: "Auto-adjust invoices nightly with audit trail.",
  },
  {
    label: "Invoice rules",
    detail: "7-day grace period before dunning; auto-suspend after 21 days.",
    helper: "Failed payments trigger escalation emails + webhook.",
  },
  {
    label: "Notifications",
    detail: "Email finance@ + Slack #revops on any refund/credit.",
    helper: "CC account team for enterprise tenants automatically.",
  },
];

const revenueOpsTools: RevenueOpsTool[] = [
  {
    label: "Coupon engine",
    detail: "8 active codes · stacking disabled",
    helper: "Examples: Q2-LAUNCH, PARTNER-25, INTERNAL-100",
    action: "Create coupon",
  },
  {
    label: "Marketplace pricing",
    detail: "AWS marketplace -15% vs list · reseller tier synced",
    helper: "Set partner-specific markups or floors.",
  },
  {
    label: "Internal test tenants",
    detail: "12 tenants flagged as $0 billing",
    helper: "Auto-expire credits every 90 days.",
  },
  {
    label: "Billing exports",
    detail: "CSV export scheduled every Monday 06:00 UTC",
    helper: "Includes plan, usage, coupons, credits.",
    action: "Download latest",
  },
];

const complianceFields: ComplianceField[] = [
  {
    label: "Invoice prefix",
    value: "SMART-HR",
    helper: "Applies to all billing documents.",
  },
  {
    label: "Legal entity",
    value: "SmartHR Inc. · EIN 82-3322114",
    helper: "Displayed on every invoice + receipt.",
  },
  {
    label: "Tax ID",
    value: "EU VAT: EU123456789 · SG GST: 2009123Z",
    helper: "Tenants must supply VAT ID for reverse charge.",
  },
  {
    label: "Required billing fields",
    value: "Company name, billing address, VAT/GST ID",
    helper: "Blocking during checkout for enterprise plans.",
  },
  {
    label: "Billing audit logs",
    value: "Retained 7 years · export-ready",
  },
];

const billingAuditLog: AuditLogEntry[] = [
  {
    id: "BL-9823",
    action: "Updated Scale plan storage limit to 12 TB",
    actor: "Riya (System owner)",
    time: "Today · 09:24 UTC",
  },
  {
    id: "BL-9821",
    action: "Switched Northwind Retail to Growth plan",
    actor: "API · provisioning service",
    time: "Yesterday · 20:10 UTC",
  },
  {
    id: "BL-9817",
    action: "Applied $500 service credit to FutureCorp Labs",
    actor: "Devon (Support)",
    time: "Yesterday · 14:02 UTC",
  },
  {
    id: "BL-9811",
    action: "Refund issued for Pulse Security invoice INV-1021",
    actor: "Stripe webhook",
    time: "Mon · 17:45 UTC",
  },
  {
    id: "BL-9804",
    action: "Coupon PARTNER-25 created · scope: Growth plan",
    actor: "Mia (RevOps)",
    time: "Sun · 11:30 UTC",
  },
];

const planStatusStyles: Record<PlanStatus, string> = {
  Active:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  Draft: "bg-slate-100 text-slate-600 dark:bg-slate-800/70 dark:text-slate-200",
  Retiring:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
};

const providerToneStyles: Record<"healthy" | "warning", string> = {
  healthy:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  warning:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
};

const tenantStatusStyles: Record<TenantStatus, string> = {
  Active:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  Trial:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200",
  "Past Due":
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  Canceled:
    "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
};

const invoiceStatusStyles: Record<InvoiceStatus, string> = {
  Paid:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  Due: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  "Past Due":
    "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
};

export default function SystemOwnerPlansBillingPage() {
  return (
    <div className="space-y-8">
      <div className="glass-panel gap-4">
        <div className="flex items-start gap-4">
          <span className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 shadow-inner dark:bg-slate-800 dark:text-slate-100">
            <FiCreditCard className="text-xl" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              Plans & billing
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
              Monetization control center
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Design plans, manage every tenant&apos;s subscription, and keep the billing
              engine healthy from a single workspace.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button>Create plan</Button>
          <Button theme="secondary">Add coupon</Button>
          <Button theme="white">Export billing report</Button>
        </div>
      </div>

      <section className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              Plan portfolio
            </p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Manage subscription plans
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <FiLayers />
            <span>{planConfigs.length} products live</span>
          </div>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {planConfigs.map((plan) => (
            <div
              key={plan.name}
              className="rounded-3xl border border-slate-100 bg-white/80 p-5 text-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {plan.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {plan.description}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${planStatusStyles[plan.status]}`}
                >
                  {plan.status}
                </span>
              </div>

              <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {plan.monthly}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Monthly</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {plan.yearly}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Yearly</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    Free trial
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{plan.trial}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 text-xs text-slate-500 sm:grid-cols-2">
                <div className="space-y-2">
                  {plan.quotas.map((quota) => (
                    <div key={quota.label}>
                      <p className="font-semibold text-slate-900 dark:text-white">{quota.label}</p>
                      <p>{quota.value}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {plan.features.map((feature) => (
                    <p key={feature}>• {feature}</p>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                {plan.controls.map((control) => (
                  <p key={control}>• {control}</p>
                ))}
                {plan.promo ? (
                  <p className="rounded-2xl bg-indigo-50 px-3 py-2 font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
                    {plan.promo}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button theme="secondary" className="px-4 py-2 text-xs">
                  Edit plan
                </Button>
                <Button theme="white" className="px-4 py-2 text-xs">
                  Disable
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-2xl bg-indigo-50 p-2 text-indigo-600 dark:bg-slate-800 dark:text-slate-200">
                <FiSettings />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  Billing provider integration
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Connect Stripe, Paddle, Lemon Squeezy
                </h2>
              </div>
            </div>
            <Button theme="secondary" className="text-xs">
              Add provider
            </Button>
          </div>
          <div className="mt-5 space-y-4">
            {billingProviders.map((provider) => (
              <div
                key={provider.name}
                className="rounded-3xl border border-slate-100 bg-white/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {provider.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{provider.helper}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Account: {provider.account}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Currency: {provider.currency}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        providerToneStyles[provider.statusTone]
                      }`}
                    >
                      {provider.status}
                    </span>
                    <p className="mt-1">{provider.lastSync}</p>
                    <p>{provider.health}</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                      Tax rules
                    </p>
                    <ul className="mt-2 space-y-1">
                      {provider.taxRules.map((rule) => (
                        <li key={rule}>• {rule}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                      Policies
                    </p>
                    <p>Refunds: {provider.refundPolicy}</p>
                    <p>Proration: {provider.proration}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {provider.actions.map((action) => (
                    <Button key={action} theme="white" className="px-4 py-2 text-xs">
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Billing behavior
              </p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Configure global rules
              </h2>
            </div>
            <FiRefreshCcw className="text-xl text-indigo-500 dark:text-slate-200" />
          </div>
          <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
            {billingBehaviors.map((behavior) => (
              <div
                key={behavior.label}
                className="rounded-2xl border border-slate-100 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/70"
              >
                <p className="font-semibold text-slate-900 dark:text-white">{behavior.label}</p>
                <p>{behavior.detail}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{behavior.helper}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-3">
            <Button theme="secondary" className="flex-1">
              Edit rules
            </Button>
            <Button className="flex-1">Simulate invoice</Button>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-2xl bg-slate-100 p-2 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <FiUsers />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Tenant billing
              </p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                View & manage organizations
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button theme="secondary" className="text-xs">
              Sync from provider
            </Button>
            <Button theme="white" className="text-xs">
              Bulk apply credits
            </Button>
          </div>
        </div>

        <div className="mt-5 divide-y divide-slate-100 rounded-3xl border border-slate-100 bg-white/80 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/70">
          {tenantBilling.map((tenant) => (
            <div
              key={tenant.tenant}
              className="grid gap-4 p-5 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-[1.4fr,1fr,1fr]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {tenant.tenant}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${tenantStatusStyles[tenant.status]}`}
                  >
                    {tenant.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{tenant.notes}</p>
                <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                  {tenant.usage.map((item) => (
                    <p key={item}>• {item}</p>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{tenant.plan}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Billing: {tenant.cycle}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{tenant.invoice}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button theme="white" className="px-4 py-2 text-xs">
                    Switch plan
                  </Button>
                  <Button theme="white" className="px-4 py-2 text-xs">
                    View invoices
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {tenant.amount}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tenant.actions.map((action) => (
                    <span
                      key={action}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800/70 dark:text-slate-200"
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Financial analytics
              </p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Revenue dashboard
              </h2>
            </div>
            <FiBarChart2 className="text-2xl text-indigo-500 dark:text-slate-200" />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {analyticsMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  {metric.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{metric.helper}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                <span>Plan distribution</span>
                <span>Target mix</span>
              </div>
              <div className="mt-3 space-y-3">
                {planDistribution.map((item) => (
                  <div key={item.plan}>
                    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.plan}
                      </span>
                      <span>{item.percent}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-slate-200/80 dark:bg-slate-800/70">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.helper}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                <FiTarget />
                <span>Dunning overview</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">12</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Failed payments in sequence · 3 on final reminder
              </p>
              <ul className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <li>• Automatic retries every 48h.</li>
                <li>• Escalate to account team after 3rd failure.</li>
                <li>• Pause API after 21 days past due.</li>
              </ul>
              <Button theme="secondary" className="mt-4 text-xs">
                View dunning queue
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Top tenants
              </p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Highest MRR accounts
              </h2>
            </div>
            <FiTrendingUp className="text-xl text-indigo-500 dark:text-slate-200" />
          </div>
          <div className="mt-4 space-y-4">
            {topTenants.map((tenant) => (
              <div
                key={tenant.tenant}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{tenant.tenant}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{tenant.plan}</p>
                </div>
                <p className="text-base font-semibold text-slate-900 dark:text-white">{tenant.amount}</p>
              </div>
            ))}
          </div>
          <Button theme="secondary" className="mt-5 w-full">
            Download tenant leaderboard
          </Button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Platform invoices
              </p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                View & download
              </h2>
            </div>
            <FiFileText className="text-xl text-indigo-500 dark:text-slate-200" />
          </div>
          <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white/80 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/70">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-slate-600 dark:text-slate-300"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{invoice.id}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{invoice.period}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{invoice.description}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${invoiceStatusStyles[invoice.status]}`}
                  >
                    {invoice.status}
                  </span>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {invoice.amount}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{invoice.paymentMethod}</p>
                </div>
                <Button theme="white" className="px-4 py-2 text-xs">
                  Download PDF
                </Button>
              </div>
            ))}
          </div>
          <Button theme="secondary" className="mt-5 text-xs">
            Download all invoices (.zip)
          </Button>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-slate-100 p-2 text-slate-500 dark:bg-slate-800 dark:text-slate-200">
              <FiCreditCard />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Payment method
              </p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Platform-level billing
              </h2>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>
              Primary card: <span className="font-semibold">Visa •••• 4242</span> · expires 08/27
            </p>
            <p>Backup: Amex •••• 3005 · charges infrastructure add-ons.</p>
            <p>
              Owner charges include R2 storage, AI inference, transactional email, SMS credits, and SLA
              support retainers.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update this method to keep platform-level invoices current.
            </p>
          </div>
          <div className="mt-5 flex gap-3">
            <Button>Update card</Button>
            <Button theme="secondary">Add bank account</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Revenue operations
              </p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Campaigns & exports
              </h2>
            </div>
            <FiTrendingUp className="text-xl text-indigo-500 dark:text-slate-200" />
          </div>
          <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
            {revenueOpsTools.map((tool) => (
              <div
                key={tool.label}
                className="rounded-2xl border border-slate-100 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/70"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900 dark:text-white">{tool.label}</p>
                  {tool.action ? (
                    <Button theme="white" className="px-3 py-1 text-xs">
                      {tool.action}
                    </Button>
                  ) : null}
                </div>
                <p>{tool.detail}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{tool.helper}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Compliance
              </p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Security & billing controls
              </h2>
            </div>
            <FiShield className="text-xl text-indigo-500 dark:text-slate-200" />
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {complianceFields.map((field) => (
              <div
                key={field.label}
                className="rounded-2xl border border-slate-100 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/70"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  {field.label}
                </p>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {field.value}
                </p>
                {field.helper ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{field.helper}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-indigo-100 dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-2xl bg-slate-100 p-2 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <FiFileText />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Billing audit log
              </p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Track every change
              </h2>
            </div>
          </div>
          <Button theme="secondary" className="text-xs">
            Export log
          </Button>
        </div>
        <div className="mt-5 space-y-4">
          {billingAuditLog.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/70"
            >
              <span className="rounded-full bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
                <FiCheckCircle />
              </span>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{entry.action}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {entry.actor} · {entry.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
