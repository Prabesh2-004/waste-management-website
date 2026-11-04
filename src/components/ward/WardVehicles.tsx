"use client";

import { useState } from "react";
import { Download, Plus, Route, Truck } from "lucide-react";
import { Badge, WardStatus } from "@/components/ui/Badge";
import { TextLink } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Donut, LegendRow } from "@/components/ui/Donut";
import { inputClass } from "@/components/ui/Field";
import { Kpi } from "@/components/ui/Kpi";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/context/ToastContext";
import { ROUTE_PLANS, TOTAL_VEHICLES, VEHICLE_REQUESTS, VEHICLES, type WardVehicle } from "@/data/ward";
import { downloadCsv } from "@/lib/csv";
import { STATUS_COLORS } from "@/lib/status";
import { HelpBox, QuickActions, WardPage } from "./WardPage";

type View = "vehicles" | "routes" | "requests";
type StatusFilter = "All" | WardVehicle["status"];

function RoutesCard({ onViewAll }: { onViewAll?: () => void }) {
  const toast = useToast();
  return (
    <Card>
      <CardHeader title="Routes" action={onViewAll && <TextLink onClick={onViewAll}>View all routes →</TextLink>} />
      <DataTable
        rows={ROUTE_PLANS}
        rowKey={(r) => r.route}
        onRowClick={(r) => toast(r.route)}
        columns={[
          { header: "Route", cell: (r) => <b>{r.route}</b>, className: "whitespace-nowrap" },
          { header: "Area / Locality", cell: (r) => r.area },
          { header: "Vehicle", cell: (r) => r.vehicle, className: "whitespace-nowrap" },
          { header: "Driver", cell: (r) => r.driver },
          { header: "Schedule", cell: (r) => r.schedule, className: "whitespace-nowrap" },
          { header: "Status", cell: (r) => <WardStatus status={r.status} /> },
        ]}
      />
    </Card>
  );
}

export function WardVehicles() {
  const toast = useToast();
  const [view, setView] = useState<View>("vehicles");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");

  const q = query.trim().toLowerCase();
  const vehicles = VEHICLES.filter(
    (v) => (status === "All" || v.status === status) && (!q || v.number.toLowerCase().includes(q) || v.driver.toLowerCase().includes(q))
  );

  const exportVehicles = () =>
    downloadCsv(
      "ward-17-vehicles.csv",
      ["Vehicle No.", "Type", "Capacity", "Driver", "Status", "Current Assignment"],
      VEHICLES.map((v) => [v.number, v.type, v.capacity, v.driver, v.status, v.assignment])
    );

  const rail = (
    <>
      <QuickActions
        actions={[
          { title: "Request new vehicle", description: "Submit a registration request", icon: <Plus />, onClick: () => toast("Vehicle request form – coming soon") },
          { title: "Create new route", description: "Plan and assign a collection route", icon: <Route />, onClick: () => toast("Route planner – coming soon") },
          { title: "View vehicle requests", description: "Check approval status", onClick: () => setView("requests") },
          { title: "Export vehicle list", description: "Download as CSV", icon: <Download />, onClick: exportVehicles },
        ]}
      />
      <HelpBox title="Need help?">
        Contact KMC for vehicle registration and approval support.
        <br />
        <button type="button" className="mt-1 font-medium text-brand hover:underline" onClick={() => toast("Opening KMC contact details")}>
          View contact details →
        </button>
      </HelpBox>
      <Card className="flex-1">
        <CardHeader title="Vehicle Status" />
        <div className="flex items-center gap-3.5">
          <Donut
            size={96}
            segments={[
              { value: 80, color: STATUS_COLORS.Completed },
              { value: 10, color: STATUS_COLORS.Delayed },
              { value: 10, color: STATUS_COLORS["In progress"] },
            ]}
          >
            <b className="block text-base">{TOTAL_VEHICLES}</b>
            <small className="text-xs text-muted">Total</small>
          </Donut>
          <div className="flex flex-1 flex-col gap-1.5">
            <LegendRow color={STATUS_COLORS.Completed} label="In service" value={8} />
            <LegendRow color={STATUS_COLORS.Delayed} label="Maintenance" value={1} />
            <LegendRow color={STATUS_COLORS["In progress"]} label="Available" value={2} />
          </div>
        </div>
      </Card>
    </>
  );

  return (
    <WardPage rail={rail}>
      <Tabs
        variant="underline"
        value={view}
        onChange={setView}
        items={[
          { value: "vehicles", label: <><Truck className="size-4" /> Vehicles</> },
          { value: "routes", label: "Routes" },
          { value: "requests", label: <>Vehicle Requests <Badge tone="danger">{VEHICLE_REQUESTS.length}</Badge></> },
        ]}
      />

      {view === "vehicles" && (
        <>
          <Card className="flex-1">
            <CardHeader
              title="Vehicles"
              action={
                <div className="flex flex-wrap gap-2">
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by vehicle no. or driver..."
                    aria-label="Search vehicles"
                    className={`${inputClass} w-56 max-w-full`}
                  />
                  <select aria-label="Filter by status" className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
                    <option value="All">All statuses</option>
                    <option>In service</option>
                    <option>Maintenance</option>
                    <option>Available</option>
                  </select>
                </div>
              }
            />
            <div className="mb-2.5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              <Kpi square icon={<Truck />} label="Total Vehicles" value={TOTAL_VEHICLES} note="6 assigned · 4 available" trend="muted" />
              <Kpi square icon={<Truck />} label="In Service" value="8" note="2 under maintenance" trend="muted" />
              <Kpi square icon={<Truck />} label="Pending Assignment" value="2" note="Ready for route assignment" trend="muted" />
              <Kpi square icon={<Truck />} label="Maintenance" value="1" note="Scheduled service" trend="muted" />
            </div>
            <DataTable
              rows={vehicles}
              rowKey={(v) => v.number}
              onRowClick={(v) => toast(`Vehicle ${v.number}`)}
              empty="No vehicles match your filters"
              columns={[
                {
                  header: "Vehicle No.",
                  cell: (v) => (
                    <b className="flex items-center gap-1.5 whitespace-nowrap">
                      <Truck className="size-4 text-brand" /> {v.number}
                    </b>
                  ),
                },
                { header: "Type", cell: (v) => v.type },
                { header: "Capacity", cell: (v) => v.capacity, className: "whitespace-nowrap" },
                { header: "Driver", cell: (v) => v.driver },
                { header: "Status", cell: (v) => <WardStatus status={v.status} /> },
                { header: "Current Assignment", cell: (v) => v.assignment },
              ]}
            />
            <span className="mt-2.5 text-xs text-muted">
              Showing {vehicles.length} of {TOTAL_VEHICLES} vehicles
            </span>
          </Card>
          <RoutesCard onViewAll={() => setView("routes")} />
        </>
      )}

      {view === "routes" && <RoutesCard />}

      {view === "requests" && (
        <Card className="flex-1">
          <CardHeader title="Vehicle Requests" subtitle="Registration requests sent to KMC for approval" />
          <DataTable
            rows={VEHICLE_REQUESTS}
            rowKey={(r) => r.ref}
            columns={[
              { header: "Ref", cell: (r) => <b>{r.ref}</b> },
              { header: "Vehicle", cell: (r) => `${r.vehicle} · ${r.capacity}` },
              { header: "Reason", cell: (r) => r.reason },
              { header: "Submitted", cell: (r) => r.submitted, className: "whitespace-nowrap" },
              { header: "Status", cell: (r) => <WardStatus status={r.status} /> },
            ]}
          />
        </Card>
      )}
    </WardPage>
  );
}
