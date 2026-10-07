"use client";

import { useState } from "react";
import { Label, Select } from "@/components/ui/Field";
import { ModalContent } from "@/components/ui/Overlays";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";

export function EditRouteModal({ ward }: { ward: number }) {
  const { routes, vehicles, drivers, driverOf, assignRoute } = useKmc();
  const { closeOverlay, toast } = useUi();
  const route = routes.find((x) => x.w === ward);
  const vehicleOptions = vehicles.filter((x) => x.st !== "Maintenance").map((x) => x.id);
  const [vehicle, setVehicle] = useState(route && vehicleOptions.includes(route.v) ? route.v : vehicleOptions[0]);
  const [driver, setDriver] = useState(route ? driverOf(route.v) : drivers[0]);
  if (!route) return null;

  const submit = () => {
    assignRoute(ward, vehicle, driver);
    closeOverlay();
    toast(`Vehicle and driver assigned to Route ${route.n}.`);
  };

  return (
    <ModalContent title={`Ward ${ward} · Route ${route.n}`} okLabel="Assign" onSubmit={submit}>
      <Label>Vehicle</Label>
      <Select options={vehicleOptions} value={vehicle} onChange={setVehicle} />
      <Label>Driver</Label>
      <Select options={drivers} value={driver} onChange={setDriver} />
    </ModalContent>
  );
}
