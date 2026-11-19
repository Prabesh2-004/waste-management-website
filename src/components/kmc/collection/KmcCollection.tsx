"use client";

import { AlertTriangle, CheckCircle2, Clock, Plus, Trash2, XCircle } from "lucide-react";
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
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";
import options from "@/data/shared/options.json";
import meta from "@/data/shared/meta.json";

export function KmcCollection() {
  const { collectionTab, setCollectionTab, countStatus, totalTons } = useKmc();
  const { openModal } = useUi();
  const share = (n: number) => `${Math.round((n / meta.wardCount) * 100)}% of wards`;

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
        title="KMC Collection Management"
        subtitle={`Monitor collection operations across all ${meta.wardCount} wards, track trucks and address exceptions`}
        action={action}
      />
      <StatStrip
        items={[
          { label: "Waste collected", value: `${totalTons().toFixed(0)} t`, hint: "Today", icon: <Trash2 size={20} /> },
          { label: "Completed", value: String(countStatus("Completed")), hint: share(countStatus("Completed")), icon: <CheckCircle2 size={20} />, tone: "G" },
          { label: "In progress", value: String(countStatus("In Progress")), hint: share(countStatus("In Progress")), icon: <Clock size={20} />, tone: "B" },
          { label: "Delayed", value: String(countStatus("Delayed")), hint: share(countStatus("Delayed")), icon: <AlertTriangle size={20} />, tone: "A" },
          { label: "Incomplete", value: String(countStatus("Incomplete")), hint: share(countStatus("Incomplete")), icon: <XCircle size={20} />, tone: "R" },
        ]}
      />
      <Tabs items={options.collectionTabs} active={collectionTab} onChange={setCollectionTab} />
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
