"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Field";
import { KeyValueGrid } from "@/components/ui/KeyValueGrid";
import { DrawerContent } from "@/components/ui/Overlays";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";

export function VehicleDrawer({ vehicleId }: { vehicleId: string }) {
  const { vehicles, drivers, assignDriver, toggleMaintenance } = useWard();
  const { closeOverlay, toast } = useUi();
  const vehicle = vehicles.find((a) => a.id === vehicleId);
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
          { label: "Maintenance", value: vehicle.note, compact: true },
        ]}
      />
      <Label>Assign driver</Label>
      <Select options={drivers} value={driver} onChange={setDriver} />
      <p className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            assignDriver(vehicleId, driver);
            closeOverlay();
            toast(`Driver assigned to ${vehicleId}.`);
          }}
        >
          Assign driver
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const next = toggleMaintenance(vehicleId);
            closeOverlay();
            toast(`${vehicleId} is now ${next}.`);
          }}
        >
          {vehicle.st === "Maintenance" ? "Mark active" : "Send to maintenance"}
        </Button>
      </p>
    </DrawerContent>
  );
}
