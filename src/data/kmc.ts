import { CalendarDays, ChartColumn, ClipboardList, FileText, Landmark, Megaphone, Truck } from "lucide-react";
import type { NavItem, PortalUser } from "@/lib/types";

export const KMC_USER: PortalUser = { name: "Roza Shrestha", role: "KMC Officer", initials: "RS" };

export const KMC_NAV: NavItem[] = [
  { href: "/kmc/dashboard", label: "Dashboard", icon: Landmark, title: "Waste Management Dashboard", subtitle: "Citywide waste management overview across 32 wards" },
  { href: "/kmc/vehicles", label: "Vehicle & Route Management", icon: Truck, title: "Vehicle & Route Management", subtitle: "Manage ward vehicle requests, official records and coordinate routes" },
  { href: "/kmc/collection", label: "Collection Management", icon: CalendarDays, title: "Collection Management", subtitle: "Monitor collection operations across all 32 wards and track exceptions" },
  { href: "/kmc/awareness", label: "Awareness Programs", icon: Megaphone, title: "Awareness Programs", subtitle: "Coordinate citywide campaigns and monitor participation" },
  { href: "/kmc/monitoring", label: "Ward Monitoring", icon: ChartColumn, title: "Ward Monitoring", subtitle: "Track ward performance and identify areas that need city-level support" },
  { href: "/kmc/updates", label: "Updates & Information", icon: FileText, title: "Updates & Information", subtitle: "Latest news, announcements, reports and important information" },
  { href: "/kmc/reports", label: "Reports & Complaints", icon: ClipboardList, title: "Reports & Complaints", subtitle: "Track and manage escalated, cross-ward and city-level complaints" },
];

/* ---------- Ward map ---------- */

export type WardMapState = "ok" | "partial" | "attention";

/** Label positions of the 32 wards; the map is a Voronoi split around these points. */
export const WARD_CENTERS: Record<number, [number, number]> = {
  16: [498, 359], 17: [546, 362], 18: [594, 358], 19: [658, 361], 10: [406, 407], 11: [458, 421], 12: [512, 424], 13: [573, 421],
  14: [628, 421], 15: [668, 442], 20: [719, 451], 9: [370, 460], 24: [513, 476], 25: [553, 489], 26: [595, 489], 27: [639, 497],
  22: [693, 506], 23: [738, 529], 8: [372, 506], 7: [441, 503], 28: [510, 538], 29: [563, 558], 30: [608, 541], 6: [397, 553],
  5: [435, 586], 4: [469, 575], 3: [398, 606], 1: [493, 622], 2: [540, 625], 21: [583, 603], 31: [660, 571], 32: [713, 578],
};

const PARTIAL_WARDS = [14, 29, 19, 31];
const ATTENTION_WARDS = [8, 22];

export function wardMapState(ward: number): WardMapState {
  if (ATTENTION_WARDS.includes(ward)) return "attention";
  if (PARTIAL_WARDS.includes(ward)) return "partial";
  return "ok";
}

/** Demo figures for the dashboard ward panel, derived from the ward number as in the prototype. */
export function wardSnapshot(ward: number) {
  const state = wardMapState(ward);
  return {
    status: state === "attention" ? "Critical" : state === "partial" ? "Delayed" : "On schedule",
    collected: `${(30 + ward * 0.8).toFixed(1)} tons`,
    coverage: state === "ok" ? "94%" : "81%",
    vehicles: (ward % 5) + 2,
    openIssues: state === "attention" ? 4 : state === "partial" ? 2 : 1,
  };
}

/* ---------- Dashboard ---------- */

export const DASHBOARD_ATTENTION = [
  { kind: "vehicle", title: "Vehicle registration request", detail: "Ward 12 · 2 vehicles", status: "Pending" },
  { kind: "schedule", title: "Multi-ward schedule change", detail: "Wards 8, 9, 10 · Festival", status: "Pending" },
  { kind: "complaint", title: "Escalated complaint", detail: "Ward 22 · 4 days", status: "High" },
  { kind: "vehicle", title: "Vehicle approval (replacement)", detail: "Ward 29", status: "Pending" },
] as const;

export const CITY_TARGETS = [
  { label: "Increase segregation at source", value: 58 },
  { label: "Improve recycling & recovery", value: 24 },
  { label: "Reduce landfill dependence", value: 15 },
];

export const RECENT_ACTIVITY = [
  { text: "Ward 12 vehicle request submitted", time: "10:24 AM" },
  { text: "Issue in Ward 22 escalated", time: "09:40 AM" },
  { text: "Schedule change (W8, W9, W10)", time: "Yesterday" },
  { text: "Ward 29 replacement request", time: "Yesterday" },
];

/* ---------- Vehicles ---------- */

export interface VehicleRequest {
  id: string;
  ward: string;
  area: string;
  vehicle: string;
  spec: string;
  submitted: string;
  status: string;
}

export const VEHICLE_REQUESTS: VehicleRequest[] = [
  { id: "VR-2026-041", ward: "Ward 12", area: "New Road", vehicle: "Compactor Truck", spec: "5 MT · Diesel", submitted: "Oct 22", status: "Under Review" },
  { id: "VR-2026-040", ward: "Ward 17", area: "Tinkune", vehicle: "Collection Truck", spec: "3 MT · Diesel", submitted: "Oct 21", status: "Pending Info" },
  { id: "VR-2026-039", ward: "Ward 5", area: "Balkumari", vehicle: "Van", spec: "1.5 MT · Electric", submitted: "Oct 20", status: "Under Review" },
  { id: "VR-2026-038", ward: "Ward 21", area: "Sankhamul", vehicle: "Collection Truck", spec: "5 MT · Diesel", submitted: "Oct 19", status: "Approved" },
  { id: "VR-2026-037", ward: "Ward 8", area: "Kalimati", vehicle: "Pickup Truck", spec: "1 MT · Diesel", submitted: "Oct 18", status: "Rejected" },
  { id: "VR-2026-036", ward: "Ward 3", area: "Chabahil", vehicle: "Compactor Truck", spec: "8 MT · Diesel", submitted: "Oct 17", status: "Returned" },
  { id: "VR-2026-035", ward: "Ward 27", area: "Gwarko", vehicle: "Van", spec: "1.5 MT · Electric", submitted: "Oct 16", status: "Pending Info" },
];

export const APPROVAL_REQUIREMENTS = [
  "Valid registration document",
  "Pollution control certificate",
  "Insurance (1 year minimum)",
  "Ward recommendation letter",
];

export const REQUEST_DOCUMENTS = ["Vehicle Registration.pdf", "Pollution Certificate.pdf", "Insurance Document.pdf"];

/* ---------- Collection ---------- */

export const WARD_COLLECTION = [
  { ward: "Ward 1", status: "Completed", progress: "40 / 40", waste: "42 t", vehicle: "B-1012" },
  { ward: "Ward 2", status: "In progress", progress: "38 / 40", waste: "36 t", vehicle: "B-1043" },
  { ward: "Ward 3", status: "Completed", progress: "36 / 36", waste: "38 t", vehicle: "B-1098" },
  { ward: "Ward 4", status: "Delayed", progress: "30 / 36", waste: "28 t", vehicle: "B-1105" },
  { ward: "Ward 5", status: "Completed", progress: "42 / 42", waste: "45 t", vehicle: "B-1120" },
  { ward: "Ward 6", status: "In progress", progress: "35 / 38", waste: "33 t", vehicle: "B-1136" },
];

export const COLLECTION_EXCEPTIONS = [
  { kind: "missed", title: "Missed collection", detail: "Ward 8 · 3 stops", priority: "High" },
  { kind: "delayed", title: "Delayed collection", detail: "Ward 17 · 5 stops", priority: "Medium" },
  { kind: "deviation", title: "Route deviation", detail: "Ward 21 · B-4032", priority: "Medium" },
  { kind: "offline", title: "Vehicle offline", detail: "Ward 27 · B-1187", priority: "High" },
  { kind: "none", title: "No collection reported", detail: "Ward 14", priority: "Low" },
] as const;

export const SCHEDULE_APPROVALS = [
  { wards: "Ward 12 + 13", change: "Change collection time" },
  { wards: "Ward 4 + 5", change: "Add extra collection" },
  { wards: "Ward 16 + 17", change: "Route adjustment" },
];

/* ---------- Awareness ---------- */

export interface Campaign {
  name: string;
  type: "Citywide" | "Ward";
  dates: string;
  wards: string;
  registered: number;
  capacity: number;
  status: string;
}

export const CAMPAIGNS: Campaign[] = [
  { name: "Clean Kathmandu Green Future", type: "Citywide", dates: "Nov 5 – 10", wards: "All 32", registered: 1240, capacity: 1500, status: "Upcoming" },
  { name: "Tree for a Greener City", type: "Citywide", dates: "Nov 18 – 20", wards: "All 32", registered: 980, capacity: 1200, status: "Upcoming" },
  { name: "Ward 17 Community Clean-up", type: "Ward", dates: "Oct 22 – 31", wards: "Ward 17", registered: 120, capacity: 150, status: "Ongoing" },
  { name: "Plastic Free Kathmandu", type: "Ward", dates: "Oct 22 – Nov 5", wards: "Ward 12", registered: 210, capacity: 300, status: "Ongoing" },
  { name: "E-Waste Collection Drive", type: "Citywide", dates: "Nov 1 – 15", wards: "All 32", registered: 620, capacity: 1000, status: "Upcoming" },
  { name: "Waste Segregation Training", type: "Ward", dates: "Oct 28 – Nov 10", wards: "Ward 25", registered: 85, capacity: 120, status: "Draft" },
];

/* ---------- Ward monitoring ---------- */

export interface WardPerformance {
  ward: string;
  area: string;
  collection: number;
  missed: number;
  waste: number;
  complaints: number;
  awareness: string;
  target: number;
  status: string;
}

export const WARD_PERFORMANCE: WardPerformance[] = [
  { ward: "Ward 1", area: "Boudha", collection: 98, missed: 1, waste: 42, complaints: 100, awareness: "156 / 200", target: 78, status: "On track" },
  { ward: "Ward 2", area: "Tinkune", collection: 95, missed: 2, waste: 38, complaints: 93, awareness: "120 / 150", target: 65, status: "On track" },
  { ward: "Ward 3", area: "Chabahil", collection: 88, missed: 5, waste: 31, complaints: 80, awareness: "98 / 150", target: 52, status: "Needs attention" },
  { ward: "Ward 4", area: "Gongabu", collection: 76, missed: 12, waste: 28, complaints: 60, awareness: "76 / 120", target: 41, status: "Critical" },
  { ward: "Ward 5", area: "Kalanki", collection: 93, missed: 3, waste: 35, complaints: 88, awareness: "110 / 150", target: 60, status: "On track" },
  { ward: "Ward 6", area: "Sukedhara", collection: 91, missed: 4, waste: 33, complaints: 75, awareness: "92 / 120", target: 58, status: "Needs attention" },
  { ward: "Ward 7", area: "Gwarko", collection: 89, missed: 6, waste: 30, complaints: 70, awareness: "85 / 120", target: 56, status: "Needs attention" },
  { ward: "Ward 9", area: "Chabahil", collection: 82, missed: 9, waste: 26, complaints: 65, awareness: "70 / 120", target: 45, status: "Critical" },
];

/* ---------- Updates ---------- */

export type UpdateCategory = "Announcement" | "Report" | "Notice" | "Event" | "Guideline";

export const LATEST_UPDATES: Array<{ title: string; date: string; category: UpdateCategory }> = [
  { title: "KMC launches citywide waste awareness campaign", date: "Oct 23", category: "Announcement" },
  { title: "Quarterly Waste Management Report (Q3 2026)", date: "Oct 20", category: "Report" },
  { title: "Temporary road closure – Thamel area", date: "Oct 18", category: "Notice" },
  { title: "Training for Ward Waste Management Teams", date: "Oct 15", category: "Event" },
  { title: "Guideline on E-waste Management", date: "Oct 12", category: "Guideline" },
];

export const UPCOMING_EVENTS = [
  { month: "Nov", day: "05", title: "Clean Kathmandu Green Future", scope: "Citywide" },
  { month: "Nov", day: "12", title: "Household Segregation Drive", scope: "Ward" },
  { month: "Nov", day: "18", title: "Tree Plantation Program", scope: "Citywide" },
];

export const QUICK_UPDATES = [
  { kind: "leaf", title: "Clean Kathmandu Green Future", status: "Upcoming" },
  { kind: "calendar", title: "Ward 12 – Schedule Update", status: "Notice" },
  { kind: "file", title: "KMC Annual Report 2026", status: "Report" },
  { kind: "recycle", title: "E-waste Collection Drive", status: "Announcement" },
  { kind: "users", title: "Community Training – Ward 8", status: "Event" },
] as const;

/* ---------- Complaints ---------- */

export interface Complaint {
  ref: string;
  location: string;
  category: string;
  priority: string;
  assignedTo: string;
  status: string;
  deadline: string;
}

export const COMPLAINTS: Complaint[] = [
  { ref: "CMP-1048", location: "Cross-ward (12 & 15)", category: "Illegal dumping", priority: "High", assignedTo: "Environment Dept.", status: "In Progress", deadline: "Oct 27" },
  { ref: "CMP-1047", location: "Ward 17", category: "Missed collection", priority: "Medium", assignedTo: "Waste Management", status: "Pending Info", deadline: "Oct 26" },
  { ref: "CMP-1046", location: "Ward 8", category: "Overflowing bin", priority: "High", assignedTo: "Field Operations", status: "Escalated", deadline: "Oct 25" },
  { ref: "CMP-1045", location: "Ward 4", category: "Recycling facility issue", priority: "Medium", assignedTo: "Recycling Unit", status: "In Progress", deadline: "Oct 29" },
  { ref: "CMP-1044", location: "Ward 21", category: "Air pollution (burning)", priority: "High", assignedTo: "Environment Dept.", status: "New", deadline: "Nov 2" },
  { ref: "CMP-1043", location: "Cross-ward (3 & 11)", category: "Blocked road", priority: "High", assignedTo: "Traffic Management", status: "In Progress", deadline: "Oct 25" },
  { ref: "CMP-1042", location: "Ward 27", category: "E-waste disposal", priority: "Medium", assignedTo: "Recycling Unit", status: "Resolved", deadline: "Oct 20" },
  { ref: "CMP-1041", location: "Ward 16", category: "Truck noise", priority: "Low", assignedTo: "Waste Management", status: "Resolved", deadline: "Oct 18" },
];
