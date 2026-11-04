export type Tone = "success" | "warn" | "danger" | "info" | "purple" | "neutral";

/** Badge colours per status label, as used by the KMC prototype. */
const KMC_TONES: Record<string, Tone> = {
  Approved: "success",
  Resolved: "success",
  "On track": "success",
  "On schedule": "success",
  Completed: "success",
  Low: "success",
  New: "success",
  Guideline: "success",
  Report: "success",
  Upcoming: "info",
  "Pending Info": "info",
  "In Progress": "info",
  "In progress": "info",
  Announcement: "info",
  Ongoing: "warn",
  "Under Review": "warn",
  Pending: "warn",
  "Needs attention": "warn",
  Medium: "warn",
  Delayed: "warn",
  Rejected: "danger",
  Critical: "danger",
  High: "danger",
  Notice: "danger",
  Escalated: "purple",
  Returned: "purple",
  Draft: "purple",
  Event: "purple",
};

/** Badge colours per status label, as used by the ward prototype. */
const WARD_TONES: Record<string, Tone> = {
  Completed: "success",
  "On track": "success",
  "In service": "success",
  Ongoing: "success",
  "Registration open": "success",
  Scheduled: "success",
  Confirmed: "success",
  Public: "success",
  "In progress": "info",
  Available: "info",
  Upcoming: "info",
  Submitted: "info",
  "KMC Only": "info",
  Delayed: "warn",
  Maintenance: "warn",
  "Pending KMC": "warn",
  Missed: "danger",
  Overdue: "danger",
  "Not started": "neutral",
  Draft: "neutral",
  Cancelled: "neutral",
};

export const kmcTone = (status: string): Tone => KMC_TONES[status] ?? "success";
export const wardTone = (status: string): Tone => WARD_TONES[status] ?? "success";

/** Map / chart colours for collection statuses. */
export const STATUS_COLORS = {
  Completed: "#0f8a5a",
  "In progress": "#3b82e6",
  Delayed: "#f0b429",
  Missed: "#e5484d",
  Scheduled: "#8b9b94",
  Cancelled: "#8b9b94",
} as const;
