import { CalendarDays, ChartColumn, FileText, House, Megaphone, Truck } from "lucide-react";
import { exceptionReasonFor, type RouteMeta, type Stop, type StopStatus } from "@/lib/collection";
import type { NavItem, PortalUser } from "@/lib/types";
import { DEMO_DATE } from "./shared";

export const WARD_NAME = "Ward 17";
export const WARD_USER: PortalUser = { name: "Roza Shrestha", role: "Ward Official", initials: "RS" };

export const WARD_NAV: NavItem[] = [
  { href: "/ward/dashboard", label: "Dashboard", icon: House, title: "Ward Dashboard", subtitle: "Good morning, Roza! 👋", note: "Ward 17 · Tuesday, 24 October 2026" },
  { href: "/ward/vehicles", label: "Vehicles & Routes", icon: Truck, title: "Vehicles & Routes", subtitle: "Manage vehicles, track approvals and plan local routes" },
  { href: "/ward/collection", label: "Collection Management", icon: CalendarDays, title: "Collection Management", subtitle: "Track collection progress, monitor routes and manage exceptions" },
  { href: "/ward/awareness", label: "Awareness Programs", icon: Megaphone, title: "Awareness Programs", subtitle: "Build a cleaner, healthier and more sustainable Ward 17" },
  { href: "/ward/performance", label: "Ward Updates & Performance", icon: ChartColumn, title: "Ward Updates & Performance", subtitle: "Share updates, keep the community informed and track your ward’s progress" },
  { href: "/ward/reports", label: "Reports & Complaints", icon: FileText, title: "Reports & Complaints", subtitle: "Review open complaints and download ward reports" },
];

/* ---------- Collection (deterministic demo data shared by Dashboard and Collection) ---------- */

export const ROUTES: RouteMeta[] = [
  { routeId: "R-A", name: "Route A · North", vehicle: "Truck 01", driver: "Ram K.", start: "07:00", end: "10:00" },
  { routeId: "R-B", name: "Route B · East", vehicle: "Truck 04", driver: "Sita M.", start: "08:00", end: "11:00" },
  { routeId: "R-C", name: "Route C · Chhetrapati", vehicle: "Truck 02", driver: "Hari B.", start: "07:00", end: "10:00" },
  { routeId: "R-D", name: "Route D · Kalanki", vehicle: "Truck 03", driver: "Nabin T.", start: "09:00", end: "12:00" },
  { routeId: "R-E", name: "Route E · Thamel", vehicle: "Truck 05", driver: "Sunita R.", start: "07:00", end: "10:00" },
];

const ROUTE_STOP_STATUSES: Record<string, StopStatus[]> = {
  "R-A": ["Completed", "Completed", "Completed", "Completed"],
  "R-B": ["Completed", "Completed", "In progress", "In progress"],
  "R-C": ["Delayed", "Delayed", "Delayed", "Missed"],
  "R-D": ["Completed", "Completed", "Delayed", "Delayed"],
  "R-E": ["Completed", "Completed", "Completed", "Completed"],
};

export const INITIAL_STOPS: Stop[] = ROUTES.flatMap((route) =>
  ROUTE_STOP_STATUSES[route.routeId].map((status, i): Stop => {
    const hour = 7 + ((i + route.routeId.charCodeAt(2)) % 4);
    const driverUpdate = status === "Completed" ? "09:20" : status === "In progress" ? "09:50" : null;
    return {
      stopId: `${route.routeId}-S${i + 1}`,
      routeId: route.routeId,
      location: `${route.name.split("· ")[1]} · Stop ${i + 1}`,
      scheduledTime: `${String(hour).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
      order: i + 1,
      wasteType: i % 2 ? "Inorganic" : "Organic",
      status,
      updatedAt: driverUpdate && `${DEMO_DATE}T${driverUpdate}:00`,
      exceptionReason: exceptionReasonFor(status, false),
      lastModifiedBy: driverUpdate ? "Driver" : "Demo rule",
    };
  })
);

export const COLLECTION_EXCEPTIONS = [
  { tone: "danger", type: "Missed collection", where: "Ward 17 – Tinkune (Route B)", details: "Stop 3, 4 and 5 not collected", since: "8:30 AM", action: "View & resolve" },
  { tone: "warn", type: "Delayed collection", where: "Ward 17 – Chhetrapati (Route C)", details: "Driver has not started route", since: "7:20 AM", action: "Contact driver" },
  { tone: "info", type: "Vehicle issue", where: "Ward 17 – Kalanki (Route D)", details: "Truck 03 reported breakdown", since: "9:15 AM", action: "View details" },
] as const;

/* ---------- Dashboard ---------- */

export const ATTENTION_ITEMS = [
  { kind: "missed", tone: "danger", title: "Missed collection", where: "Tengal", next: "Follow up with driver", href: "/ward/collection" },
  { kind: "delayed", tone: "warn", title: "Delayed collection", where: "Kalanki · Route D", next: "Check route / contact driver", href: "/ward/collection" },
  { kind: "complaint", tone: "danger", title: "Overdue complaint", where: "Ref #C-0321 · Chhetrapati", next: "Update status", href: "/ward/reports" },
  { kind: "vehicle", tone: "info", title: "Vehicle request awaiting KMC", where: "Ref #VR-0243 · Ward 17", next: "Submitted 2 days ago", href: "/ward/vehicles" },
  { kind: "schedule", tone: "purple", title: "Multi-ward schedule change", where: "Affects Ward 17, 18, 19", next: "Pending KMC approval", href: "/ward/collection" },
] as const;

export const UPCOMING_ACTIVITIES = [
  { kind: "program", tone: "success", title: "Community clean-up drive", when: "Ward 17 · Oct 26, 9:00 AM", status: "Scheduled" },
  { kind: "schedule", tone: "info", title: "Collection timing change", when: "Tengal · Oct 28, 7:00 AM", status: "Pending KMC" },
  { kind: "file", tone: "purple", title: "Awareness program", when: "Ward 17 · Nov 2, 10:00 AM", status: "Confirmed" },
] as const;

/* ---------- Vehicles & routes ---------- */

export interface WardVehicle {
  number: string;
  type: string;
  capacity: string;
  driver: string;
  status: "In service" | "Maintenance" | "Available";
  assignment: string;
}

export const VEHICLES: WardVehicle[] = [
  { number: "Ba 2 Kha 3128", type: "Compactor Truck", capacity: "8 tons", driver: "Ram K.", status: "In service", assignment: "Route A · North" },
  { number: "Ba 2 Kha 4789", type: "Collection Truck", capacity: "5 tons", driver: "Sita M.", status: "In service", assignment: "Route B · Tengal" },
  { number: "Ba 3 Kha 2150", type: "Collection Truck", capacity: "5 tons", driver: "Hari B.", status: "In service", assignment: "Route C · Chhetrapati" },
  { number: "Ba 3 Kha 6687", type: "Collection Truck", capacity: "5 tons", driver: "Nabin T.", status: "Maintenance", assignment: "-" },
  { number: "Ba 1 Kha 9271", type: "Downtown Truck", capacity: "3 tons", driver: "Sunita L.", status: "Available", assignment: "-" },
];

export const TOTAL_VEHICLES = 10;

export const ROUTE_PLANS = [
  { route: "Route A", area: "North (Tengal, Chundevi)", vehicle: "Ba 2 Kha 3128", driver: "Ram K.", schedule: "7:00 – 10:00 AM", status: "On track" },
  { route: "Route B", area: "East (Kalimati, Gaushala)", vehicle: "Ba 2 Kha 4789", driver: "Sita M.", schedule: "8:00 – 11:00 AM", status: "In progress" },
  { route: "Route C", area: "Chhetrapati (Bhimsen, Tinkune)", vehicle: "Ba 3 Kha 2150", driver: "Hari B.", schedule: "7:00 – 10:00 AM", status: "Delayed" },
  { route: "Route D", area: "West (Thamel, Basantapur)", vehicle: "Ba 3 Kha 6687", driver: "Nabin T.", schedule: "9:00 – 12:00 PM", status: "Not started" },
];

export const VEHICLE_REQUESTS = [
  { ref: "VR-0243", vehicle: "Compactor Truck", capacity: "8 tons", reason: "Replace Ba 3 Kha 6687 during maintenance", submitted: "Oct 22", status: "Pending KMC" },
  { ref: "VR-0239", vehicle: "Collection Truck", capacity: "5 tons", reason: "Extra capacity for Route C", submitted: "Oct 19", status: "Pending KMC" },
  { ref: "VR-0236", vehicle: "Electric Van", capacity: "1.5 tons", reason: "Narrow lanes in Thamel", submitted: "Oct 15", status: "Submitted" },
];

/* ---------- Awareness ---------- */

export const PROGRAMS = [
  { title: "Waste Segregation Community Workshop", when: "Thu, Oct 30 · 10:00 AM – 12:00 PM · Shree Mangal Basic School", status: "Registration open", registered: "48 / 60", attended: 32 },
  { title: "Door-to-Door Waste Segregation Campaign", when: "Sat, Nov 2 · 9:00 AM – 12:00 PM · Tengal Area", status: "Registration open", registered: "25 / 50", attended: 18 },
  { title: "Composting Workshop for Households", when: "Tue, Nov 5 · 2:00 PM – 4:00 PM · Community Center, Kalanki", status: "Upcoming", registered: "0 / 40", attended: 0 },
  { title: "Clean City, Green Future – Youth Rally", when: "Fri, Nov 8 · 8:00 AM – 11:00 AM · Ratna Park", status: "Upcoming", registered: "12 / 100", attended: 0 },
  { title: "Plastic Reduction Awareness Program", when: "Sun, Nov 10 · 10:00 AM – 12:00 PM · Bhimsen Tole", status: "Draft", registered: "0 / 0", attended: 0 },
];

export const ATTENDANCE = [
  { program: "Waste Segregation Community Workshop", date: "Oct 30", registered: 48, attended: 32, rate: "67%", status: "Ongoing" },
  { program: "Door-to-Door Waste Segregation Campaign", date: "Nov 2", registered: 25, attended: 18, rate: "72%", status: "Ongoing" },
  { program: "Composting Workshop for Households", date: "Nov 5", registered: 0, attended: 0, rate: "-", status: "Upcoming" },
];

export const PARTICIPANTS = [
  { label: "General public", value: 198, share: 58, color: "#0f8a5a" },
  { label: "School/Students", value: 76, share: 22, color: "#3b82e6" },
  { label: "Community groups", value: 42, share: 12, color: "#f0b429" },
  { label: "Others", value: 26, share: 8, color: "#cfd8d4" },
];

export const AWARENESS_ACTIVITY = [
  { title: "New registration for ‘Composting Workshop’", detail: "12 people registered", time: "2h ago" },
  { title: "Attendance updated for ‘Waste Segregation Workshop’", detail: "+5 attendees", time: "4h ago" },
  { title: "Program status changed to ‘Completed’", detail: "Clean City, Green Future – Youth Rally", time: "1d ago" },
  { title: "New program created", detail: "Plastic Reduction Awareness Program", time: "1d ago" },
];

/* ---------- Performance & updates ---------- */

/** Last 7 days, used by the collection performance chart. */
export const WEEKLY_COLLECTION = [
  { day: "Oct 18", total: 48, recyclables: 22, coverage: 53 },
  { day: "Oct 19", total: 51, recyclables: 24, coverage: 59 },
  { day: "Oct 20", total: 46, recyclables: 26, coverage: 58 },
  { day: "Oct 21", total: 52, recyclables: 22, coverage: 64 },
  { day: "Oct 22", total: 50, recyclables: 24, coverage: 62 },
  { day: "Oct 23", total: 55, recyclables: 26, coverage: 67 },
  { day: "Oct 24", total: 54, recyclables: 22, coverage: 65 },
];

export const MILESTONES = [
  { title: "Reduce landfill waste by 20%", target: "Target: 20% reduction · By Dec 2026", progress: 15, label: "15%" },
  { title: "Increase recycling rate to 30%", target: "Target: 30% · By Dec 2026", progress: 18, label: "18%" },
  { title: "Conduct 12 community events", target: "Target: 12 · By Dec 2026", progress: 67, label: "8/12" },
  { title: "100% vehicle compliance", target: "Target: 100% · By Dec 2026", progress: 83, label: "83%" },
];

export const PUBLIC_NOTICES = [
  { title: "Collection schedule change – Ward 17", body: "Waste collection will be 8:00 AM – 12:00 PM on Oct 26.", date: "Oct 24" },
  { title: "Waste segregation reminder", body: "Separate organic and inorganic waste at source.", date: "Oct 22" },
  { title: "Community composting workshop", body: "Join us Nov 5 at Community Center, Kalanki.", date: "Oct 20" },
];

export const KMC_UPDATES = [
  { title: "Updated collection guidelines", body: "New sorting and reporting format for all wards.", date: "Oct 23" },
  { title: "Vehicle compliance reminder", body: "All vehicles must have valid permits and insurance.", date: "Oct 20" },
  { title: "Monthly performance review meeting", body: "Ward representatives are requested to attend.", date: "Oct 18" },
];

export const PERFORMANCE_ACTIVITY = [
  { title: "New public notice published", detail: "Oct 24 · Collection schedule change" },
  { title: "KMC update received", detail: "Oct 23 · New recycling guidelines" },
  { title: "Milestone progress updated", detail: "Oct 22 · Recycling rate: 18%" },
  { title: "Community event completed", detail: "Oct 20 · Clean City – Youth Rally" },
];

/* ---------- Complaints ---------- */

export const OPEN_COMPLAINTS = [
  { ref: "#C-0321", location: "Chhetrapati", issue: "Missed pickup – 3 days", status: "Delayed" },
  { ref: "#C-0318", location: "Tengal", issue: "Overflowing bin", status: "In progress" },
  { ref: "#C-0312", location: "Thamel", issue: "Late collection", status: "In progress" },
  { ref: "#C-0305", location: "Kalanki", issue: "Illegal dumping", status: "Delayed" },
];

export const OPEN_COMPLAINT_COUNT = 12;
