"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import userData from "@/data/ward/user.json";
import driversData from "@/data/ward/drivers.json";
import vehiclesData from "@/data/ward/vehicles.json";
import routesData from "@/data/ward/routes.json";
import scheduleData from "@/data/ward/schedule.json";
import programsData from "@/data/ward/programs.json";
import updatesData from "@/data/ward/updates.json";
import reportsData from "@/data/ward/reports.json";
import notificationsData from "@/data/ward/notifications.json";
import options from "@/data/ward/options.json";
import meta from "@/data/shared/meta.json";
import { formatTime } from "@/lib/format";
import type { AwarenessProgram, NotificationItem, UpdateItem, UserProfile, Vehicle, WardUserProfile } from "@/types";
import type { ScheduleRow, WardProgramInput, WardReport, WardRoute } from "@/types/ward";

interface WardContextValue {
  authed: boolean;
  needsWardSelection: boolean;
  signIn: (mode: "login" | "signup", profile: UserProfile) => void;
  enterWard: (ward: number) => void;
  user: WardUserProfile;
  saveProfile: (profile: UserProfile) => void;
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

function initialSchedule(): Record<number, string> {
  const out: Record<number, string> = {};
  (scheduleData as ScheduleRow[]).forEach((s) => {
    out[s.route] = s.time;
  });
  return out;
}

export function WardProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [needsWardSelection, setNeedsWardSelection] = useState(false);
  const [user, setUser] = useState<WardUserProfile>(userData);
  const [vehicles, setVehicles] = useState<Vehicle[]>(vehiclesData as Vehicle[]);
  const [routes, setRoutes] = useState<WardRoute[]>(routesData as WardRoute[]);
  const [schedule, setSchedule] = useState<Record<number, string>>(initialSchedule);
  const [programs, setPrograms] = useState<AwarenessProgram[]>(programsData as AwarenessProgram[]);
  const [updates, setUpdates] = useState<UpdateItem[]>(updatesData as UpdateItem[]);
  const [reports, setReports] = useState<WardReport[]>(reportsData as WardReport[]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(notificationsData);
  const [seen, setSeen] = useState(false);
  const [collectionTab, setCollectionTab] = useState("Overview");
  const [awarenessTab, setAwarenessTab] = useState(options.awarenessTabs[0]);
  const [updateFilter, setUpdateFilter] = useState("All");
  const [reportStatusFilter, setReportStatusFilter] = useState("All");
  const [reportCategory, setReportCategory] = useState("All");

  const signIn = useCallback((mode: "login" | "signup", profile: UserProfile) => {
    if (mode === "signup") setUser({ name: profile.name, role: profile.role, email: profile.email, ward: userData.ward });
    setNeedsWardSelection(true);
  }, []);

  const enterWard = useCallback((ward: number) => {
    setUser((u) => ({ ...u, ward }));
    setNeedsWardSelection(false);
    setAuthed(true);
  }, []);

  const saveProfile = useCallback((profile: UserProfile) => setUser((u) => ({ ...u, ...profile })), []);

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

  const startRoute = useCallback((n: number) => setRouteStatus(n, { s: "In Progress" }), [setRouteStatus]);

  const submitDriverUpdate = useCallback(
    (n: number, outcome: string, kg: number) => {
      const route = routes.find((x) => x.n === n);
      if (!route) return "";
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
            d: meta.todayShort,
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
    [routes, tons, setRouteStatus]
  );

  const assignVehicleToRoute = useCallback((n: number, vehicleId: string) => setRouteStatus(n, { v: vehicleId }), [setRouteStatus]);

  const addVehicle = useCallback((vehicle: Vehicle) => setVehicles((list) => [...list, vehicle]), []);

  const assignDriver = useCallback(
    (vehicleId: string, driver: string) => setVehicles((list) => list.map((v) => (v.id === vehicleId ? { ...v, drv: driver } : v))),
    []
  );

  const toggleMaintenance = useCallback(
    (vehicleId: string) => {
      const current = vehicles.find((a) => a.id === vehicleId);
      const next = current?.st === "Maintenance" ? "Active" : "Maintenance";
      setVehicles((list) => list.map((v) => (v.id === vehicleId ? { ...v, st: next } : v)));
      return next;
    },
    [vehicles]
  );

  const changeSchedule = useCallback(
    (route: number, time: string) => {
      const old = schedule[route];
      setSchedule((s) => ({ ...s, [route]: time }));
      if (old !== time) {
        setUpdates((list) => [
          {
            id: Date.now(),
            c: "Collection",
            t: `Collection timing changed for Route ${route}`,
            b: `Previous: ${formatTime(old)} → New: ${formatTime(time)}`,
            d: meta.todayShort,
          },
          ...list,
        ]);
        setNotifications((list) => [{ text: `Collection schedule changed for Route ${route}`, href: "/ward/updates" }, ...list]);
      }
    },
    [schedule]
  );

  const announce = useCallback(
    (p: { n: string; d: string; tm: string; loc?: string }) => {
      setUpdates((list) => [
        {
          id: Date.now() + 1,
          c: "Awareness",
          t: `${p.n} in Ward ${user.ward}`,
          b: `${p.d}, ${p.tm} at ${p.loc}. Register in the Citizen app.`,
          d: meta.todayShort,
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
    },
    [announce]
  );

  const decideProgram = useCallback(
    (id: number, approve: boolean) => {
      const p = programs.find((x) => x.id === id);
      if (!p) return;
      setPrograms((list) =>
        list.map((x) => (x.id === id ? { ...x, ap: approve ? "Approved" : "Needs changes", s: approve ? "Scheduled" : x.s } : x))
      );
      if (approve) announce(p);
    },
    [programs, announce]
  );

  const patchProgram = useCallback(
    (id: number, patch: Partial<AwarenessProgram>) => setPrograms((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    []
  );

  const resubmitProgram = useCallback((id: number) => patchProgram(id, { ap: "Pending KMC review" }), [patchProgram]);

  const startProgram = useCallback(
    (id: number) => {
      patchProgram(id, { s: "Ongoing" });
      setAwarenessTab("All");
    },
    [patchProgram]
  );

  const completeProgram = useCallback(
    (id: number, attended: number) => {
      patchProgram(id, { att: attended, s: "Completed" });
      setAwarenessTab("Completed");
      return attended;
    },
    [patchProgram]
  );

  const addUpdate = useCallback((input: { category: string; title: string; message: string }) => {
    setUpdates((list) => [{ id: Date.now(), c: input.category, t: input.title, b: input.message, d: meta.todayShort }, ...list]);
  }, []);

  const simulateComplaint = useCallback(() => {
    const c = options.simulatedComplaint;
    setReports((list) => [
      { id: Date.now(), ty: c.ty, src: c.src, d: meta.todayShort, s: "Pending", rt: c.rt, ds: c.ds, c: c.c, loc: c.loc, notes: [] },
      ...list,
    ]);
    setNotifications((list) => [{ text: "New citizen complaint received", href: "/ward/reports" }, ...list]);
    setSeen(false);
  }, []);

  const saveReport = useCallback((id: number, status: string, note: string) => {
    setReports((list) => list.map((r) => (r.id === id ? { ...r, s: status, notes: note ? [...r.notes, note] : r.notes } : r)));
  }, []);

  const value: WardContextValue = useMemo(
    () => ({
      authed, needsWardSelection, signIn, enterWard, user, saveProfile,
      wardName: `Ward ${user.ward}`,
      drivers: driversData,
      vehicles, routes, schedule, programs, updates, reports, notifications, seen,
      markSeen: () => setSeen(true),
      collectionTab, setCollectionTab, awarenessTab, setAwarenessTab, updateFilter, setUpdateFilter,
      reportStatusFilter, setReportStatusFilter, reportCategory, setReportCategory,
      tons, openComplaints, driverOf, doneCount, completion, startRoute, submitDriverUpdate, assignVehicleToRoute,
      addVehicle, assignDriver, toggleMaintenance, changeSchedule, createProgram, decideProgram, resubmitProgram,
      startProgram, completeProgram, addUpdate, simulateComplaint, saveReport,
    }),
    [
      authed, needsWardSelection, signIn, enterWard, user, saveProfile, vehicles, routes, schedule, programs, updates, reports,
      notifications, seen, collectionTab, awarenessTab, updateFilter, reportStatusFilter, reportCategory, tons, openComplaints,
      driverOf, doneCount, completion, startRoute, submitDriverUpdate, assignVehicleToRoute, addVehicle, assignDriver,
      toggleMaintenance, changeSchedule, createProgram, decideProgram, resubmitProgram, startProgram, completeProgram,
      addUpdate, simulateComplaint, saveReport,
    ]
  );

  return <WardContext.Provider value={value}>{children}</WardContext.Provider>;
}
