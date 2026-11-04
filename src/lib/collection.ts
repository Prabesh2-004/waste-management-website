import { STATUS_COLORS } from "./status";

export const STOP_STATUSES = ["Scheduled", "In progress", "Completed", "Delayed", "Missed", "Cancelled"] as const;
export type StopStatus = (typeof STOP_STATUSES)[number];
export type RouteStatus = Exclude<StopStatus, "Cancelled">;

export interface RouteMeta {
  routeId: string;
  name: string;
  vehicle: string;
  driver: string;
  start: string;
  end: string;
}

export interface Stop {
  stopId: string;
  routeId: string;
  location: string;
  scheduledTime: string;
  order: number;
  wasteType: "Organic" | "Inorganic";
  status: StopStatus;
  /** Last driver update or completion time (ISO), when known. */
  updatedAt: string | null;
  exceptionReason: string | null;
  lastModifiedBy: string;
}

export interface RouteSummary extends RouteMeta {
  total: number;
  done: number;
  status: RouteStatus;
  color: string;
}

export function exceptionReasonFor(status: StopStatus, manual: boolean): string | null {
  if (status === "Delayed") return manual ? "Manually marked delayed (30-minute rule)" : "No completion confirmation within 30-minute threshold";
  if (status === "Missed") return manual ? "Ward-confirmed missed after service window ended" : "Service window ended without completion confirmation";
  return null;
}

/** Cancelled stops are excluded from every count. */
const eligible = (stops: Stop[]) => stops.filter((s) => s.status !== "Cancelled");

export function stopMetrics(stops: Stop[]) {
  const list = eligible(stops);
  const count = (status: StopStatus) => list.filter((s) => s.status === status).length;
  const total = list.length;
  const completed = count("Completed");
  return {
    total,
    completed,
    progress: count("In progress"),
    delayed: count("Delayed"),
    missed: count("Missed"),
    completionRate: total ? Math.round((completed / total) * 100) : 0,
  };
}

/** A route takes the most urgent status among its stops. */
export function summarizeRoutes(routes: RouteMeta[], stops: Stop[]): RouteSummary[] {
  return routes.map((route) => {
    const own = eligible(stops).filter((s) => s.routeId === route.routeId);
    const statuses = own.map((s) => s.status);
    const done = statuses.filter((s) => s === "Completed").length;
    const status: RouteStatus =
      done === own.length
        ? "Completed"
        : statuses.includes("Missed")
          ? "Missed"
          : statuses.includes("Delayed")
            ? "Delayed"
            : statuses.includes("In progress")
              ? "In progress"
              : "Scheduled";
    return { ...route, total: own.length, done, status, color: STATUS_COLORS[status] };
  });
}
