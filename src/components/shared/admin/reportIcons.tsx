import { AlertTriangle, CalendarClock, Route as RouteIcon, Trash2, Truck } from "lucide-react";
import { cn } from "@/lib/cn";

const ICONS: Record<string, typeof Truck> = {
  Collection: Trash2,
  Vehicle: Truck,
  Route: RouteIcon,
  Schedule: CalendarClock,
  Waste: Trash2,
  Dumping: AlertTriangle,
};

const STATUS_BG: Record<string, string> = {
  Pending: "bg-warn-soft text-warn",
  "In Progress": "bg-info-soft text-info",
  Resolved: "bg-ok-soft text-ok",
};

/** Round icon for a report, coloured by status. */
export function ReportIcon({ category, status, size = 18 }: { category: string; status: string; size?: number }) {
  const Icon = ICONS[category] ?? AlertTriangle;
  return (
    <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", STATUS_BG[status] ?? "bg-ac-soft text-ac")}>
      <Icon size={size} />
    </span>
  );
}

/** Lower-case text search across a report's visible fields. */
export function matches(query: string, ...fields: Array<string | number | null | undefined>): boolean {
  const q = query.trim().toLowerCase();
  return !q || fields.some((f) => f != null && String(f).toLowerCase().includes(q));
}
