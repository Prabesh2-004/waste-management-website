"use client";

import { useState } from "react";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Field";
import { KeyValueGrid } from "@/components/ui/KeyValueGrid";
import { DrawerContent } from "@/components/ui/Overlays";
import { WardStatus } from "../WardStatus";
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
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-ac-soft text-ac">
          <Truck size={20} />
        </span>
        <div className="flex-1">
          <h2 className="m-0">{vehicle.id}</h2>
          <span className="text-sm text-mut">Collection vehicle · {vehicle.cap} t</span>
        </div>
        <WardStatus status={vehicle.st} />
      </div>
      <KeyValueGrid
        items={[
          { label: "Driver", value: vehicle.drv || "None", compact: true },
          { label: "Capacity", value: `${vehicle.cap} t`, compact: true },
          { label: "Status", value: vehicle.st, compact: true },
          { label: "Maintenance", value: vehicle.note || "–", compact: true },
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
