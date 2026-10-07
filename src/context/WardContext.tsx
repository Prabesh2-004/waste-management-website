"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import userData from "@/data/ward/user.json";
import options from "@/data/ward/options.json";
import { useUi } from "@/context/UiContext";
import { authenticate, errorMessage, loadToken, request, saveToken, todayShort } from "@/lib/api";
import type { ApiUser } from "@/lib/api";
import { formatTime } from "@/lib/format";
import type { AwarenessProgram, NotificationItem, UpdateItem, UserProfile, Vehicle, WardUserProfile } from "@/types";
import type { WardProgramInput, WardReport, WardRoute } from "@/types/ward";

interface WardState {
  drivers: string[];
  vehicles: Vehicle[];
  routes: WardRoute[];
  schedule: Record<number, string>;
  programs: AwarenessProgram[];
  updates: UpdateItem[];
  reports: WardReport[];
  notifications: (NotificationItem & { id: number })[];
}

type Call = <T = unknown>(path: string, opts?: { method?: string; body?: unknown; form?: FormData }) => Promise<T>;

const DRIVER_OUTCOMES: Record<string, string> = { C: "completed", V: "delayed", U: "incomplete" };

interface WardContextValue {
  ready: boolean;
  authed: boolean;
  needsWardSelection: boolean;
  signIn: (mode: "login" | "signup", profile: UserProfile, password: string) => Promise<void>;
  enterWard: (ward: number) => Promise<void>;
  user: WardUserProfile;
  saveProfile: (profile: UserProfile) => void;
  changePassword: (current: string, next: string) => Promise<void>;
  call: Call;
  wardName: string;
  drivers: string[];
  vehicles: Vehicle[];
  routes: WardRoute[];
  schedule: Record<number, string>;
  programs: AwarenessProgram[];
  updates: UpdateItem[];
  reports: WardReport[];
  notifications: NotificationItem[];
  seen: boolean;
  markSeen: () => void;
  collectionTab: string;
  setCollectionTab: (t: string) => void;
  awarenessTab: string;
  setAwarenessTab: (t: string) => void;
  updateFilter: string;
  setUpdateFilter: (t: string) => void;
  reportStatusFilter: string;
  setReportStatusFilter: (t: string) => void;
  reportCategory: string;
  setReportCategory: (t: string) => void;
  tons: () => number;
  openComplaints: () => number;
  driverOf: (vehicleId: string) => string;
  doneCount: () => number;
  completion: () => number;
  startRoute: (n: number) => void;
  submitDriverUpdate: (n: number, outcome: string, kg: number) => string;
  assignVehicleToRoute: (n: number, vehicleId: string) => void;
  addVehicle: (vehicle: Vehicle) => void;
  assignDriver: (vehicleId: string, driver: string) => void;
  toggleMaintenance: (vehicleId: string) => string;
  changeSchedule: (route: number, time: string) => void;
  createProgram: (input: WardProgramInput) => void;
  decideProgram: (id: number, approve: boolean) => void;
  resubmitProgram: (id: number) => void;
  startProgram: (id: number) => void;
  completeProgram: (id: number, attended: number) => number;
  addUpdate: (input: { category: string; title: string; message: string }) => void;
  simulateComplaint: () => void;
  saveReport: (id: number, status: string, note: string) => void;
}

const WardContext = createContext<WardContextValue | null>(null);

export function useWard(): WardContextValue {
  const ctx = useContext(WardContext);
  if (!ctx) throw new Error("useWard must be used inside WardProvider");
  return ctx;
}

export function WardProvider({ children }: { children: ReactNode }) {
  const { toast } = useUi();
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [needsWardSelection, setNeedsWardSelection] = useState(false);
  const [user, setUser] = useState<WardUserProfile>(userData);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<WardRoute[]>([]);
  const [schedule, setSchedule] = useState<Record<number, string>>({});
  const [programs, setPrograms] = useState<AwarenessProgram[]>([]);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [reports, setReports] = useState<WardReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [seen, setSeen] = useState(false);
  const topNotification = useRef<number | null>(null);
  const [collectionTab, setCollectionTab] = useState("Overview");
  const [awarenessTab, setAwarenessTab] = useState(options.awarenessTabs[0]);
  const [updateFilter, setUpdateFilter] = useState("All");
  const [reportStatusFilter, setReportStatusFilter] = useState("All");
  const [reportCategory, setReportCategory] = useState("All");

  const call: Call = useCallback((path, opts) => request(path, { ...opts, token }), [token]);

  const applyUser = useCallback((u: ApiUser) => {
    setUser({ name: u.name, role: u.role, email: u.email, ward: u.ward ?? userData.ward });
  }, []);

  const loadState = useCallback(async (ward: number, tok: string | null) => {
    const s = await request<WardState>(`/api/v1/wards/${ward}/state`, { token: tok });
    setDrivers(s.drivers);
    setVehicles(s.vehicles);
    setRoutes(s.routes);
    setSchedule(s.schedule);
    setPrograms(s.programs);
    setUpdates(s.updates);
    setReports(s.reports);
    setNotifications(s.notifications);
    const top = s.notifications[0]?.id ?? null;
    if (topNotification.current !== null && top !== topNotification.current) setSeen(false);
    topNotification.current = top;
  }, []);

  /** Send a change to the server, then reload so the UI shows the server's state. */
  const sync = useCallback(
    (promise: Promise<unknown>) => {
      promise
        .catch((e) => toast(errorMessage(e)))
        .finally(() => loadState(user.ward, token).catch((e) => toast(errorMessage(e))));
    },
    [loadState, toast, user.ward, token]
  );

  // Restore the session after a page reload.
  useEffect(() => {
    const saved = loadToken("ward");
    if (!saved) {
      setReady(true);
      return;
    }
    request<ApiUser>("/api/v1/me", { token: saved })
      .then(async (u) => {
        setToken(saved);
        applyUser(u);
        if (u.ward) {
          await loadState(u.ward, saved);
          setAuthed(true);
        } else setNeedsWardSelection(true);
      })
      .catch(() => saveToken("ward", null))
      .finally(() => setReady(true));
  }, [applyUser, loadState]);

  const signIn = useCallback(
    async (mode: "login" | "signup", profile: UserProfile, password: string) => {
      const res = await authenticate("ward", mode, profile, password);
      saveToken("ward", res.access_token);
      setToken(res.access_token);
      applyUser(res.user);
      setNeedsWardSelection(true);
    },
    [applyUser]
  );

  const enterWard = useCallback(
    async (ward: number) => {
      const u = await request<ApiUser>("/api/v1/me", { method: "PATCH", body: { ward }, token });
      applyUser(u);
      await loadState(ward, token);
      setNeedsWardSelection(false);
      setAuthed(true);
    },
    [applyUser, loadState, token]
  );

  const saveProfile = useCallback(
    (profile: UserProfile) => {
      setUser((u) => ({ ...u, ...profile }));
      call<ApiUser>("/api/v1/me", { method: "PATCH", body: profile })
        .then(applyUser)
        .catch((e) => toast(errorMessage(e)));
    },
    [call, applyUser, toast]
  );

  const changePassword = useCallback(
    async (current: string, next: string) => {
      await call("/api/v1/me/password", { method: "POST", body: { current_password: current, new_password: next } });
    },
    [call]
  );

  const wardPath = `/api/v1/wards/${user.ward}`;

  const tons = useCallback(() => routes.reduce((a, r) => a + r.kg / 1000, 0), [routes]);
  const openComplaints = useCallback(() => reports.filter((r) => r.s !== "Resolved").length, [reports]);
  const driverOf = useCallback((id: string) => vehicles.find((x) => x.id === id)?.drv ?? "", [vehicles]);
  const doneCount = useCallback(() => routes.filter((r) => r.s === "Completed").length, [routes]);
  const completion = useCallback(() => {
    const { baseline, baselineDone, perRoute } = options.completion;
    return Math.min(100, Math.round(baseline + (doneCount() - baselineDone) * perRoute));
  }, [doneCount]);

  const setRouteStatus = useCallback(
    (n: number, patch: Partial<WardRoute>) => setRoutes((list) => list.map((r) => (r.n === n ? { ...r, ...patch } : r))),
    []
  );

  const startRoute = useCallback(
    (n: number) => {
      setRouteStatus(n, { s: "In Progress" });
      sync(call(`${wardPath}/routes/${n}/start`, { method: "POST" }));
    },
    [setRouteStatus, sync, call, wardPath]
  );

  const submitDriverUpdate = useCallback(
    (n: number, outcome: string, kg: number) => {
      const route = routes.find((x) => x.n === n);
      if (!route) return "";
      sync(call(`${wardPath}/routes/${n}/driver-update`, { method: "POST", body: { outcome: DRIVER_OUTCOMES[outcome[0]], kg } }));
      if (outcome[0] === "C") {
        const total = tons() - route.kg / 1000 + kg / 1000;
        setRouteStatus(n, { s: "Completed", kg });
        return `Route ${n} completed. ${kg} kg = ${(kg / 1000).toFixed(2)} t. Ward total: ${total.toFixed(2)} t. KMC's map is updated.`;
      }
      if (outcome[0] === "V") {
        setRouteStatus(n, { s: "Delayed" });
        setReports((list) => [
          {
            id: Date.now(),
            ty: "Vehicle breakdown",
            src: "Driver",
            d: todayShort(),
            s: "Pending",
            rt: n,
            ds: `${route.v} has a problem; Route ${n} is delayed.`,
            c: "Vehicle",
            loc: route.area,
            notes: [],
          },
          ...list,
        ]);
        setNotifications((list) => [{ text: `Route ${n} delayed: driver reported a vehicle problem`, href: "/ward/reports" }, ...list]);
        setSeen(false);
        return `Route ${n} marked Delayed. A driver report was added. Update the schedule to inform citizens.`;
      }
      setRouteStatus(n, { s: "Incomplete" });
      return `Route ${n} marked Incomplete. KMC can see this.`;
    },
    [routes, tons, setRouteStatus, sync, call, wardPath]
  );

  const assignVehicleToRoute = useCallback(
    (n: number, vehicleId: string) => {
      setRouteStatus(n, { v: vehicleId });
      sync(call(`${wardPath}/routes/${n}`, { method: "PATCH", body: { vehicle: vehicleId } }));
    },
    [setRouteStatus, sync, call, wardPath]
  );

  const addVehicle = useCallback(
    (vehicle: Vehicle) => {
      setVehicles((list) => [...list, vehicle]);
      sync(call(`${wardPath}/vehicles`, { method: "POST", body: vehicle }));
    },
    [sync, call, wardPath]
  );

  const assignDriver = useCallback(
    (vehicleId: string, driver: string) => {
      setVehicles((list) => list.map((v) => (v.id === vehicleId ? { ...v, drv: driver } : v)));
      sync(call(`/api/v1/vehicles/${vehicleId}`, { method: "PATCH", body: { driver } }));
    },
    [sync, call]
  );

  const toggleMaintenance = useCallback(
    (vehicleId: string) => {
      const current = vehicles.find((a) => a.id === vehicleId);
      const next = current?.st === "Maintenance" ? "Active" : "Maintenance";
      setVehicles((list) => list.map((v) => (v.id === vehicleId ? { ...v, st: next } : v)));
      sync(call(`/api/v1/vehicles/${vehicleId}`, { method: "PATCH", body: { status: next } }));
      return next;
    },
    [vehicles, sync, call]
  );

  const changeSchedule = useCallback(
    (route: number, time: string) => {
      const old = schedule[route];
      setSchedule((s) => ({ ...s, [route]: time }));
      sync(call(`${wardPath}/routes/${route}`, { method: "PATCH", body: { time } }));
      if (old !== time) {
        setUpdates((list) => [
          {
            id: Date.now(),
            c: "Collection",
            t: `Collection timing changed for Route ${route}`,
            b: `Previous: ${formatTime(old)} → New: ${formatTime(time)}`,
            d: todayShort(),
          },
          ...list,
        ]);
        setNotifications((list) => [{ text: `Collection schedule changed for Route ${route}`, href: "/ward/updates" }, ...list]);
      }
    },
    [schedule, sync, call, wardPath]
  );

  const announce = useCallback(
    (p: { n: string; d: string; tm: string; loc?: string }) => {
      setUpdates((list) => [
        {
          id: Date.now() + 1,
          c: "Awareness",
          t: `${p.n} in Ward ${user.ward}`,
          b: `${p.d}, ${p.tm} at ${p.loc}. Register in the Citizen app.`,
          d: todayShort(),
        },
        ...list,
      ]);
    },
    [user.ward]
  );

  const createProgram = useCallback(
    (input: WardProgramInput) => {
      const program: AwarenessProgram = {
        id: Date.now(),
        n: input.name,
        d: input.date,
        tm: formatTime(input.time),
        loc: input.location,
        exp: input.expected,
        reg: 0,
        att: 0,
        s: "Scheduled",
        ap: input.needsCoordination ? "Pending KMC review" : "Approved",
        ds: input.description,
      };
      setPrograms((list) => [...list, program]);
      if (!input.needsCoordination) announce(program);
      sync(call(`${wardPath}/programs`, { method: "POST", body: input }));
    },
    [announce, sync, call, wardPath]
  );

  const decideProgram = useCallback(
    (id: number, approve: boolean) => {
      const p = programs.find((x) => x.id === id);
      if (!p) return;
      setPrograms((list) =>
        list.map((x) => (x.id === id ? { ...x, ap: approve ? "Approved" : "Needs changes", s: approve ? "Scheduled" : x.s } : x))
      );
      if (approve) announce(p);
      sync(call(`/api/v1/programs/${id}/decision`, { method: "POST", body: { approve } }));
    },
    [programs, announce, sync, call]
  );

  const patchProgram = useCallback(
    (id: number, patch: Partial<AwarenessProgram>) => setPrograms((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    []
  );

  const resubmitProgram = useCallback(
    (id: number) => {
      patchProgram(id, { ap: "Pending KMC review" });
      sync(call(`/api/v1/programs/${id}/resubmit`, { method: "POST" }));
    },
    [patchProgram, sync, call]
  );

  const startProgram = useCallback(
    (id: number) => {
      patchProgram(id, { s: "Ongoing" });
      setAwarenessTab("All");
      sync(call(`/api/v1/programs/${id}/start`, { method: "POST" }));
    },
    [patchProgram, sync, call]
  );

  const completeProgram = useCallback(
    (id: number, attended: number) => {
      patchProgram(id, { att: attended, s: "Completed" });
      setAwarenessTab("Completed");
      sync(call(`/api/v1/programs/${id}/complete`, { method: "POST", body: { attended } }));
      return attended;
    },
    [patchProgram, sync, call]
  );

  const addUpdate = useCallback(
    (input: { category: string; title: string; message: string }) => {
      setUpdates((list) => [{ id: Date.now(), c: input.category, t: input.title, b: input.message, d: todayShort() }, ...list]);
      sync(call(`${wardPath}/updates`, { method: "POST", body: input }));
    },
    [sync, call, wardPath]
  );

  const simulateComplaint = useCallback(() => {
    const c = options.simulatedComplaint;
    setReports((list) => [
      { id: Date.now(), ty: c.ty, src: c.src, d: todayShort(), s: "Pending", rt: c.rt, ds: c.ds, c: c.c, loc: c.loc, notes: [] },
      ...list,
    ]);
    setNotifications((list) => [{ text: "New citizen complaint received", href: "/ward/reports" }, ...list]);
    setSeen(false);
    sync(
      call(`${wardPath}/reports`, {
        method: "POST",
        body: { type: c.ty, source: c.src, route: c.rt, description: c.ds, category: c.c, location: c.loc },
      })
    );
  }, [sync, call, wardPath]);

  const saveReport = useCallback(
    (id: number, status: string, note: string) => {
      setReports((list) => list.map((r) => (r.id === id ? { ...r, s: status, notes: note ? [...r.notes, note] : r.notes } : r)));
      sync(call(`/api/v1/reports/${id}`, { method: "PATCH", body: { status, note } }));
    },
    [sync, call]
  );

  const value: WardContextValue = useMemo(
    () => ({
      ready, authed, needsWardSelection, signIn, enterWard, user, saveProfile, changePassword, call,
      wardName: `Ward ${user.ward}`,
      drivers,
      vehicles, routes, schedule, programs, updates, reports, notifications, seen,
      markSeen: () => setSeen(true),
      collectionTab, setCollectionTab, awarenessTab, setAwarenessTab, updateFilter, setUpdateFilter,
      reportStatusFilter, setReportStatusFilter, reportCategory, setReportCategory,
      tons, openComplaints, driverOf, doneCount, completion, startRoute, submitDriverUpdate, assignVehicleToRoute,
      addVehicle, assignDriver, toggleMaintenance, changeSchedule, createProgram, decideProgram, resubmitProgram,
      startProgram, completeProgram, addUpdate, simulateComplaint, saveReport,
    }),
    [
      ready, authed, needsWardSelection, signIn, enterWard, user, saveProfile, changePassword, call, drivers, vehicles, routes, schedule, programs, updates, reports,
      notifications, seen, collectionTab, awarenessTab, updateFilter, reportStatusFilter, reportCategory, tons, openComplaints,
      driverOf, doneCount, completion, startRoute, submitDriverUpdate, assignVehicleToRoute, addVehicle, assignDriver,
      toggleMaintenance, changeSchedule, createProgram, decideProgram, resubmitProgram, startProgram, completeProgram,
      addUpdate, simulateComplaint, saveReport,
    ]
  );

  return <WardContext.Provider value={value}>{children}</WardContext.Provider>;
}
