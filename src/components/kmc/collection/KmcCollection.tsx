"use client";

import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
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

export function KmcCollection() {
  const { collectionTab, setCollectionTab } = useKmc();
  const { openModal } = useUi();

  let action: React.ReactNode = null;
  if (collectionTab === "Vehicles") action = <Button onClick={() => openModal(<AddVehicleModal />)}>Add vehicle</Button>;
  if (collectionTab === "Schedule") action = <Button onClick={() => openModal(<ScheduleModal />)}>Create schedule</Button>;

  return (
    <>
      <PageHeader title="Collection" subtitle="Vehicles, routes, schedules and today's progress" action={action} />
      <Tabs items={options.collectionTabs} active={collectionTab} onChange={setCollectionTab} />
      <Box>
        {collectionTab === "Overview" && <OverviewTab />}
        {collectionTab === "Vehicles" && <VehiclesTab />}
        {collectionTab === "Routes" && <RoutesTab />}
        {collectionTab === "Schedule" && <ScheduleTab />}
      </Box>
    </>
  );
}
