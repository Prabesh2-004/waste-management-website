"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { exceptionReasonFor, summarizeRoutes, stopMetrics, type RouteSummary, type Stop, type StopStatus } from "@/lib/collection";
import { DEMO_DATE } from "@/data/shared";
import { INITIAL_STOPS, ROUTES } from "@/data/ward";

interface WardState {
  stops: Stop[];
  routes: RouteSummary[];
  metrics: ReturnType<typeof stopMetrics>;
  updateStop: (stopId: string, status: StopStatus) => void;
  /** Route whose stops are open in the update dialog, or null. */
  stopsRouteId: string | null;
  openStops: (routeId: string) => void;
  closeStops: () => void;
}

const WardContext = createContext<WardState | null>(null);

export function useWard(): WardState {
  const ctx = useContext(WardContext);
  if (!ctx) throw new Error("useWard must be used inside WardProvider");
  return ctx;
}

/** Holds the ward's collection stops. Dashboard and Collection read the same data. */
export function WardProvider({ children }: { children: React.ReactNode }) {
  const [stops, setStops] = useState(INITIAL_STOPS);
  const [stopsRouteId, setStopsRouteId] = useState<string | null>(null);

  const updateStop = useCallback((stopId: string, status: StopStatus) => {
    setStops((list) =>
      list.map((s) => {
        if (s.stopId !== stopId) return s;
        const confirmed = status === "Completed" || status === "In progress";
        return {
          ...s,
          status,
          updatedAt: confirmed ? `${DEMO_DATE}T10:00:00` : null,
          exceptionReason: exceptionReasonFor(status, true),
          lastModifiedBy: "Ward Official",
        };
      })
    );
  }, []);

  const openStops = useCallback((routeId: string) => setStopsRouteId(routeId), []);
  const closeStops = useCallback(() => setStopsRouteId(null), []);

  const value = useMemo(
    () => ({ stops, routes: summarizeRoutes(ROUTES, stops), metrics: stopMetrics(stops), updateStop, stopsRouteId, openStops, closeStops }),
    [stops, updateStop, stopsRouteId, openStops, closeStops]
  );

  return <WardContext.Provider value={value}>{children}</WardContext.Provider>;
}
