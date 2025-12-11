import type { ReactNode } from "react";

export type BillingCycle = "monthly" | "yearly";

export type PlanHighlight = {
  text: string;
  available: boolean;
};

export type PlanOption = {
  id: string;
  name: string;
  description: string;
  badge?: string;
  price: Record<BillingCycle, number>;
  displayPrice?: Record<BillingCycle, string>;
  bestFor: string;
  limits: string[];
  features: string[];
  savings: number;
  highlights: PlanHighlight[];
};

export type AddOnOption = {
  id: string;
  label: string;
  detail: string;
  price: Record<BillingCycle, number>;
};

export type Assurance = {
  title: string;
  detail: string;
  icon: ReactNode;
};

export type PlanComparisonRow = {
  feature: string;
  free: string;
  pro: string;
  enterprise: string;
};

export const planOptions: PlanOption[] = [
  {
    id: "free",
    name: "Free Tier",
    description: "Launch with essentials for small HR teams trying out SmartHR.",
    badge: "Starter",
    price: { monthly: 0, yearly: 0 },
    bestFor: "Early teams under 5 employees",
    limits: ["5 employees", "1 HR admin", "2 GB storage"],
    features: [
      "Basic leave requests & approvals",
      "Employee contact directory",
      "Daily attendance analytics",
    ],
    savings: 0,
    highlights: [
      { text: "Manage up to 5 employees", available: true },
      { text: "1 HR admin seat", available: true },
      { text: "Automation & lateness detection", available: false },
      { text: "Project management workspace", available: false },
      { text: "Priority support & SLAs", available: false },
    ],
  },
  {
    id: "pro",
    name: "Pro Plan",
    description: "Scale confidently with automation, analytics, and invoicing.",
    badge: "Most popular",
    price: { monthly: 4900, yearly: 49000 },
    bestFor: "Growing companies that need automation",
    limits: ["Unlimited employees", "Unlimited HR admins", "50 GB storage"],
    features: [
      "Full leave lifecycle + lateness detection",
      "Project management + payroll-ready invoices",
      "Daily & monthly reporting with real-time chat",
    ],
    savings: 9800,
    highlights: [
      { text: "Unlimited employees & HR admins", available: true },
      { text: "Automation + lateness detection", available: true },
      { text: "Project management + invoices", available: true },
      { text: "Daily & monthly analytics", available: true },
      { text: "SSO & advanced integrations", available: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    description: "Custom governance, integrations, and support for complex orgs.",
    price: { monthly: 0, yearly: 0 },
    displayPrice: {
      monthly: "Custom (৳ negotiable)",
      yearly: "Custom (৳ negotiable)",
    },
    bestFor: "Enterprises needing compliance controls",
    limits: ["Unlimited employees", "Custom RBAC & hierarchy", "Unlimited storage"],
    features: [
      "Enterprise leave policies & custom workflows",
      "Portfolio reporting + export automation",
      "SSO, webhooks, SLA & dedicated success manager",
    ],
    savings: 0,
    highlights: [
      { text: "Unlimited workforce & storage", available: true },
      { text: "Custom RBAC & compliance tracking", available: true },
      { text: "Portfolio reporting & exports", available: true },
      { text: "SSO (SAML/OAuth) & webhooks", available: true },
      { text: "Dedicated success manager", available: true },
    ],
  },
];

export const addOnOptions: AddOnOption[] = [
  {
    id: "ai",
    label: "AI Copilot bundle",
    detail: "Explain payroll changes & draft compliance summaries.",
    price: { monthly: 129, yearly: 1290 },
  },
  {
    id: "security",
    label: "Advanced compliance suite",
    detail: "Automated access reviews, anomaly detection, exportable audit trails.",
    price: { monthly: 189, yearly: 1890 },
  },
  {
    id: "support",
    label: "24/7 Premier support",
    detail: "Phone + Slack escalation with 30 min response.",
    price: { monthly: 219, yearly: 2190 },
  },
];

export const planComparisonRows: PlanComparisonRow[] = [
  { feature: "Price", free: "৳0", pro: "৳4,900 / month", enterprise: "Custom (৳ negotiable)" },
  { feature: "Employees limit", free: "5 employees", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "Admins / HR roles", free: "1 admin", pro: "Unlimited HR admins", enterprise: "Custom RBAC, hierarchy" },
  { feature: "Attendance automation", free: "Basic", pro: "Full automation + lateness detection", enterprise: "Enterprise policies + compliance tracking" },
  { feature: "Leave & PTO management", free: "Basic leave requests", pro: "Full leave lifecycle", enterprise: "Advanced leave policies + custom workflows" },
  { feature: "Employee directory", free: "Basic contact info", pro: "Full records", enterprise: "Custom employer fields & API ingestion" },
  { feature: "Project management", free: "—", pro: "Included", enterprise: "Portfolio-level, reporting & audit trails" },
  { feature: "Payroll-ready invoices", free: "—", pro: "Included", enterprise: "Enterprise invoice flows + signed links" },
  { feature: "Reports & analytics", free: "Daily only", pro: "Daily + Monthly", enterprise: "Custom reports + export automation" },
  { feature: "Storage", free: "2 GB", pro: "50 GB", enterprise: "Unlimited" },
  { feature: "Messaging & notifications", free: "System inbox only", pro: "Real-time chat", enterprise: "Unlimited retention, priority routing" },
  { feature: "Integrations", free: "—", pro: "Basic integrations", enterprise: "SSO (SAML/OAuth), webhooks" },
  { feature: "Support", free: "Email support", pro: "Priority support", enterprise: "SLA + dedicated success manager" },
  { feature: "Customization", free: "—", pro: "Theme settings", enterprise: "Full white-labeling" },
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  })
    .format(value)
    .replace("BDT", "৳");

export const PLAN_RIBBON_GRADIENTS: Record<string, string> = {
  free: "from-sky-400 to-indigo-500",
  pro: "from-fuchsia-500 to-purple-500",
  enterprise: "from-indigo-500 to-rose-500",
};
