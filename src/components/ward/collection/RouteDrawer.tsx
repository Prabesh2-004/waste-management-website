"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Field";
import { KeyValueGrid } from "@/components/ui/KeyValueGrid";
import { DrawerContent } from "@/components/ui/Overlays";
import { WardStatus } from "../WardStatus";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import { formatTime } from "@/lib/format";

export function RouteDrawer({ routeNumber }: { routeNumber: number }) {
  const { routes, vehicles, schedule, wardName, driverOf, assignVehicleToRoute } = useWard();
  const { closeOverlay, toast } = useUi();
  const route = routes.find((x) => x.n === routeNumber);
  const vehicleOptions = vehicles.filter((x) => x.st !== "Maintenance").map((x) => x.id);
  const [vehicle, setVehicle] = useState(route && vehicleOptions.includes(route.v) ? route.v : vehicleOptions[0]);
  if (!route) return null;

  return (
    <DrawerContent>
      <h3>Route {route.n}</h3>
      <h2>
        {route.area}, {wardName}
      </h2>
      <KeyValueGrid
        items={[
          { label: "Status", value: <WardStatus status={route.s} />, compact: true },
          { label: "Pickup time", value: formatTime(schedule[route.n]) },
          { label: "Vehicle", value: route.v, compact: true },
          { label: "Driver", value: driverOf(route.v), compact: true },
        ]}
      />
      <Label>Assign vehicle</Label>
      <Select options={vehicleOptions} value={vehicle} onChange={setVehicle} />
      <p>
        <Button
          onClick={() => {
            assignVehicleToRoute(route.n, vehicle);
            closeOverlay();
            toast(`Vehicle assigned to Route ${route.n}.`);
          }}
        >
          Assign vehicle
        </Button>
      </p>
    </DrawerContent>
  );
}
