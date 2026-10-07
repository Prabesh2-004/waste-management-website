"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Field";
import { KeyValueGrid } from "@/components/ui/KeyValueGrid";
import { DrawerContent } from "@/components/ui/Overlays";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";

export function VehicleDrawer({ vehicleId }: { vehicleId: string }) {
  const { vehicles, routes, drivers, assignDriver } = useKmc();
  const { closeOverlay, toast } = useUi();
  const vehicle = vehicles.find((a) => a.id === vehicleId);
  const route = routes.find((q) => q.v === vehicleId);
  const [driver, setDriver] = useState(vehicle?.drv ?? drivers[0]);
  if (!vehicle) return null;

  return (
    <DrawerContent>
      <h3>Vehicle</h3>
      <h2>{vehicle.id}</h2>
      <KeyValueGrid
        items={[
          { label: "Driver", value: vehicle.drv, compact: true },
          { label: "Capacity", value: `${vehicle.cap} t` },
          { label: "Status", value: vehicle.st, compact: true },
          { label: "Current route", value: route ? `Ward ${route.w} — Route ${route.n}` : "None", compact: true },
        ]}
      />
      <p className="text-[13px] text-mut">Maintenance: {vehicle.note}</p>
      <Label>Assign driver</Label>
      <Select options={drivers} value={driver} onChange={setDriver} />
      <p>
        <Button
          onClick={() => {
            assignDriver(vehicleId, driver);
            closeOverlay();
            toast(`Driver assigned to ${vehicleId}.`);
          }}
        >
          Assign driver
        </Button>
      </p>
    </DrawerContent>
  );
}
