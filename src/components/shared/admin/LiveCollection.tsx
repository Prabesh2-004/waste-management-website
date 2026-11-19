"use client";

import { useMemo, useState } from "react";
import { Clock, MapPin, Radio, Truck } from "lucide-react";
import { Box } from "@/components/ui/Box";
import { ProgressBar } from "@/components/ui/Bars";
import { Pill } from "@/components/ui/Status";
import { LiveMap, MapLegend } from "@/components/map/LiveMap";
import { ago, clock, estimateRoute, formatMinutes, isLive } from "@/lib/eta";
import { useLive } from "@/lib/useLive";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/format";
import type { Tone } from "@/types";
import type { LiveVehicle, RouteDetail } from "@/types/live";

type Call = <T = unknown>(path: string) => Promise<T>;

/** Same colours as the map lines (components/map/LiveMap ROUTE_COLOURS). */
export const ROUTE_TONES: Record<string, Tone> = {
  Completed: "G",
  "In Progress": "B",
  Delayed: "A",
  Incomplete: "R",
  Upcoming: "",
};

const ORDER: Record<string, number> = { "In Progress": 0, Delayed: 1, Incomplete: 2, Upcoming: 3, Completed: 4 };

interface LiveCollectionProps {
  call: Call;
  /** One ward, or null for the whole city. */
  ward: number | null;
  title?: string;
  /** Ward markers on the city-wide map. */
  showCentres?: boolean;
  /** "Details" link on each route (e.g. open the route drawer). */
  onOpenRoute?: (route: RouteDetail) => void;
  mapClassName?: string;
  /** Only list these statuses (the map still shows everything). */
  listFilter?: (route: RouteDetail) => boolean;
  className?: string;
}

/** GPS state of a truck: live, last seen, or no fix yet. */
export function TruckGps({ vehicle, liveSeconds }: { vehicle?: LiveVehicle; liveSeconds: number }) {
  const at = vehicle?.location?.at ?? null;
  if (!vehicle?.location) return <span className="text-xs text-mut">No GPS yet</span>;
  if (isLive(at, liveSeconds))
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-ok">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ok" /> Live GPS
      </span>
    );
  return <span className="text-xs text-mut">Last seen {ago(at)}</span>;
}

export function routeEta(route: RouteDetail, vehicle?: LiveVehicle) {
  if (route.status !== "In Progress" && route.status !== "Delayed") return null;
  const pending = route.stops.filter((s) => s.status === "Pending");
  if (pending.length === 0) return null;
  const loc = vehicle?.location ?? null;
  return estimateRoute(route.stops, loc, loc?.speed ?? null);
}

export function LiveCollection({
  call,
  ward,
  title = "Live collection",
  showCentres,
  onOpenRoute,
  mapClassName,
  listFilter,
  className,
}: LiveCollectionProps) {
  const { data, error } = useLive(call, ward);
  const [focus, setFocus] = useState<number | null>(null);
  const vehicles = useMemo(() => new Map((data?.vehicles ?? []).map((v) => [v.id, v])), [data]);
  const liveSeconds = data?.liveSeconds ?? 120;
  const anyLive = (data?.vehicles ?? []).some((v) => isLive(v.location?.at ?? null, liveSeconds));
  const routes = useMemo(
    () => [...(data?.routes ?? [])].filter(listFilter ?? (() => true)).sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9) || a.ward - b.ward || a.n - b.n),
    [data, listFilter]
  );

  return (
    <Box
      className={className}
      title={title}
      icon={<MapPin size={18} />}
      action={
        data ? (
          <Pill tone={anyLive ? "G" : ""}>
            <Radio size={12} className="mr-1" />
            {anyLive ? "Live GPS" : "Last known positions"}
          </Pill>
        ) : undefined
      }
    >
      {error && !data && <p className="m-0 text-sm text-bad">Live map unavailable: {error}</p>}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          <LiveMap
            routes={data?.routes ?? []}
            vehicles={data?.vehicles ?? []}
            centres={showCentres ? data?.centres : undefined}
            liveSeconds={liveSeconds}
            focusRouteId={focus}
            onRouteClick={(r) => setFocus((f) => (f === r.id ? null : r.id))}
            className={cn("h-[300px] sm:h-[380px]", mapClassName)}
          />
          <MapLegend className="mt-2.5" />
        </div>
        <div className="max-h-[420px] overflow-y-auto pr-1">
          {data && routes.length === 0 && <p className="m-0 text-sm text-mut">No routes with a vehicle.</p>}
          {!data && !error && <p className="m-0 text-sm text-mut">Loading live map…</p>}
          {routes.map((r) => {
            const v = vehicles.get(r.vehicle);
            const done = r.stops.filter((s) => s.status !== "Pending").length;
            const eta = routeEta(r, v);
            const active = focus === r.id;
            return (
              <div
                key={r.id}
                className={cn("mb-2 rounded-xl border p-3 transition-colors", active ? "border-ac bg-ac-soft" : "border-line hover:border-ac")}
              >
                <button type="button" className="block w-full text-left" onClick={() => setFocus(active ? null : r.id)} aria-pressed={active}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <b className="block truncate text-sm">
                        {ward == null ? `Ward ${r.ward} · ` : ""}Route {r.n} · {r.area}
                      </b>
                      <span className="flex items-center gap-1 truncate text-xs text-mut">
                        <Truck size={12} /> {r.vehicle} · {v?.drv || "No driver"}
                      </span>
                    </div>
                    <Pill tone={ROUTE_TONES[r.status] ?? ""}>{r.status}</Pill>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-mut">
                    <ProgressBar className="flex-1" percent={r.stops.length ? (done / r.stops.length) * 100 : 0} />
                    {done}/{r.stops.length} stops
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <TruckGps vehicle={v} liveSeconds={liveSeconds} />
                    {eta ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-ink">
                        <Clock size={12} /> Finish ≈ {clock(eta.finishAt)} ({formatMinutes(eta.totalMin)} left)
                      </span>
                    ) : (
                      <span className="text-xs text-mut">
                        {r.status === "Completed" ? `${r.kg} kg collected` : `Starts ${formatTime(r.time)}`}
                      </span>
                    )}
                  </div>
                </button>
                {onOpenRoute && (
                  <button type="button" onClick={() => onOpenRoute(r)} className="mt-1.5 text-xs font-semibold text-ac hover:underline">
                    Route details →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Box>
  );
}
