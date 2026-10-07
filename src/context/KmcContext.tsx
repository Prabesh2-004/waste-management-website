"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import userData from "@/data/kmc/user.json";
import driversData from "@/data/kmc/drivers.json";
import vehiclesData from "@/data/kmc/vehicles.json";
import routesData from "@/data/kmc/routes.json";
import programsData from "@/data/kmc/programs.json";
import updatesData from "@/data/kmc/updates.json";
import reportsData from "@/data/kmc/reports.json";
import notificationsData from "@/data/kmc/notifications.json";
import optionsData from "@/data/kmc/options.json";
import meta from "@/data/shared/meta.json";
import { initialSchedule, initialWardStatus, initialWards } from "@/lib/kmc";
import { formatTime } from "@/lib/format";
import type { AwarenessProgram, NotificationItem, UpdateItem, UserProfile, Vehicle } from "@/types";
import type { KmcReport, KmcRoute, NewProgramInput, NewUpdateInput, WardSchedule, WardStat } from "@/types/kmc";

interface KmcContextValue {
  authed: boolean;
  signIn: (mode: "login" | "signup", profile: UserProfile) => void;
  user: UserProfile;
  saveProfile: (profile: UserProfile) => void;
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
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<UserProfile>(userData);
  const [wards, setWards] = useState<WardStat[]>(initialWards);
  const [wardStatus, setWardStatus] = useState<Record<number, string>>(initialWardStatus);
  const [vehicles, setVehicles] = useState<Vehicle[]>(vehiclesData as Vehicle[]);
  const [routes, setRoutes] = useState<KmcRoute[]>(routesData as KmcRoute[]);
  const [schedule, setSchedule] = useState<Record<number, WardSchedule>>(initialSchedule);
  const [programs, setPrograms] = useState<AwarenessProgram[]>(programsData as AwarenessProgram[]);
  const [updates, setUpdates] = useState<UpdateItem[]>(updatesData as UpdateItem[]);
  const [reports, setReports] = useState<KmcReport[]>(reportsData as KmcReport[]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(notificationsData);
  const [seen, setSeen] = useState(false);
  const [selectedWard, setSelectedWard] = useState<number>(optionsData.defaultWard);
  const [period, setPeriod] = useState(optionsData.wardPeriods[0].label);
  const [collectionTab, setCollectionTab] = useState("Overview");
  const [awarenessTab, setAwarenessTab] = useState(optionsData.awarenessTabs[0]);
  const [updateFilter, setUpdateFilter] = useState("All");
  const [reportStatusFilter, setReportStatusFilter] = useState("All");
  const [reportCategory, setReportCategory] = useState("All");

  const signIn = useCallback((mode: "login" | "signup", profile: UserProfile) => {
    if (mode === "signup") setUser({ name: profile.name, role: profile.role, email: profile.email });
    setAuthed(true);
  }, []);

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
      return next;
    },
    [wards]
  );

  const restartRoute = useCallback((ward: number) => setWardStatus((s) => ({ ...s, [ward]: "In Progress" })), []);

  const addVehicle = useCallback((vehicle: Vehicle) => setVehicles((list) => [...list, vehicle]), []);

  const assignDriver = useCallback(
    (vehicleId: string, driver: string) => setVehicles((list) => list.map((v) => (v.id === vehicleId ? { ...v, drv: driver } : v))),
    []
  );

  const assignRoute = useCallback((ward: number, vehicleId: string, driver: string) => {
    setRoutes((list) => list.map((r) => (r.w === ward ? { ...r, v: vehicleId } : r)));
    setVehicles((list) => list.map((v) => (v.id === vehicleId ? { ...v, drv: driver } : v)));
  }, []);

  const changeSchedule = useCallback(
    (ward: number, time: string, kind: string) => {
      const old = schedule[ward].t;
      setSchedule((s) => ({ ...s, [ward]: { t: time, k: kind } }));
      if (old !== time) {
        setUpdates((list) => [
          {
            id: Date.now(),
            c: "Collection",
            t: `Collection timing changed for Ward ${ward}`,
            b: `Previous: ${formatTime(old)} → New: ${formatTime(time)}`,
            w: `Ward ${ward}`,
            d: meta.todayShort,
          },
          ...list,
        ]);
        setNotifications((list) => [{ text: `Schedule changed in Ward ${ward}`, href: "/kmc/updates" }, ...list]);
      }
    },
    [schedule]
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
        d: meta.todayShort,
      },
      ...list,
    ]);
    setAwarenessTab("Upcoming");
  }, []);

  const registerCitizens = useCallback(
    (id: number) =>
      setPrograms((list) => list.map((p) => (p.id === id ? { ...p, reg: p.reg + optionsData.registrationBatch } : p))),
    []
  );

  const addUpdate = useCallback((input: NewUpdateInput) => {
    setUpdates((list) => [
      { id: Date.now(), c: input.category, t: input.title, b: input.message, w: input.audience, d: meta.todayShort },
      ...list,
    ]);
  }, []);

  const setReportStatus = useCallback(
    (id: number, status: string) => setReports((list) => list.map((r) => (r.id === id ? { ...r, s: status } : r))),
    []
  );

  const value: KmcContextValue = useMemo(
    () => ({
      authed,
      signIn,
      user,
      saveProfile: setUser,
      drivers: driversData,
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
      authed, signIn, user, wards, wardStatus, vehicles, routes, schedule, programs, updates, reports, notifications, seen,
      selectedWard, period, collectionTab, awarenessTab, updateFilter, reportStatusFilter, reportCategory, openComplaints,
      driverOf, totalTons, countStatus, completeRoute, restartRoute, addVehicle, assignDriver, assignRoute, changeSchedule,
      addProgram, registerCitizens, addUpdate, setReportStatus,
    ]
  );

  return <KmcContext.Provider value={value}>{children}</KmcContext.Provider>;
}
