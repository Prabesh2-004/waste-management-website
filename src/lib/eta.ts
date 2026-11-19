import type { LatLng, Stop } from "@/types/live";

/** Typical collection-truck speed on Kathmandu streets, including traffic. */
export const AVG_SPEED_KMH = 18;
/** Streets are longer than the straight line between two points. */
export const ROAD_FACTOR = 1.35;
/** Time spent loading at each stop. */
export const STOP_MINUTES = 6;

export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface Leg {
  stop: Stop;
  /** Road distance of this leg, km. */
  km: number;
  /** Minutes from now until the truck arrives at this stop. */
  arriveMin: number;
  arriveAt: Date;
}

export interface RouteEstimate {
  /** Remaining stops, in order. */
  legs: Leg[];
  /** From the current position to the first remaining stop. */
  toStartKm: number;
  toStartMin: number;
  /** Driving between the remaining stops (after the first). */
  routeKm: number;
  driveMin: number;
  /** Loading time at the remaining stops. */
  serviceMin: number;
  totalKm: number;
  totalMin: number;
  finishAt: Date;
  speedKmh: number;
  /** False when there is no position yet; times then start at the first stop. */
  fromPosition: boolean;
}

/** Speed to plan with: the default, nudged towards the truck's measured speed when it is moving. */
export function planningSpeed(measuredMs?: number | null): number {
  if (measuredMs == null || measuredMs < 1.5) return AVG_SPEED_KMH;
  const measured = Math.min(45, Math.max(6, measuredMs * 3.6));
  return Math.round((AVG_SPEED_KMH + measured) / 2);
}

/**
 * Estimate the time to drive from `from` to the first remaining stop and then
 * through every remaining stop, loading at each. Distances are straight lines
 * times ROAD_FACTOR; this is an estimate, not turn-by-turn routing.
 */
export function estimateRoute(stops: Stop[], from: LatLng | null, measuredSpeedMs?: number | null, now = new Date()): RouteEstimate {
  const remaining = stops.filter((s) => s.status === "Pending").sort((a, b) => a.seq - b.seq);
  const speedKmh = planningSpeed(measuredSpeedMs);
  const minutesFor = (km: number) => (km / speedKmh) * 60;
  const legs: Leg[] = [];
  let at: LatLng | null = from;
  let minutes = 0;
  let toStartKm = 0;
  let routeKm = 0;
  remaining.forEach((stop, i) => {
    const km = at ? distanceKm(at, stop) * ROAD_FACTOR : 0;
    if (i === 0) toStartKm = km;
    else routeKm += km;
    minutes += minutesFor(km);
    legs.push({ stop, km, arriveMin: minutes, arriveAt: new Date(now.getTime() + minutes * 60000) });
    minutes += STOP_MINUTES;
    at = stop;
  });
  const toStartMin = minutesFor(toStartKm);
  const driveMin = minutesFor(routeKm);
  const serviceMin = remaining.length * STOP_MINUTES;
  const totalMin = toStartMin + driveMin + serviceMin;
  return {
    legs,
    toStartKm,
    toStartMin,
    routeKm,
    driveMin,
    serviceMin,
    totalKm: toStartKm + routeKm,
    totalMin,
    finishAt: new Date(now.getTime() + totalMin * 60000),
    speedKmh,
    fromPosition: from !== null,
  };
}

export function formatMinutes(min: number): string {
  const m = Math.max(0, Math.round(min));
  if (m < 1) return "<1 min";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h} h ${m % 60} min` : `${h} h`;
}

export function formatKm(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function clock(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** "2 min ago" for an ISO time. */
export function ago(iso: string | null, now = Date.now()): string {
  if (!iso) return "never";
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s} s ago`;
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
}

export function isLive(iso: string | null, liveSeconds: number, now = Date.now()): boolean {
  return !!iso && now - new Date(iso).getTime() < liveSeconds * 1000;
}
