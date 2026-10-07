"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import userData from "@/data/kmc/user.json";
import optionsData from "@/data/kmc/options.json";
import { useUi } from "@/context/UiContext";
import { authenticate, errorMessage, loadToken, request, saveToken, todayShort } from "@/lib/api";
import type { ApiUser } from "@/lib/api";
import { formatTime } from "@/lib/format";
import type { AwarenessProgram, NotificationItem, UpdateItem, UserProfile, Vehicle } from "@/types";
import type { KmcReport, KmcRoute, NewProgramInput, NewUpdateInput, WardSchedule, WardStat } from "@/types/kmc";

interface KmcState {
  drivers: string[];
  wards: WardStat[];
  wardStatus: Record<number, string>;
  vehicles: Vehicle[];
  routes: KmcRoute[];
  schedule: Record<number, WardSchedule>;
  programs: AwarenessProgram[];
  updates: UpdateItem[];
  reports: KmcReport[];
  notifications: (NotificationItem & { id: number })[];
}

type Call = <T = unknown>(path: string, opts?: { method?: string; body?: unknown; form?: FormData }) => Promise<T>;

interface KmcContextValue {
  ready: boolean;
  authed: boolean;
  signIn: (mode: "login" | "signup", profile: UserProfile, password: string) => Promise<void>;
  user: UserProfile;
  saveProfile: (profile: UserProfile) => void;
  changePassword: (current: string, next: string) => Promise<void>;
  call: Call;
  drivers: string[];
  wards: WardStat[];
  wardStatus: Record<number, string>;
  vehicles: Vehicle[];
  routes: KmcRoute[];
  schedule: Record<number, WardSchedule>;
  programs: AwarenessProgram[];
  updates: UpdateItem[];
  reports: KmcReport[];
  notifications: NotificationItem[];
  seen: boolean;
  markSeen: () => void;
  selectedWard: number;
  selectWard: (n: number) => void;
  period: string;
  setPeriod: (p: string) => void;
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
  openComplaints: (ward: number) => number;
  driverOf: (vehicleId: string) => string;
  totalTons: () => number;
  countStatus: (status: string) => number;
  completeRoute: (ward: number, kg: number) => number;
  restartRoute: (ward: number) => void;
  addVehicle: (vehicle: Vehicle) => void;
  assignDriver: (vehicleId: string, driver: string) => void;
  assignRoute: (ward: number, vehicleId: string, driver: string) => void;
  changeSchedule: (ward: number, time: string, kind: string) => void;
  addProgram: (input: NewProgramInput) => void;
  registerCitizens: (id: number) => void;
  addUpdate: (input: NewUpdateInput) => void;
  setReportStatus: (id: number, status: string) => void;
}

const KmcContext = createContext<KmcContextValue | null>(null);

export function useKmc(): KmcContextValue {
  const ctx = useContext(KmcContext);
  if (!ctx) throw new Error("useKmc must be used inside KmcProvider");
  return ctx;
}

export function KmcProvider({ children }: { children: ReactNode }) {
  const { toast } = useUi();
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<UserProfile>(userData);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [wards, setWards] = useState<WardStat[]>([]);
  const [wardStatus, setWardStatus] = useState<Record<number, string>>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<KmcRoute[]>([]);
  const [schedule, setSchedule] = useState<Record<number, WardSchedule>>({});
  const [programs, setPrograms] = useState<AwarenessProgram[]>([]);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [reports, setReports] = useState<KmcReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [seen, setSeen] = useState(false);
  const topNotification = useRef<number | null>(null);
  const [selectedWard, setSelectedWard] = useState<number>(optionsData.defaultWard);
  const [period, setPeriod] = useState(optionsData.wardPeriods[0].label);
  const [collectionTab, setCollectionTab] = useState("Overview");
  const [awarenessTab, setAwarenessTab] = useState(optionsData.awarenessTabs[0]);
  const [updateFilter, setUpdateFilter] = useState("All");
  const [reportStatusFilter, setReportStatusFilter] = useState("All");
  const [reportCategory, setReportCategory] = useState("All");

  const call: Call = useCallback((path, opts) => request(path, { ...opts, token }), [token]);

  const applyUser = useCallback((u: ApiUser) => setUser({ name: u.name, role: u.role, email: u.email }), []);

  const loadState = useCallback(async (tok: string | null) => {
    const s = await request<KmcState>("/api/v1/kmc/state", { token: tok });
    setDrivers(s.drivers);
    setWards(s.wards);
    setWardStatus(s.wardStatus);
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
        .finally(() => loadState(token).catch((e) => toast(errorMessage(e))));
    },
    [loadState, toast, token]
  );

  // Restore the session after a page reload.
  useEffect(() => {
    const saved = loadToken("kmc");
    if (!saved) {
      setReady(true);
      return;
    }
    request<ApiUser>("/api/v1/me", { token: saved })
      .then(async (u) => {
        await loadState(saved);
        setToken(saved);
        applyUser(u);
        setAuthed(true);
      })
      .catch(() => saveToken("kmc", null))
      .finally(() => setReady(true));
  }, [applyUser, loadState]);

  const signIn = useCallback(
    async (mode: "login" | "signup", profile: UserProfile, password: string) => {
      const res = await authenticate("kmc", mode, profile, password);
      await loadState(res.access_token);
      saveToken("kmc", res.access_token);
      setToken(res.access_token);
      applyUser(res.user);
      setAuthed(true);
    },
    [applyUser, loadState]
  );

  const saveProfile = useCallback(
    (profile: UserProfile) => {
      setUser(profile);
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

  const openComplaints = useCallback((ward: number) => reports.filter((r) => r.w === ward && r.s !== "Resolved").length, [reports]);

  const driverOf = useCallback((id: string) => vehicles.find((x) => x.id === id)?.drv ?? "", [vehicles]);

  const totalTons = useCallback(() => wards.reduce((a, w) => a + w.t, 0), [wards]);

  const countStatus = useCallback((s: string) => Object.values(wardStatus).filter((x) => x === s).length, [wardStatus]);

  const completeRoute = useCallback(
    (ward: number, kg: number) => {
      const current = wards.find((w) => w.n === ward)?.t ?? 0;
      const next = current + kg / 1000;
      setWardStatus((s) => ({ ...s, [ward]: "Completed" }));
      setWards((list) => list.map((w) => (w.n === ward ? { ...w, t: next } : w)));
      sync(call(`/api/v1/kmc/wards/${ward}/complete`, { method: "POST", body: { kg } }));
      return next;
    },
    [wards, sync, call]
  );

  const restartRoute = useCallback(
    (ward: number) => {
      setWardStatus((s) => ({ ...s, [ward]: "In Progress" }));
      sync(call(`/api/v1/kmc/wards/${ward}/restart`, { method: "POST" }));
    },
    [sync, call]
  );

  const addVehicle = useCallback(
    (vehicle: Vehicle) => {
      setVehicles((list) => [...list, vehicle]);
      sync(call("/api/v1/kmc/vehicles", { method: "POST", body: vehicle }));
    },
    [sync, call]
  );

  const assignDriver = useCallback(
    (vehicleId: string, driver: string) => {
      setVehicles((list) => list.map((v) => (v.id === vehicleId ? { ...v, drv: driver } : v)));
      sync(call(`/api/v1/vehicles/${vehicleId}`, { method: "PATCH", body: { driver } }));
    },
    [sync, call]
  );

  const assignRoute = useCallback(
    (ward: number, vehicleId: string, driver: string) => {
      setRoutes((list) => list.map((r) => (r.w === ward ? { ...r, v: vehicleId } : r)));
      setVehicles((list) => list.map((v) => (v.id === vehicleId ? { ...v, drv: driver } : v)));
      sync(call(`/api/v1/kmc/wards/${ward}/assignment`, { method: "PUT", body: { vehicle: vehicleId, driver } }));
    },
    [sync, call]
  );

  const changeSchedule = useCallback(
    (ward: number, time: string, kind: string) => {
      const old = schedule[ward].t;
      setSchedule((s) => ({ ...s, [ward]: { t: time, k: kind } }));
      sync(call(`/api/v1/kmc/wards/${ward}/schedule`, { method: "PUT", body: { time, kind } }));
      if (old !== time) {
        setUpdates((list) => [
          {
            id: Date.now(),
            c: "Collection",
            t: `Collection timing changed for Ward ${ward}`,
            b: `Previous: ${formatTime(old)} → New: ${formatTime(time)}`,
            w: `Ward ${ward}`,
            d: todayShort(),
          },
          ...list,
        ]);
        setNotifications((list) => [{ text: `Schedule changed in Ward ${ward}`, href: "/kmc/updates" }, ...list]);
      }
    },
    [schedule, sync, call]
  );

  const addProgram = useCallback((input: NewProgramInput) => {
    const time = formatTime(input.time);
    setPrograms((list) => [
      ...list,
      {
        id: Date.now(),
        n: input.name,
        w: input.ward,
        d: input.date,
        tm: time,
        exp: input.expected,
        reg: 0,
        att: 0,
        s: "Upcoming",
        ds: input.description,
      },
    ]);
    setUpdates((list) => [
      {
        id: Date.now() + 1,
        c: "Awareness",
        t: `${input.name} in Ward ${input.ward}`,
        b: `Register through the Citizen app. ${input.date}, ${time}.`,
        w: `Ward ${input.ward}`,
        d: todayShort(),
      },
      ...list,
    ]);
    setAwarenessTab("Upcoming");
    sync(call("/api/v1/kmc/programs", { method: "POST", body: input }));
  }, [sync, call]);

  const registerCitizens = useCallback(
    (id: number) => {
      setPrograms((list) => list.map((p) => (p.id === id ? { ...p, reg: p.reg + optionsData.registrationBatch } : p)));
      sync(call(`/api/v1/programs/${id}/register`, { method: "POST", body: { count: optionsData.registrationBatch } }));
    },
    [sync, call]
  );

  const addUpdate = useCallback((input: NewUpdateInput) => {
    setUpdates((list) => [
      { id: Date.now(), c: input.category, t: input.title, b: input.message, w: input.audience, d: todayShort() },
      ...list,
    ]);
    sync(call("/api/v1/kmc/updates", { method: "POST", body: input }));
  }, [sync, call]);

  const setReportStatus = useCallback(
    (id: number, status: string) => {
      setReports((list) => list.map((r) => (r.id === id ? { ...r, s: status } : r)));
      sync(call(`/api/v1/reports/${id}`, { method: "PATCH", body: { status } }));
    },
    [sync, call]
  );

  const value: KmcContextValue = useMemo(
    () => ({
      ready,
      authed,
      signIn,
      user,
      saveProfile,
      changePassword,
      call,
      drivers,
      wards,
      wardStatus,
      vehicles,
      routes,
      schedule,
      programs,
      updates,
      reports,
      notifications,
      seen,
      markSeen: () => setSeen(true),
      selectedWard,
      selectWard: setSelectedWard,
      period,
      setPeriod,
      collectionTab,
      setCollectionTab,
      awarenessTab,
      setAwarenessTab,
      updateFilter,
      setUpdateFilter,
      reportStatusFilter,
      setReportStatusFilter,
      reportCategory,
      setReportCategory,
      openComplaints,
      driverOf,
      totalTons,
      countStatus,
      completeRoute,
      restartRoute,
      addVehicle,
      assignDriver,
      assignRoute,
      changeSchedule,
      addProgram,
      registerCitizens,
      addUpdate,
      setReportStatus,
    }),
    [
      ready, authed, signIn, user, saveProfile, changePassword, call, drivers, wards, wardStatus, vehicles, routes, schedule, programs, updates, reports, notifications, seen,
      selectedWard, period, collectionTab, awarenessTab, updateFilter, reportStatusFilter, reportCategory, openComplaints,
      driverOf, totalTons, countStatus, completeRoute, restartRoute, addVehicle, assignDriver, assignRoute, changeSchedule,
      addProgram, registerCitizens, addUpdate, setReportStatus,
    ]
  );

  return <KmcContext.Provider value={value}>{children}</KmcContext.Provider>;
}
