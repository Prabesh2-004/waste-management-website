"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useUi } from "@/context/UiContext";
import { ApiError, errorMessage, loadToken, request, saveToken } from "@/lib/api";
import type { ApiUser } from "@/lib/api";
import { distanceKm } from "@/lib/eta";
import { useGeolocation } from "@/lib/useGeolocation";
import type { Fix, GpsStatus } from "@/lib/useGeolocation";
import type { DriverState } from "@/types/driver";
import type { LatLng, RouteDetail } from "@/types/live";

type Call = <T = unknown>(path: string, opts?: { method?: string; body?: unknown; form?: FormData }) => Promise<T>;
type Outcome = "completed" | "delayed" | "incomplete";

/** Send a GPS fix at most this often, unless the truck moved further than SEND_METRES. */
const SEND_EVERY_MS = 5000;
const SEND_METRES = 25;
/** Don't share fixes rougher than this (metres): they are Wi-Fi/cell estimates that make the truck jump. */
export const SEND_MAX_ACCURACY_M = 100;

interface DriverContextValue {
  ready: boolean;
  loadError: string | null;
  user: ApiUser | null;
  state: DriverState | null;
  call: Call;
  reload: () => Promise<void>;
  /** The route the driver is working on (or will work on next). */
  current: RouteDetail | null;
  selectRoute: (id: number) => void;
  // GPS
  sharing: boolean;
  setSharing: (on: boolean) => void;
  fix: Fix | null;
  gpsStatus: GpsStatus;
  gpsError: string | null;
  retryGps: () => void;
  simulate: (path: LatLng[]) => void;
  stopSimulation: () => void;
  lastSent: number | null;
  sendError: string | null;
  travelledKm: number;
  // actions
  start: (route: RouteDetail) => Promise<void>;
  setStop: (stopId: number, status: "Pending" | "Collected" | "Skipped") => Promise<void>;
  finish: (route: RouteDetail, outcome: Outcome, kg: number) => Promise<void>;
  reportIssue: (type: string, description: string, vehicle?: string) => Promise<void>;
  unread: number;
  markSeen: () => void;
}

const DriverContext = createContext<DriverContextValue | null>(null);

export function useDriver(): DriverContextValue {
  const ctx = useContext(DriverContext);
  if (!ctx) throw new Error("useDriver must be used inside DriverProvider");
  return ctx;
}

const PREF = { route: "kwm-driver-route", sharing: "kwm-driver-sharing", seen: "kwm-driver-seen" };

function readPref(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writePref(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function DriverProvider({ children }: { children: ReactNode }) {
  const { toast } = useUi();
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [state, setState] = useState<DriverState | null>(null);
  const [routeId, setRouteId] = useState<number | null>(null);
  const [sharing, setSharingState] = useState(true);
  const [lastSent, setLastSent] = useState<number | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [travelledKm, setTravelledKm] = useState(0);
  const [seenId, setSeenId] = useState(0);
  const token = useRef<string | null>(null);
  const sent = useRef<{ at: number; pos: LatLng } | null>(null);
  const prevFix = useRef<Fix | null>(null);

  const call: Call = useCallback((path, opts) => request(path, { ...opts, token: token.current }), []);
  const reload = useCallback(async () => setState(await call<DriverState>("/api/v1/driver/state")), [call]);

  useEffect(() => {
    setRouteId(Number(readPref(PREF.route)) || null);
    setSharingState(readPref(PREF.sharing) !== "off");
    setSeenId(Number(readPref(PREF.seen)) || 0);
    const saved = loadToken("driver");
    if (!saved) {
      setReady(true);
      return;
    }
    token.current = saved;
    request<ApiUser>("/api/v1/me", { token: saved })
      .then(async (u) => {
        if (u.portal !== "driver") throw new ApiError(403, "Not a driver account");
        setUser(u);
        setState(await request<DriverState>("/api/v1/driver/state", { token: saved }));
      })
      .catch((e) => {
        if (e instanceof ApiError && [401, 403, 404].includes(e.status)) {
          saveToken("driver", null);
          token.current = null;
        } else setLoadError(errorMessage(e));
      })
      .finally(() => setReady(true));
  }, []);

  // Pick up reassignments made by the ward office.
  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => {
      if (!document.hidden) reload().catch(() => undefined);
    }, 20000);
    return () => clearInterval(id);
  }, [user, reload]);

  const routes = state?.routes ?? [];
  const current =
    routes.find((r) => r.id === routeId) ??
    routes.find((r) => r.status === "In Progress") ??
    routes.find((r) => r.status === "Delayed") ??
    routes.find((r) => r.status === "Upcoming") ??
    routes[0] ??
    null;

  const selectRoute = useCallback((id: number) => {
    setRouteId(id);
    writePref(PREF.route, String(id));
  }, []);

  const setSharing = useCallback((on: boolean) => {
    setSharingState(on);
    writePref(PREF.sharing, on ? "on" : "off");
  }, []);

  // GPS: on whenever the driver is signed in and sharing is on.
  const gps = useGeolocation(!!user && sharing);
  const vehicleId = current?.vehicle ?? state?.vehicles[0]?.id;

  useEffect(() => {
    const fix = gps.fix;
    if (!fix || !user) return;
    // Distance driven: ignore jitter and poor fixes.
    const prev = prevFix.current;
    if (prev && (fix.accuracy ?? 0) < 60) {
      const km = distanceKm(prev, fix);
      if (km > 0.005 && km < 2) setTravelledKm((t) => t + km);
    }
    prevFix.current = fix;
    if (!sharing || !vehicleId) return;
    if (!fix.simulated && fix.accuracy != null && fix.accuracy > SEND_MAX_ACCURACY_M) return;
    const last = sent.current;
    const moved = last ? distanceKm(last.pos, fix) * 1000 : Infinity;
    if (last && Date.now() - last.at < SEND_EVERY_MS && moved < SEND_METRES) return;
    sent.current = { at: Date.now(), pos: fix };
    call("/api/v1/driver/location", {
      method: "POST",
      body: { lat: fix.lat, lng: fix.lng, accuracy: fix.accuracy, heading: fix.heading, speed: fix.speed, vehicle: vehicleId },
    })
      .then(() => {
        setLastSent(Date.now());
        setSendError(null);
      })
      .catch((e) => setSendError(errorMessage(e)));
  }, [gps.fix, user, sharing, vehicleId, call]);

  // Keep the screen on during a route so GPS keeps updating.
  const onRoute = current?.status === "In Progress";
  useEffect(() => {
    if (!onRoute || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    const acquire = () => {
      if (document.visibilityState === "visible") {
        navigator.wakeLock.request("screen").then((l) => (lock = l), () => undefined);
      }
    };
    acquire();
    document.addEventListener("visibilitychange", acquire);
    return () => {
      document.removeEventListener("visibilitychange", acquire);
      lock?.release().catch(() => undefined);
    };
  }, [onRoute]);

  const act = useCallback(
    async (path: string, body?: unknown, ok?: string) => {
      try {
        await call(path, { method: "POST", body });
        if (ok) toast(ok);
      } catch (e) {
        toast(errorMessage(e));
        throw e;
      } finally {
        await reload().catch(() => undefined);
      }
    },
    [call, reload, toast]
  );

  const start = useCallback(
    async (route: RouteDetail) => {
      selectRoute(route.id);
      setSharing(true);
      await act(`/api/v1/driver/routes/${route.id}/start`, undefined, `Route ${route.n} started · GPS sharing on`);
    },
    [act, selectRoute, setSharing]
  );

  const setStop = useCallback((stopId: number, status: "Pending" | "Collected" | "Skipped") => act(`/api/v1/driver/stops/${stopId}`, { status }), [act]);

  const finish = useCallback(
    (route: RouteDetail, outcome: Outcome, kg: number) => {
      // Stay on this route afterwards (it shows "Completed · Next route"), rather than
      // jumping to whichever route is still in progress.
      selectRoute(route.id);
      return act(
        `/api/v1/driver/routes/${route.id}/finish`,
        { outcome, kg },
        outcome === "completed" ? `Route ${route.n} completed · ${kg} kg recorded` : outcome === "delayed" ? "Delay reported to the ward office" : "Route marked incomplete"
      );
    },
    [act, selectRoute]
  );

  const reportIssue = useCallback(
    async (type: string, description: string, vehicle?: string) => {
      await call("/api/v1/driver/issues", { method: "POST", body: { type, description, vehicle } });
      toast("Issue reported to the ward office");
      await reload().catch(() => undefined);
    },
    [call, reload, toast]
  );

  const unread = (state?.notifications ?? []).filter((n) => n.id > seenId).length;
  const markSeen = useCallback(() => {
    const top = state?.notifications[0]?.id ?? 0;
    setSeenId(top);
    writePref(PREF.seen, String(top));
  }, [state]);

  const value = useMemo<DriverContextValue>(
    () => ({
      ready, loadError, user, state, call, reload, current, selectRoute, sharing, setSharing,
      fix: gps.fix, gpsStatus: gps.status, gpsError: gps.error, retryGps: gps.retry, simulate: gps.simulate, stopSimulation: gps.stopSimulation,
      lastSent, sendError, travelledKm, start, setStop, finish, reportIssue, unread, markSeen,
    }),
    [
      ready, loadError, user, state, call, reload, current, selectRoute, sharing, setSharing, gps.fix, gps.status, gps.error, gps.retry,
      gps.simulate, gps.stopSimulation, lastSent, sendError, travelledKm, start, setStop, finish, reportIssue, unread, markSeen,
    ]
  );

  return <DriverContext.Provider value={value}>{children}</DriverContext.Provider>;
}
