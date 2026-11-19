"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, LayerGroup, LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, Maximize2 } from "lucide-react";
import { isLive } from "@/lib/eta";
import { cn } from "@/lib/cn";
import type { LatLng, LiveVehicle, RouteDetail } from "@/types/live";

type Leaflet = typeof import("leaflet");

export const ROUTE_COLOURS: Record<string, string> = {
  Completed: "#16a34a",
  "In Progress": "#2563eb",
  Delayed: "#d97706",
  Incomplete: "#dc2626",
  Upcoming: "#64748b",
};

const TRUCK_SVG =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>';

interface LiveMapProps {
  routes: RouteDetail[];
  vehicles?: LiveVehicle[];
  /** This device's position (driver section). */
  me?: (LatLng & { accuracy?: number | null }) | null;
  /** Highlight one route and fit the map to it. */
  focusRouteId?: number | null;
  /** Ward markers for the city-wide view. */
  centres?: Record<string, [number, number]>;
  liveSeconds?: number;
  /** Keep panning to `me` as it moves. */
  follow?: boolean;
  className?: string;
  onRouteClick?: (route: RouteDetail) => void;
}

function stopIcon(L: Leaflet, seq: number, status: string, colour: string, dim: boolean) {
  const done = status === "Collected";
  const skipped = status === "Skipped";
  const bg = done ? colour : skipped ? "#94a3b8" : "#fff";
  const fg = done || skipped ? "#fff" : colour;
  return L.divIcon({
    className: "map-pin",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${bg};border:2.5px solid ${skipped ? "#94a3b8" : colour};color:${fg};font:700 11px/19px system-ui;text-align:center;box-shadow:0 1px 3px #0003;opacity:${dim ? 0.55 : 1}">${done ? "✓" : seq}</div>`,
  });
}

function truckIcon(L: Leaflet, label: string, colour: string, live: boolean) {
  return L.divIcon({
    className: "map-pin",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `<div style="position:relative;width:36px;height:36px">
      ${live ? `<span class="truck-pulse" style="position:absolute;inset:0;border-radius:50%;background:${colour}"></span>` : ""}
      <div style="position:absolute;inset:2px;border-radius:50%;background:${live ? colour : "#64748b"};border:3px solid #fff;display:grid;place-items:center;box-shadow:0 2px 6px #0004">${TRUCK_SVG}</div>
      <span style="position:absolute;left:50%;top:38px;transform:translateX(-50%);white-space:nowrap;background:#fff;color:#12302a;border-radius:8px;padding:1px 6px;font:700 11px system-ui;box-shadow:0 1px 3px #0003">${label}</span>
    </div>`,
  });
}

function meIcon(L: Leaflet) {
  return L.divIcon({
    className: "map-pin",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: '<div style="position:relative;width:22px;height:22px"><span class="truck-pulse" style="position:absolute;inset:0;border-radius:50%;background:#2563eb"></span><div style="position:absolute;inset:3px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 1px 4px #0005"></div></div>',
  });
}

function wardIcon(L: Leaflet, n: string) {
  return L.divIcon({
    className: "map-pin",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `<div style="width:30px;height:30px;border-radius:10px;background:#15824c22;border:1.5px solid #15824c88;color:#0e6a3c;font:700 11px/27px system-ui;text-align:center">${n}</div>`,
  });
}

/** Leaflet map with collection routes, numbered stops, trucks and (optionally) this device. */
export function LiveMap({ routes, vehicles = [], me, focusRouteId, centres, liveSeconds = 120, follow, className, onRouteClick }: LiveMapProps) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const lib = useRef<Leaflet | null>(null);
  const layers = useRef<{ routes: LayerGroup; trucks: LayerGroup; me: LayerGroup } | null>(null);
  const fitted = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [tileError, setTileError] = useState(false);
  const meRef = useRef(me);
  meRef.current = me;

  // Create the map once (Leaflet needs `window`, so it is loaded in the browser only).
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      const L = (mod.default ?? mod) as Leaflet;
      if (cancelled || !el.current || map.current) return;
      lib.current = L;
      const m = L.map(el.current, { zoomControl: false, attributionControl: true }).setView([27.7, 85.33], 13);
      L.control.zoom({ position: "topright" }).addTo(m);
      // Standard OpenStreetMap tiles (no API key). Dark mode dims them with a CSS filter.
      const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        className: "osm-tiles",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      });
      let failures = 0;
      tiles.on("tileerror", () => {
        if (++failures === 4) setTileError(true);
      });
      tiles.on("tileload", () => setTileError(false));
      tiles.addTo(m);
      layers.current = { routes: L.layerGroup().addTo(m), trucks: L.layerGroup().addTo(m), me: L.layerGroup().addTo(m) };
      map.current = m;
      setReady(true);
    });
    return () => {
      cancelled = true;
      // Stop running pan/zoom animations first: their callbacks would touch the removed map.
      map.current?.stop();
      map.current?.off();
      map.current?.remove();
      map.current = null;
      layers.current = null;
    };
  }, []);

  // Keep the map sized to its box (it may start hidden in a tab or a drawer).
  useEffect(() => {
    if (!ready || !el.current) return;
    const ro = new ResizeObserver(() => map.current?.invalidateSize());
    ro.observe(el.current);
    return () => ro.disconnect();
  }, [ready]);

  // Routes, stops and ward markers.
  useEffect(() => {
    const L = lib.current;
    const m = map.current;
    if (!ready || !L || !m || !layers.current) return;
    const group = layers.current.routes;
    group.clearLayers();
    if (centres) {
      Object.entries(centres).forEach(([n, [lat, lng]]) => L.marker([lat, lng], { icon: wardIcon(L, n), interactive: false }).addTo(group));
    }
    const ordered = [...routes].sort((a, b) => Number(a.id === focusRouteId) - Number(b.id === focusRouteId));
    ordered.forEach((r) => {
      const colour = ROUTE_COLOURS[r.status] ?? "#64748b";
      const dim = focusRouteId != null && r.id !== focusRouteId;
      const pts = r.stops.map((s) => [s.lat, s.lng] as [number, number]);
      if (pts.length > 1) {
        const line = L.polyline(pts, {
          color: colour,
          weight: dim ? 3 : 5,
          opacity: dim ? 0.35 : 0.85,
          dashArray: r.status === "Upcoming" ? "8 8" : undefined,
        }).addTo(group);
        line.bindTooltip(`Ward ${r.ward} · Route ${r.n} · ${r.area} (${r.status})`, { sticky: true });
        if (onRouteClick) line.on("click", () => onRouteClick(r));
      }
      r.stops.forEach((s) => {
        L.marker([s.lat, s.lng], { icon: stopIcon(L, s.seq, s.status, colour, dim), zIndexOffset: dim ? 0 : 100 })
          .bindPopup(`<b>${s.seq}. ${s.name}</b><br>Route ${r.n} · ${s.status}`)
          .addTo(group);
      });
    });
    // Fit once per focus change (not on every poll, so people can pan around).
    const key = `${focusRouteId ?? "all"}:${routes.length}`;
    if (fitted.current !== key) {
      const focus = routes.filter((r) => focusRouteId == null || r.id === focusRouteId);
      const points: [number, number][] = focus.flatMap((r) => r.stops.map((s) => [s.lat, s.lng] as [number, number]));
      if (centres && focusRouteId == null) Object.values(centres).forEach((c) => points.push(c));
      if (meRef.current) points.push([meRef.current.lat, meRef.current.lng]);
      if (points.length) {
        m.fitBounds(points as LatLngBoundsExpression, { padding: [36, 36], maxZoom: 16 });
        fitted.current = key;
      }
    }
  }, [ready, routes, focusRouteId, centres, onRouteClick]);

  // Trucks.
  useEffect(() => {
    const L = lib.current;
    if (!ready || !L || !layers.current) return;
    const group = layers.current.trucks;
    group.clearLayers();
    vehicles.forEach((v) => {
      if (!v.location) return;
      const route = routes.find((r) => r.vehicle === v.id && r.status !== "Completed") ?? routes.find((r) => r.vehicle === v.id);
      const colour = ROUTE_COLOURS[route?.status ?? ""] ?? "#15824c";
      const live = isLive(v.location.at, liveSeconds);
      L.marker([v.location.lat, v.location.lng], { icon: truckIcon(L, v.id, colour, live), zIndexOffset: 500 })
        .bindPopup(
          `<b>${v.id}</b> · ${v.drv || "No driver"}<br>${route ? `Ward ${route.ward} · Route ${route.n} (${route.status})<br>` : ""}${
            live ? "Live GPS" : "Last GPS fix"
          }: ${v.location.at ? new Date(v.location.at).toLocaleTimeString() : "unknown"}`
        )
        .addTo(group);
    });
  }, [ready, vehicles, routes, liveSeconds]);

  // This device.
  useEffect(() => {
    const L = lib.current;
    const m = map.current;
    if (!ready || !L || !m || !layers.current) return;
    const group = layers.current.me;
    group.clearLayers();
    if (!me) return;
    if (me.accuracy && me.accuracy < 2000) {
      L.circle([me.lat, me.lng], { radius: me.accuracy, color: "#2563eb", weight: 1, fillOpacity: 0.08 }).addTo(group);
    }
    L.marker([me.lat, me.lng], { icon: meIcon(L), zIndexOffset: 1000 }).bindTooltip("You").addTo(group);
    if (follow) m.panTo([me.lat, me.lng], { animate: true });
  }, [ready, me, follow]);

  const recentre = () => {
    const m = map.current;
    if (!m) return;
    if (me) return void m.setView([me.lat, me.lng], 16, { animate: true });
    fitted.current = null;
    const focus = routes.filter((r) => focusRouteId == null || r.id === focusRouteId);
    const pts = focus.flatMap((r) => r.stops.map((s) => [s.lat, s.lng] as [number, number]));
    if (pts.length) m.fitBounds(pts, { padding: [36, 36], maxZoom: 16 });
  };

  return (
    <div className={cn("relative isolate overflow-hidden rounded-2xl border border-line", className)}>
      <div ref={el} className="h-full w-full" aria-label="Collection map" role="region" />
      <div className="absolute bottom-3 right-3 z-[3] flex flex-col gap-2">
        <button
          type="button"
          onClick={recentre}
          aria-label={me ? "Centre on my position" : "Show whole route"}
          className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-ac shadow-card"
        >
          {me ? <LocateFixed size={19} /> : <Maximize2 size={18} />}
        </button>
      </div>
      {tileError && (
        <div className="absolute inset-x-3 top-3 z-[3] rounded-xl bg-surface/95 px-3 py-2 text-xs text-mut shadow-card">
          Map tiles could not load (offline?). Routes and trucks are still shown.
        </div>
      )}
    </div>
  );
}

export function MapLegend({ className }: { className?: string }) {
  const items: [string, string][] = [
    ["Completed", ROUTE_COLOURS.Completed],
    ["In progress", ROUTE_COLOURS["In Progress"]],
    ["Delayed", ROUTE_COLOURS.Delayed],
    ["Incomplete", ROUTE_COLOURS.Incomplete],
    ["Upcoming", ROUTE_COLOURS.Upcoming],
  ];
  return (
    <div className={cn("flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-mut", className)}>
      {items.map(([label, colour]) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: colour }} />
          {label}
        </span>
      ))}
    </div>
  );
}
