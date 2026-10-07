"use client";

import { useState } from "react";
import { Input, Label, Select } from "@/components/ui/Field";
import { ModalContent } from "@/components/ui/Overlays";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import options from "@/data/ward/options.json";

export function AddVehicleModal() {
  const { drivers, addVehicle } = useWard();
  const { closeOverlay, toast } = useUi();
  const [id, setId] = useState("");
  const [driver, setDriver] = useState(drivers[0]);
  const [capacity, setCapacity] = useState(String(options.newVehicleCapacityDefault));

  const submit = () => {
    if (!id) return toast("Enter a vehicle ID");
    addVehicle({ id, drv: driver, cap: Number(capacity), st: "Idle", note: "Newly registered" });
    closeOverlay();
    toast("Vehicle registered successfully.");
  };

  return (
    <ModalContent title="Register vehicle" okLabel="Register vehicle" onSubmit={submit}>
      <Label>Vehicle ID</Label>
      <Input placeholder="KMC-40" value={id} onChange={(e) => setId(e.target.value)} />
      <Label>Driver</Label>
      <Select options={drivers} value={driver} onChange={setDriver} />
      <Label>Capacity (tons)</Label>
      <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
    </ModalContent>
  );
}
