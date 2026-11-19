"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlarmClock, ChevronRight, Clock, Gauge, Leaf, MapPin, Navigation, Play, Route as RouteIcon, Scale, Truck } from "lucide-react";
import { SectionTitle, TapCard } from "@/components/mobile/MobileShell";
import { Ring } from "@/components/ui/Bars";
import { Pill } from "@/components/ui/Status";
import { useDriver } from "@/context/DriverContext";
import { clock, estimateRoute, formatKm, formatMinutes } from "@/lib/eta";
import { formatTime } from "@/lib/format";
import { atTime } from "@/lib/schedule";
import type { LatLng, RouteDetail } from "@/types/live";

export const ROUTE_TONE: Record<string, "G" | "B" | "A" | "R" | ""> = {
  Completed: "G",
  "In Progress": "B",
  Delayed: "A",
  Incomplete: "R",
  Upcoming: "",
};

/** Where the truck is: this phone's GPS, else the last position the server has. */
export function usePosition(route: RouteDetail | null): (LatLng & { speed?: number | null }) | null {
  const { fix, state } = useDriver();
  if (fix) return fix;
  const v = state?.vehicles.find((x) => x.id === route?.vehicle);
  return v?.location ?? null;
}

function Info({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 gap-2.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ac-soft text-ac">{icon}</span>
      <div className="min-w-0">
        <span className="block text-xs text-mut">{label}</span>
        <b className="block truncate text-[15px] leading-tight">{value}</b>
        {sub && <span className="block truncate text-xs text-mut">{sub}</span>}
      </div>
    </div>
  );
}

export function DriverHome() {
  const { state, current, start, fix, travelledKm, gpsStatus } = useDriver();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const pos = usePosition(current);
  if (!state) return null;

  if (!current) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-6 text-center shadow-card">
        <Truck size={40} className="mx-auto mb-3 text-mut" />
        <b className="block text-lg">No assignment today</b>
        <p className="mb-0 text-sm text-mut">Your ward office has not assigned you a vehicle or route yet. It appears here as soon as they do.</p>
      </div>
    );
  }

  const vehicle = state.vehicles.find((v) => v.id === current.vehicle);
  const done = current.stops.filter((s) => s.status !== "Pending").length;
  const total = current.stops.length;
  const eta = estimateRoute(current.stops, pos, fix?.speed ?? pos?.speed);
  const nextStop = eta.legs[0];
  const scheduled = atTime(new Date(), current.time);
  const startsIn = (scheduled.getTime() - Date.now()) / 60000;
  const elapsed = current.started_at ? (Date.now() - new Date(current.started_at).getTime()) / 60000 : 0;
  const kgToday = state.routes.filter((r) => r.status === "Completed").reduce((a, r) => a + r.kg, 0);
  const active = current.status === "In Progress" || current.status === "Delayed";

  const go = async () => {
    if (current.status === "Upcoming" || current.status === "Incomplete") {
      setBusy(true);
      try {
        await start(current);
      } catch {
        setBusy(false);
        return;
      }
    }
    router.push("/driver/route");
  };

  return (
    <>
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <b className="flex items-center gap-2 text-lg">
            <Truck size={20} className="text-ac" /> Today&apos;s assignment
          </b>
          <Pill tone={ROUTE_TONE[current.status] ?? ""}>{current.status === "Upcoming" ? "Assigned" : current.status}</Pill>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          <Info icon={<Truck size={19} />} label="Vehicle" value={current.vehicle} sub={vehicle ? `${vehicle.cap} t capacity` : undefined} />
          <Info icon={<RouteIcon size={19} />} label={`Route · Ward ${current.ward}`} value={`Route ${current.n}`} sub={current.area} />
          <Info
            icon={<Clock size={19} />}
            label="Schedule"
            value={formatTime(current.time)}
            sub={current.status === "Upcoming" && startsIn > 0 ? `in ${formatMinutes(startsIn)}` : `finish ≈ ${clock(eta.finishAt)}`}
          />
          <Info icon={<Leaf size={19} />} label="Waste type" value={current.waste} />
          <Info icon={<MapPin size={19} />} label="Collection points" value={`${total} stops`} sub={`${total - done} left`} />
          <Info icon={<AlarmClock size={19} />} label="Time needed" value={formatMinutes(eta.totalMin)} sub={eta.fromPosition ? "from where you are" : "stops only (no GPS yet)"} />
        </div>
      </div>

      {nextStop && (
        <TapCard
          className="mt-3"
          href="/driver/route"
          icon={<Navigation size={22} />}
          title={
            <>
              <span className="text-xs font-semibold text-ac">NEXT STOP</span>
              <span className="block">
                {nextStop.stop.seq}. {nextStop.stop.name}
              </span>
            </>
          }
          subtitle={eta.fromPosition ? `${formatKm(nextStop.km)} · about ${formatMinutes(nextStop.arriveMin)} (${clock(nextStop.arriveAt)})` : "Turn on GPS for travel time"}
          right={<ChevronRight size={18} className="text-mut" />}
        />
      )}

      {current.status !== "Completed" ? (
        <button
          type="button"
          onClick={go}
          disabled={busy}
          className="mt-4 flex w-full items-center gap-4 rounded-3xl bg-ac p-4 text-left text-white shadow-lg active:scale-[0.99] disabled:opacity-60"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-ac">
            <Play size={26} fill="currentColor" />
          </span>
          <span>
            <b className="block text-xl">{busy ? "Starting…" : active ? "Continue collection" : "Start collection"}</b>
            <span className="text-sm text-white/85">
              {active ? `${total - done} stops remaining` : "Begin your route; GPS sharing turns on"}
            </span>
          </span>
        </button>
      ) : (
        <div className="mt-4 rounded-3xl bg-ok-soft p-4 text-center">
          <b className="block text-ok">Route {current.n} completed</b>
          <span className="text-sm">{current.kg} kg recorded. Check your schedule for the next route.</span>
        </div>
      )}

      {eta.fromPosition && current.status !== "Completed" && (
        <div className="mt-3 grid grid-cols-3 gap-2 rounded-3xl bg-ac-soft p-3 text-center">
          <div>
            <span className="block text-[11px] text-mut">To first stop</span>
            <b className="text-sm">{formatMinutes(eta.toStartMin)}</b>
            <span className="block text-[11px] text-mut">{formatKm(eta.toStartKm)}</span>
          </div>
          <div>
            <span className="block text-[11px] text-mut">Whole route</span>
            <b className="text-sm">{formatMinutes(eta.totalMin)}</b>
            <span className="block text-[11px] text-mut">{formatKm(eta.totalKm)}</span>
          </div>
          <div>
            <span className="block text-[11px] text-mut">Finish around</span>
            <b className="text-sm">{clock(eta.finishAt)}</b>
            <span className="block text-[11px] text-mut">{eta.speedKmh} km/h avg</span>
          </div>
        </div>
      )}

      <SectionTitle>Today&apos;s progress</SectionTitle>
      <div className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-3xl border border-line bg-surface p-4 shadow-card">
        <Ring percent={total ? (done / total) * 100 : 0} size={92}>
          <b className="text-lg leading-none">
            {done}/{total}
          </b>
          <span className="block text-[10px] text-mut">stops</span>
        </Ring>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <Clock size={18} className="mx-auto text-ac" />
            <b className="block text-sm">{elapsed ? formatMinutes(elapsed) : "–"}</b>
            <span className="text-[11px] text-mut">On route</span>
          </div>
          <div>
            <Scale size={18} className="mx-auto text-ac" />
            <b className="block text-sm">{kgToday} kg</b>
            <span className="text-[11px] text-mut">Collected</span>
          </div>
          <div>
            <Gauge size={18} className="mx-auto text-ac" />
            <b className="block text-sm">{formatKm(travelledKm)}</b>
            <span className="text-[11px] text-mut">{gpsStatus === "simulating" ? "Simulated" : "Driven"}</span>
          </div>
        </div>
      </div>
    </>
  );
}
