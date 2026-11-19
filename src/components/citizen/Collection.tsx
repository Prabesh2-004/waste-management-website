"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Bell, CalendarDays, Clock, Leaf, LocateFixed, Navigation, Recycle, Truck } from "lucide-react";
import { LiveMap, MapLegend } from "@/components/map/LiveMap";
import { SectionTitle } from "@/components/mobile/MobileShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Pill } from "@/components/ui/Status";
import { Chips } from "@/components/ui/Tabs";
import { useCitizen } from "@/context/CitizenContext";
import { useUi } from "@/context/UiContext";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { ago, clock, distanceKm, estimateRoute, formatKm, formatMinutes, isLive } from "@/lib/eta";
import { formatTime } from "@/lib/format";
import { dayLabel, nextCollection, upcomingDays } from "@/lib/schedule";
import { useGeolocation } from "@/lib/useGeolocation";
import { useLive } from "@/lib/useLive";
import { WARD_STATUS_TONE, statusText } from "./Home";
import type { RouteDetail } from "@/types/live";

const ROUTE_TONE: Record<string, "G" | "B" | "A" | "R" | ""> = { ...WARD_STATUS_TONE, Upcoming: "" };

function Reminder() {
  const { state, user, setReminder } = useCitizen();
  const { toast } = useUi();
  const [phone, setPhone] = useState(user?.phone?.replace(/^\+977/, "") ?? "");
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const on = state?.reminder ?? false;

  const toggle = async (enabled: boolean, number?: string) => {
    if (enabled && !user?.phone && !number) return setAsking(true);
    setBusy(true);
    try {
      await setReminder(enabled, number);
      setAsking(false);
    } catch (e) {
      setAsking(true);
      toast(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 rounded-3xl border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ac-soft text-ac">
          <Bell size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <b className="block">Collection reminder</b>
          <span className="text-[13px] text-mut">{on ? `SMS to ${user?.phone} about delays and time changes` : "Get an SMS about delays and time changes."}</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Collection reminder"
          disabled={busy}
          onClick={() => toggle(!on)}
          className={cn("relative h-8 w-14 shrink-0 rounded-full transition-colors", on ? "bg-ac" : "bg-line")}
        >
          <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-[left]", on ? "left-7" : "left-1")} />
        </button>
      </div>
      {asking && !on && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            toggle(true, phone);
          }}
        >
          <Input type="tel" inputMode="tel" autoComplete="tel" placeholder="98XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} aria-label="Mobile number" />
          <Button type="submit" disabled={busy || !phone.trim()}>
            Turn on
          </Button>
        </form>
      )}
    </div>
  );
}

function StopList({ route, fromTruck, nearestId }: { route: RouteDetail; fromTruck: ReturnType<typeof estimateRoute> | null; nearestId: number | null }) {
  return (
    <ol className="m-0 list-none p-0">
      {route.stops.map((s) => {
        const leg = fromTruck?.legs.find((l) => l.stop.id === s.id);
        const done = s.status !== "Pending";
        return (
          <li key={s.id} className={cn("flex items-center gap-3 border-b border-line py-2.5 last:border-b-0", nearestId === s.id && "rounded-xl bg-ac-soft px-2")}>
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                done ? "bg-ok text-white" : "border-2 border-ac text-ac"
              )}
            >
              {done ? "✓" : s.seq}
            </span>
            <span className="min-w-0 flex-1">
              <b className="block truncate text-sm">{s.name}</b>
              <span className="text-xs text-mut">
                {s.status === "Collected" ? `Collected ${s.at ? ago(s.at) : ""}` : s.status === "Skipped" ? "Skipped" : leg ? `~${formatMinutes(leg.arriveMin)} · ${clock(leg.arriveAt)}` : "Waiting"}
                {nearestId === s.id && " · nearest to you"}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function CitizenCollection() {
  const { state, call } = useCitizen();
  const { data } = useLive(call, state?.ward.n, 5000);
  const live = data ?? state?.live ?? null;
  const routes = useMemo(() => live?.routes ?? [], [live]);
  const defaultRoute = routes.find((r) => r.status === "In Progress") ?? routes.find((r) => r.status === "Delayed") ?? routes[0];
  const [choice, setChoice] = useState<number | null>(null);
  const route = routes.find((r) => r.id === choice) ?? defaultRoute;
  const [locate, setLocate] = useState(false);
  const gps = useGeolocation(locate);

  if (!state || !live) return null;
  const { ward } = state;
  const next = nextCollection(ward.time, ward.status);
  const truck = route ? live.vehicles.find((v) => v.id === route.vehicle) : undefined;
  const truckLive = truck?.location ? isLive(truck.location.at, live.liveSeconds) : false;
  const fromTruck =
    route && truck?.location && (route.status === "In Progress" || route.status === "Delayed")
      ? estimateRoute(route.stops, truck.location, truck.location.speed)
      : null;

  // Nearest stop (on any route) to this phone, and when the truck gets there.
  const nearest =
    gps.fix && routes.length
      ? routes
          .flatMap((r) => r.stops.map((s) => ({ r, s, km: distanceKm(gps.fix!, s) })))
          .sort((a, b) => a.km - b.km)[0]
      : null;
  const nearestTruck = nearest ? live.vehicles.find((v) => v.id === nearest.r.vehicle) : undefined;
  const nearestEta =
    nearest && nearestTruck?.location && nearest.s.status === "Pending"
      ? estimateRoute(nearest.r.stops, nearestTruck.location, nearestTruck.location.speed).legs.find((l) => l.stop.id === nearest.s.id)
      : undefined;

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ac-soft text-ac">
          <CalendarDays size={26} />
        </span>
        <div>
          <h1 className="m-0 text-2xl">Collection</h1>
          <span className="text-sm text-mut">Your collection schedule and live truck</span>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-surface p-4 shadow-card">
        <span className="text-xs font-semibold uppercase tracking-wide text-mut">Ward {ward.n} · Kathmandu</span>
        <div className="mt-1 flex items-end justify-between gap-2">
          <div>
            <span className="text-sm text-mut">Next collection</span>
            <b className="block text-[22px] leading-tight">
              {dayLabel(next)}, {formatTime(ward.time)}
            </b>
          </div>
          <Pill tone={WARD_STATUS_TONE[ward.status] ?? "B"}>● {statusText(ward.status)}</Pill>
        </div>
      </div>

      <SectionTitle>Track the truck</SectionTitle>
      {routes.length > 1 && (
        <Chips items={routes.map((r) => `Route ${r.n}`)} active={route ? `Route ${route.n}` : ""} onChange={(x) => setChoice(routes.find((r) => `Route ${r.n}` === x)?.id ?? null)} />
      )}
      {route ? (
        <>
          <LiveMap
            routes={routes}
            vehicles={live.vehicles}
            focusRouteId={route.id}
            me={gps.fix}
            liveSeconds={live.liveSeconds}
            className="h-[300px]"
            onRouteClick={(r) => setChoice(r.id)}
          />
          <MapLegend className="mt-2" />
          <div className="mt-3 rounded-3xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ac-soft text-ac">
                <Truck size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <b className="block">
                  Route {route.n} · {route.area}
                </b>
                <span className="text-[13px] text-mut">
                  {route.vehicle} · {formatTime(route.time)} ·{" "}
                  {route.waste.includes("Inorganic") && !route.waste.includes("Organic +") ? (
                    <Recycle size={13} className="inline" />
                  ) : (
                    <Leaf size={13} className="inline" />
                  )}{" "}
                  {route.waste}
                </span>
              </div>
              <Pill tone={ROUTE_TONE[route.status] ?? ""}>{route.status}</Pill>
            </div>
            {truck?.location ? (
              <p className="mb-0 mt-3 flex items-center gap-1.5 text-[13px] text-mut">
                <span className={cn("h-2 w-2 rounded-full", truckLive ? "animate-pulse bg-ok" : "bg-mut")} />
                {truckLive ? "Live GPS" : `Last GPS fix ${ago(truck.location.at)}`}
                {fromTruck && fromTruck.legs.length > 0 && ` · route done ≈ ${clock(fromTruck.finishAt)} (${formatMinutes(fromTruck.totalMin)})`}
              </p>
            ) : (
              <p className="mb-0 mt-3 text-[13px] text-mut">The truck&apos;s position appears when its driver starts sharing GPS.</p>
            )}
            <div className="mt-3">
              <StopList route={route} fromTruck={fromTruck} nearestId={nearest?.r.id === route.id ? nearest.s.id : null} />
            </div>
          </div>

          <div className="mt-3 rounded-3xl bg-ac-soft p-4">
            {!gps.fix ? (
              <>
                <b className="block">When does the truck reach me?</b>
                <span className="text-sm text-ink/80">Share your location once to find your nearest collection point.</span>
                <Button block className="mt-3" onClick={() => (gps.error ? gps.retry() : setLocate(true))} disabled={locate && gps.status === "requesting"}>
                  <LocateFixed size={17} /> {locate && gps.status === "requesting" ? "Finding you…" : "Use my location"}
                </Button>
                {gps.error && <p className="mb-0 mt-2 text-[13px] text-bad">{gps.error}</p>}
              </>
            ) : nearest ? (
              <div className="flex gap-3">
                <Navigation size={22} className="mt-0.5 shrink-0 text-ac" />
                <div>
                  <b className="block">
                    Nearest stop: {nearest.s.name} ({formatKm(nearest.km)} away)
                  </b>
                  <span className="text-sm text-ink/80">
                    Route {nearest.r.n} ·{" "}
                    {nearest.s.status === "Collected"
                      ? "already collected today."
                      : nearestEta
                        ? `the truck should arrive in about ${formatMinutes(nearestEta.arriveMin)} (${clock(nearestEta.arriveAt)}).`
                        : `scheduled from ${formatTime(nearest.r.time)}.`}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <p className="text-mut">No collection routes are set up for your ward yet.</p>
      )}

      <Reminder />

      <SectionTitle>Upcoming collections</SectionTitle>
      <div className="rounded-3xl border border-line bg-surface px-4 py-1 shadow-card">
        {upcomingDays(ward.time, 4).map((d) => (
          <div key={d.toISOString()} className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
            <div className="w-12 text-center leading-tight">
              <b className="block text-xl">{d.getDate()}</b>
              <span className="text-xs text-mut">{d.toLocaleDateString("en-US", { month: "short" })}</span>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ac-soft text-ac">
              <Leaf size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <b className="block text-sm">{ward.kind}</b>
              <span className="text-xs text-mut">{dayLabel(d)}</span>
            </div>
            <span className="flex items-center gap-1 text-sm font-semibold">
              <Clock size={14} className="text-mut" /> {formatTime(ward.time)}
            </span>
          </div>
        ))}
      </div>

      <Link href="/citizen/reports?new=1" className="mt-4 flex items-center gap-3 rounded-3xl bg-surface p-4 shadow-card">
        <AlertCircle size={22} className="shrink-0 text-ac" />
        <span className="flex-1">
          <b className="block">Collection issue?</b>
          <span className="text-[13px] text-mut">Report a missed or delayed collection.</span>
        </span>
        <span className="text-sm font-semibold text-ac">Report →</span>
      </Link>
    </>
  );
}
