"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { distanceKm } from "./eta";
import type { LatLng } from "@/types/live";

export interface Fix extends LatLng {
  accuracy: number | null;
  heading: number | null;
  /** m/s */
  speed: number | null;
  at: number;
  simulated?: boolean;
}

export type GpsStatus = "off" | "requesting" | "tracking" | "simulating" | "error";

function gpsError(e: GeolocationPositionError | null): string {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "Phones only share GPS with secure (https) pages. Open the site through https (npm run dev:mobile), or use “Simulate drive” to test.";
  }
  switch (e?.code) {
    case 1:
      return "Location permission was denied. Allow location for this site in the browser settings, then try again.";
    case 2:
      return "Your position is not available. Turn on location (GPS) on the device.";
    case 3:
      return "Getting your position took too long. Move to open sky or try again.";
    default:
      return "This browser cannot share its location.";
  }
}

function bearing(a: LatLng, b: LatLng): number {
  const y = Math.sin(((b.lng - a.lng) * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180);
  const x =
    Math.cos((a.lat * Math.PI) / 180) * Math.sin((b.lat * Math.PI) / 180) -
    Math.sin((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.cos(((b.lng - a.lng) * Math.PI) / 180);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** A fix this precise (metres) is trusted straight away. */
export const GOOD_ACCURACY_M = 30;
/** How long to wait for a precise fix before settling for the best one so far. */
const SETTLE_MS = 15000;
/** Replace a fix with a less precise one only once it is this old. */
const STALE_MS = 20000;

/**
 * Phones report a rough Wi-Fi/cell-tower position first and the satellite fix later, and
 * keep mixing in rough readings indoors. Keep a new reading only if it is precise, at least
 * as precise as the current one, or the current one has gone stale.
 */
function better(next: Fix, cur: Fix | null): boolean {
  if (!cur || next.accuracy == null || cur.accuracy == null) return true;
  return next.accuracy <= GOOD_ACCURACY_M || next.accuracy <= cur.accuracy || next.at - cur.at > STALE_MS;
}

/** Simulated truck speed (m/s) and how much faster than real time the simulation runs. */
const SIM_SPEED_MS = 8;
const SIM_TIME_SCALE = 6;

/**
 * Track the device's GPS while `enabled`. When GPS is unavailable (or for testing at a
 * desk) `simulate(path)` moves a pretend position along a list of points instead.
 */
export function useGeolocation(enabled: boolean) {
  const [fix, setFix] = useState<Fix | null>(null);
  const [status, setStatus] = useState<GpsStatus>("off");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const sim = useRef<ReturnType<typeof setInterval> | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [waited, setWaited] = useState(false);

  const stopSimulation = useCallback(() => {
    if (sim.current) clearInterval(sim.current);
    sim.current = null;
    setSimulating(false);
  }, []);

  useEffect(() => {
    if (!enabled || simulating) {
      if (!simulating) setStatus("off");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation || !window.isSecureContext) {
      setStatus("error");
      setError(gpsError(null));
      return;
    }
    setStatus("requesting");
    setError(null);
    // Start fresh: a position from an earlier session may be far away by now.
    setFix(null);
    setWaited(false);
    const settle = setTimeout(() => setWaited(true), SETTLE_MS);
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setStatus("tracking");
        setError(null);
        const next: Fix = {
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: p.coords.accuracy ?? null,
          heading: Number.isFinite(p.coords.heading) ? p.coords.heading : null,
          speed: Number.isFinite(p.coords.speed) ? p.coords.speed : null,
          at: p.timestamp || Date.now(),
        };
        setFix((cur) => (cur?.simulated || better(next, cur) ? next : cur));
      },
      (e) => {
        setStatus("error");
        setError(gpsError(e));
      },
      // maximumAge 0: never reuse a cached (possibly rough or old) position.
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
    return () => {
      clearTimeout(settle);
      navigator.geolocation.clearWatch(id);
    };
  }, [enabled, simulating, attempt]);

  /** Drive along `path` (first point = start). Each real second covers SIM_TIME_SCALE seconds of driving. */
  const simulate = useCallback(
    (path: LatLng[]) => {
      if (path.length === 0) return;
      stopSimulation();
      setSimulating(true);
      setStatus("simulating");
      setError(null);
      let leg = 0;
      let pos: LatLng = path[0];
      setFix({ ...pos, accuracy: 5, heading: null, speed: 0, at: Date.now(), simulated: true });
      sim.current = setInterval(() => {
        let budget = (SIM_SPEED_MS * SIM_TIME_SCALE) / 1000; // km this tick
        let heading = 0;
        while (budget > 0 && leg < path.length - 1) {
          const target = path[leg + 1];
          const d = distanceKm(pos, target);
          heading = bearing(pos, target);
          if (d <= budget) {
            budget -= d;
            pos = target;
            leg++;
          } else {
            const t = budget / d;
            pos = { lat: pos.lat + (target.lat - pos.lat) * t, lng: pos.lng + (target.lng - pos.lng) * t };
            budget = 0;
          }
        }
        const done = leg >= path.length - 1;
        setFix({ ...pos, accuracy: 5, heading, speed: done ? 0 : SIM_SPEED_MS, at: Date.now(), simulated: true });
        if (done) stopSimulation();
      }, 1000);
    },
    [stopSimulation]
  );

  useEffect(() => () => stopSimulation(), [stopSimulation]);
  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  /** True once the fix is precise, or the wait for a precise one is over. */
  const settled = !!fix && (fix.simulated || fix.accuracy == null || fix.accuracy <= GOOD_ACCURACY_M || waited);

  return {
    fix,
    settled,
    status: simulating ? ("simulating" as const) : status,
    error,
    simulating,
    simulate,
    stopSimulation,
    retry,
  };
}
