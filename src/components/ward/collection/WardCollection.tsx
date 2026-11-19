"use client";

import { AlertTriangle, CheckCircle2, Clock, Plus, Route as RouteIcon, XCircle } from "lucide-react";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatStrip } from "@/components/ui/StatStrip";
import { Tabs } from "@/components/ui/Tabs";
import { OverviewTab } from "./OverviewTab";
import { VehiclesTab } from "./VehiclesTab";
import { RoutesTab } from "./RoutesTab";
import { ScheduleTab } from "./ScheduleTab";
import { AddVehicleModal } from "./AddVehicleModal";
import { ScheduleModal } from "./ScheduleModal";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import shared from "@/data/shared/options.json";

export function WardCollection() {
  const { collectionTab, setCollectionTab, wardName, routes } = useWard();
  const { openModal } = useUi();
  const count = (s: string) => routes.filter((r) => r.s === s).length;
  const share = (n: number) => (routes.length ? `${Math.round((n / routes.length) * 100)}% of total` : "");

  let action: React.ReactNode = null;
  if (collectionTab === "Vehicles")
    action = (
      <Button onClick={() => openModal(<AddVehicleModal />)}>
        <Plus size={16} /> Add vehicle
      </Button>
    );
  if (collectionTab === "Schedule")
    action = (
      <Button onClick={() => openModal(<ScheduleModal />)}>
        <Plus size={16} /> Create schedule
      </Button>
    );

  return (
    <>
      <PageHeader
        title="Collection Management"
        subtitle={`Track collection progress, vehicles, routes and schedule in ${wardName}`}
        action={action}
      />
      <StatStrip
        items={[
          { label: "Total routes", value: String(routes.length), hint: "Scheduled today", icon: <RouteIcon size={20} /> },
          { label: "Completed", value: String(count("Completed")), hint: share(count("Completed")), icon: <CheckCircle2 size={20} />, tone: "G" },
          { label: "In progress", value: String(count("In Progress")), hint: share(count("In Progress")), icon: <Clock size={20} />, tone: "B" },
          { label: "Delayed", value: String(count("Delayed")), hint: share(count("Delayed")), icon: <AlertTriangle size={20} />, tone: "A" },
          { label: "Incomplete", value: String(count("Incomplete")), hint: share(count("Incomplete")), icon: <XCircle size={20} />, tone: "R" },
        ]}
      />
      <Tabs items={shared.collectionTabs} active={collectionTab} onChange={setCollectionTab} />
      {collectionTab === "Overview" ? (
        <OverviewTab />
      ) : (
        <Box>
          {collectionTab === "Vehicles" && <VehiclesTab />}
          {collectionTab === "Routes" && <RoutesTab />}
          {collectionTab === "Schedule" && <ScheduleTab />}
        </Box>
      )}
    </>
  );
}
