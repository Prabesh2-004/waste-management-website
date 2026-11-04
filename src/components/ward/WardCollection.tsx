"use client";

import { useState } from "react";
import { CalendarDays, CircleCheck, CircleDashed, CircleX, Download, MapPin, Route, TriangleAlert, Truck } from "lucide-react";
import { Badge, WardStatus } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Donut, LegendRow } from "@/components/ui/Donut";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { ListItem } from "@/components/ui/ListItem";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/context/ToastContext";
import { useWard } from "@/context/WardContext";
import { TODAY_LABEL } from "@/data/shared";
import { COLLECTION_EXCEPTIONS } from "@/data/ward";
import type { RouteStatus } from "@/lib/collection";
import { downloadCsv } from "@/lib/csv";
import { STATUS_COLORS } from "@/lib/status";
import { RouteMap } from "./RouteMap";
import { HelpBox, QuickActions, WardPage } from "./WardPage";

type RouteFilter = "All" | Exclude<RouteStatus, "Scheduled">;
const FILTERS: RouteFilter[] = ["All", "Completed", "In progress", "Delayed", "Missed"];
const VIEWS = [
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "history", label: "History" },
] as const;

export function WardCollection() {
  const { routes, stops, metrics, openStops } = useWard();
  const toast = useToast();
  const [filter, setFilter] = useState<RouteFilter>("All");

  const pct = (n: number) => (metrics.total ? Math.round((n / metrics.total) * 100) : 0);
  const shownRoutes = routes.filter((r) => filter === "All" || r.status === filter);
  const firstOpenRoute = routes.find((r) => r.status !== "Completed") ?? routes[0];

  const exportStops = () =>
    downloadCsv(
      "ward-17-collection-report.csv",
      ["Stop", "Route", "Location", "Time", "Waste type", "Status", "Exception", "Last modified by"],
      stops.map((s) => [s.stopId, s.routeId, s.location, s.scheduledTime, s.wasteType, s.status, s.exceptionReason ?? "", s.lastModifiedBy])
    );

  const rail = (
    <>
      <QuickActions
        actions={[
          { title: "Update collection status", description: "Add driver updates or notes", icon: <Truck />, onClick: () => openStops(firstOpenRoute.routeId) },
          { title: "Report a missed collection", description: "Log and notify for follow-up", icon: <CalendarDays />, onClick: () => toast("Missed collection logged for follow-up") },
          { title: "View vehicle locations", description: "See current GPS locations", icon: <MapPin />, onClick: () => toast("GPS locations unavailable in demo data") },
          { title: "Download collection report", description: "Export as CSV", icon: <Download />, onClick: exportStops },
        ]}
      />
      <HelpBox title="Need help?">
        Contact KMC for vehicle issues, route changes and support.
        <br />
        <button type="button" className="mt-1 font-medium text-brand hover:underline" onClick={() => toast("Opening KMC contact details")}>
          View contact details →
        </button>
      </HelpBox>
      <Card className="flex-1">
        <CardHeader title="Today’s collection status" />
        <div className="flex items-center gap-3">
          <Donut
            size={90}
            segments={[
              { value: metrics.completionRate, color: "var(--brand)" },
              { value: 100 - metrics.completionRate, color: "#d8eee3" },
            ]}
          >
            <b className="text-base">{metrics.completionRate}%</b>
          </Donut>
          <div>
            <span className="text-xs text-muted">Completed stops</span>
            <b className="block text-base">
              {metrics.completed} / {metrics.total}
            </b>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          <LegendRow color={STATUS_COLORS.Completed} label="Completed" value={metrics.completed} />
          <LegendRow color={STATUS_COLORS["In progress"]} label="In progress" value={metrics.progress} />
          <LegendRow color={STATUS_COLORS.Delayed} label="Delayed" value={metrics.delayed} />
          <LegendRow color={STATUS_COLORS.Missed} label="Missed" value={metrics.missed} />
        </div>
        <small className="mt-auto pt-3 text-xs text-muted">Demo data · Delay threshold: 30 minutes</small>
      </Card>
    </>
  );

  return (
    <WardPage rail={rail}>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3.5 py-1.5">
        <Tabs
          variant="underline"
          divider={false}
          items={[...VIEWS]}
          value="today"
          onChange={(v) => v !== "today" && toast(`${VIEWS.find((x) => x.value === v)?.label} view – coming soon`)}
        />
        <span className="flex items-center gap-1.5 text-[13px] text-muted">
          <CalendarDays className="size-4" />
          {TODAY_LABEL}
        </span>
      </div>

      <KpiGrid columns={5}>
        <Kpi square icon={<Route />} label="Scheduled stops" value={metrics.total} note="Today" trend="muted" />
        <Kpi square icon={<CircleCheck />} label="Completed" value={metrics.completed} note={`${pct(metrics.completed)}% of stops`} trend="muted" />
        <Kpi square tone="info" icon={<CircleDashed />} label="In Progress" value={metrics.progress} note={`${pct(metrics.progress)}% of stops`} trend="muted" />
        <Kpi square tone="warn" icon={<TriangleAlert />} label="Delayed" value={metrics.delayed} note="30+ min late" trend="muted" />
        <Kpi square tone="danger" icon={<CircleX />} label="Missed" value={metrics.missed} note="Service window ended" trend="muted" />
      </KpiGrid>

      <div className="grid flex-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader title="Live collection view" badge={<Badge>GPS + Driver updates</Badge>} />
          <RouteMap />
        </Card>
        <Card>
          <CardHeader title="Routes & collection progress" />
          <Tabs
            variant="chip"
            className="mb-1.5"
            value={filter}
            onChange={setFilter}
            items={FILTERS.map((f) => ({
              value: f,
              label: `${f} (${f === "All" ? routes.length : routes.filter((r) => r.status === f).length})`,
            }))}
          />
          <div className="min-h-0 flex-1 overflow-y-auto">
            {shownRoutes.map((r) => (
              <ListItem
                key={r.routeId}
                leading={
                  <span className="grid size-9 flex-none place-items-center rounded-[10px]" style={{ background: `${r.color}22` }}>
                    <i className="size-2.5 rounded-full" style={{ background: r.color }} />
                  </span>
                }
                title={r.name}
                subtitle={`${r.vehicle} · ${r.driver} · ${r.done} / ${r.total} stops`}
                trailing={<WardStatus status={r.status} />}
                onClick={() => openStops(r.routeId)}
              />
            ))}
            {shownRoutes.length === 0 && <p className="py-4 text-center text-muted">No routes</p>}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Collection exceptions" />
        <DataTable
          rows={[...COLLECTION_EXCEPTIONS]}
          rowKey={(x) => x.type}
          columns={[
            { header: "Type", cell: (x) => <Badge tone={x.tone}>{x.type}</Badge> },
            { header: "Location / Route", cell: (x) => x.where },
            { header: "Details", cell: (x) => x.details },
            { header: "Time", cell: (x) => `Since ${x.since}`, className: "whitespace-nowrap" },
            {
              header: "Action",
              cell: (x) => (
                <Button variant="soft" size="sm" className="whitespace-nowrap" onClick={() => toast(x.action)}>
                  {x.action} →
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </WardPage>
  );
}
