"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, CheckCircle2, Clock, Crosshair, Flag, LocateOff, Play, RotateCcw, SkipForward, Square, Truck } from "lucide-react";
import { LiveMap } from "@/components/map/LiveMap";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { Pill } from "@/components/ui/Status";
import { Segmented } from "@/components/ui/Tabs";
import { useDriver } from "@/context/DriverContext";
import { useUi } from "@/context/UiContext";
import { cn } from "@/lib/cn";
import { ago, clock, estimateRoute, formatKm, formatMinutes } from "@/lib/eta";
import { formatTime } from "@/lib/format";
import { ROUTE_TONE, usePosition } from "./Home";
import type { RouteDetail } from "@/types/live";

const OUTCOMES = ["Completed", "Delayed", "Incomplete"];

function FinishSheet({ route }: { route: RouteDetail }) {
  const { finish, state } = useDriver();
  const { closeOverlay, toast } = useUi();
  const cap = state?.vehicles.find((v) => v.id === route.vehicle)?.cap ?? 5;
  const [outcome, setOutcome] = useState("Completed");
  const [kg, setKg] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = route.stops.filter((s) => s.status === "Pending").length;

  const submit = async () => {
    const weight = Math.round(Number(kg));
    if (outcome === "Completed" && (!weight || weight <= 0)) return toast("Enter the weight collected in kg");
    if (weight > cap * 1000 * 1.5) return toast(`That is more than this truck can carry (${cap} t)`);
    setBusy(true);
    try {
      await finish(route, outcome.toLowerCase() as "completed" | "delayed" | "incomplete", outcome === "Completed" ? weight : 0);
      closeOverlay();
    } catch {
      setBusy(false);
    }
  };

  return (
    <>
      <h2>Finish Route {route.n}</h2>
      {pending > 0 && outcome === "Completed" && (
        <p className="mt-0 rounded-xl bg-warn-soft px-3 py-2 text-sm text-warn">{pending} stops are not marked yet; they will be marked collected.</p>
      )}
      <Segmented items={OUTCOMES} active={outcome} onChange={setOutcome} />
      {outcome === "Completed" ? (
        <>
          <Label htmlFor="kg" className="mt-0">
            Weight collected (kg)
          </Label>
          <Input id="kg" type="number" inputMode="numeric" min={1} placeholder="e.g. 850" value={kg} onChange={(e) => setKg(e.target.value)} />
          <p className="mb-0 mt-1 text-xs text-mut">From the weighbridge slip. Shared with the ward office and KMC.</p>
        </>
      ) : outcome === "Delayed" ? (
        <p className="m-0 text-sm text-mut">The ward office and KMC are told about a vehicle problem, and residents subscribed to SMS alerts get a delay message.</p>
      ) : (
        <p className="m-0 text-sm text-mut">The route is marked incomplete and KMC is notified. The remaining stops stay open.</p>
      )}
      <Button block size="lg" className="mt-5" onClick={submit} disabled={busy}>
        {busy ? "Sending…" : outcome === "Completed" ? "Complete route" : outcome === "Delayed" ? "Report delay" : "Mark incomplete"}
      </Button>
      <Button block variant="link" className="mt-2" onClick={closeOverlay}>
        Cancel
      </Button>
    </>
  );
}

export function DriverRoute() {
  const { state, current, start, setStop, fix, gpsStatus, gpsError, retryGps, simulate, stopSimulation, sharing, setSharing, lastSent, sendError } =
    useDriver();
  const { openDrawer } = useUi();
  const [follow, setFollow] = useState(true);
  const [busyStop, setBusyStop] = useState<number | null>(null);
  const pos = usePosition(current);
  if (!state) return null;
  if (!current) {
    return (
      <p className="text-mut">
        No route assigned. <Link href="/driver/schedule" className="font-semibold text-ac">See schedule</Link>
      </p>
    );
  }

  const route = current;
  const truck = state.vehicles.find((v) => v.id === route.vehicle);
  const eta = estimateRoute(route.stops, pos, fix?.speed ?? pos?.speed);
  const active = route.status === "In Progress" || route.status === "Delayed";
  const done = route.stops.filter((s) => s.status !== "Pending").length;

  const mark = async (id: number, status: "Pending" | "Collected" | "Skipped") => {
    setBusyStop(id);
    await setStop(id, status).catch(() => undefined);
    setBusyStop(null);
  };

  const simulateDrive = () => {
    const pending = route.stops.filter((s) => s.status === "Pending");
    if (!pending.length) return;
    // Start a little before the first remaining stop (or from the real position), then visit every stop.
    const first = pending[0];
    const startAt = fix && !fix.simulated ? fix : { lat: first.lat - 0.004, lng: first.lng - 0.003 };
    simulate([startAt, ...pending]);
  };

  return (
    <>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h1 className="m-0 text-2xl">Route {route.n}</h1>
          <span className="text-sm text-mut">
            Ward {route.ward} · {route.area} · {formatTime(route.time)}
          </span>
        </div>
        <Pill tone={ROUTE_TONE[route.status] ?? ""}>{route.status}</Pill>
      </div>

      <div className="relative">
        <LiveMap
          routes={[route]}
          vehicles={fix ? [] : truck ? [truck] : []}
          me={fix}
          focusRouteId={route.id}
          follow={follow && !!fix}
          className="h-[46dvh] min-h-[280px]"
        />
        <button
          type="button"
          onClick={() => setFollow((f) => !f)}
          aria-pressed={follow}
          className={cn(
            "absolute left-3 top-3 z-[3] flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow-card",
            follow ? "bg-ac text-white" : "bg-surface text-ink"
          )}
        >
          <Crosshair size={15} /> {follow ? "Following you" : "Follow me"}
        </button>
      </div>

      {/* GPS status */}
      <div className="mt-3 rounded-2xl border border-line bg-surface p-3 text-sm shadow-card">
        {!sharing ? (
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-mut">
              <LocateOff size={17} /> Location sharing is off
            </span>
            <Button size="sm" onClick={() => setSharing(true)}>
              Turn on
            </Button>
          </div>
        ) : gpsStatus === "error" ? (
          <>
            <p className="m-0 text-bad">{gpsError}</p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" onClick={retryGps}>
                Try again
              </Button>
              {active && (
                <Button size="sm" variant="soft" onClick={simulateDrive}>
                  <Play size={14} /> Simulate drive
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", fix ? "animate-pulse bg-ok" : "bg-warn")} />
              {gpsStatus === "simulating" ? "Simulated drive" : fix ? "Sharing live location" : "Finding your position…"}
              {fix?.accuracy != null && gpsStatus !== "simulating" && <span className="text-mut">±{Math.round(fix.accuracy)} m</span>}
            </span>
            <span className="text-xs text-mut">
              {sendError ? <span className="text-bad">Not sent: {sendError}</span> : lastSent ? `Sent ${ago(new Date(lastSent).toISOString())}` : ""}
            </span>
            {active &&
              (gpsStatus === "simulating" ? (
                <Button size="sm" variant="outline" onClick={stopSimulation}>
                  <Square size={13} /> Stop simulation
                </Button>
              ) : (
                <Button size="sm" variant="link" onClick={simulateDrive}>
                  Simulate drive (testing)
                </Button>
              ))}
          </div>
        )}
      </div>

      {/* Time estimate */}
      {route.status !== "Completed" && eta.legs.length > 0 && (
        <div className="mt-3 rounded-3xl bg-ac p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/85">{eta.fromPosition ? "Total time to finish this route" : "Time for the remaining stops"}</span>
            <Clock size={18} className="text-white/80" />
          </div>
          <b className="block text-3xl">{formatMinutes(eta.totalMin)}</b>
          <span className="text-sm text-white/85">
            Finish around {clock(eta.finishAt)} · {formatKm(eta.totalKm)} · {eta.legs.length} stops
          </span>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/20 pt-3 text-center text-xs">
            <div>
              <b className="block text-sm">{eta.fromPosition ? formatMinutes(eta.toStartMin) : "–"}</b>
              to first stop
            </div>
            <div>
              <b className="block text-sm">{formatMinutes(eta.driveMin)}</b>
              driving between
            </div>
            <div>
              <b className="block text-sm">{formatMinutes(eta.serviceMin)}</b>
              loading
            </div>
          </div>
          <p className="mb-0 mt-2 text-[11px] text-white/70">
            Estimate at {eta.speedKmh} km/h on city streets plus 6 min per stop{eta.fromPosition ? "" : ". Turn on GPS to include the drive to the route"}.
          </p>
        </div>
      )}

      {!active && route.status !== "Completed" && (
        <Button block size="lg" className="mt-3" onClick={() => start(route).catch(() => undefined)}>
          <Play size={18} /> Start Route {route.n}
        </Button>
      )}

      {/* Stops */}
      <div className="mb-2 mt-5 flex items-center justify-between">
        <h2 className="m-0 text-[17px]">Collection stops</h2>
        <span className="text-sm text-mut">
          {done}/{route.stops.length} done
        </span>
      </div>
      <ol className="m-0 list-none space-y-2 p-0">
        {route.stops.map((s, i) => {
          const leg = eta.legs.find((l) => l.stop.id === s.id);
          const isNext = eta.legs[0]?.stop.id === s.id;
          return (
            <li
              key={s.id}
              className={cn("rounded-2xl border bg-surface p-3 shadow-card", isNext && active ? "border-ac ring-2 ring-ac-soft" : "border-line")}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold",
                    s.status === "Collected" ? "bg-ok text-white" : s.status === "Skipped" ? "bg-mut text-white" : "border-2 border-ac text-ac"
                  )}
                >
                  {s.status === "Collected" ? <Check size={16} /> : s.status === "Skipped" ? <SkipForward size={14} /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-[15px]">{s.name}</b>
                  <span className="text-xs text-mut">
                    {s.status === "Pending"
                      ? leg && eta.fromPosition
                        ? `${formatKm(leg.km)} · ~${formatMinutes(leg.arriveMin)} · ${clock(leg.arriveAt)}`
                        : "Pending"
                      : `${s.status}${s.at ? ` ${ago(s.at)}` : ""}`}
                  </span>
                </div>
                {isNext && active && <Pill tone="B">Next</Pill>}
              </div>
              {active && (
                <div className="mt-2.5 flex gap-2">
                  {s.status === "Pending" ? (
                    <>
                      <Button size="sm" className="flex-1" disabled={busyStop === s.id} onClick={() => mark(s.id, "Collected")}>
                        <CheckCircle2 size={15} /> Collected
                      </Button>
                      <Button size="sm" variant="outline" disabled={busyStop === s.id} onClick={() => mark(s.id, "Skipped")}>
                        <SkipForward size={15} /> Skip
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="link" disabled={busyStop === s.id} onClick={() => mark(s.id, "Pending")}>
                      <RotateCcw size={14} /> Undo
                    </Button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {active && (
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Button size="lg" onClick={() => openDrawer(<FinishSheet route={route} />)}>
            <Flag size={18} /> Finish route
          </Button>
          <Link
            href="/driver/records?issue=1"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-warn-soft px-4 py-3.5 font-semibold text-warn"
          >
            <AlertTriangle size={18} /> Report issue
          </Link>
        </div>
      )}
      {route.status === "Completed" && (
        <div className="mt-5 flex items-center gap-3 rounded-3xl bg-ok-soft p-4">
          <Truck size={22} className="text-ok" />
          <span className="text-sm">
            Completed {route.completed_at ? ago(route.completed_at) : ""} · {route.kg} kg recorded.{" "}
            <Link href="/driver/schedule" className="font-semibold text-ac">
              Next route →
            </Link>
          </span>
        </div>
      )}
    </>
  );
}
