"use client";

import { useState } from "react";
import { Input, Label, Select } from "@/components/ui/Field";
import { ModalContent } from "@/components/ui/Overlays";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import options from "@/data/ward/options.json";

export function DriverUpdateModal({ routeNumber }: { routeNumber: number }) {
  const { routes, driverOf, submitDriverUpdate } = useWard();
  const { closeOverlay, toast } = useUi();
  const [outcome, setOutcome] = useState(options.driverOutcomes[0]);
  const [kg, setKg] = useState(String(options.completeKgDefault));
  const route = routes.find((x) => x.n === routeNumber);
  if (!route) return null;

  const submit = () => {
    const message = submitDriverUpdate(routeNumber, outcome, Number(kg) || 0);
    closeOverlay();
    toast(message);
  };

  return (
    <ModalContent title={`Driver update · Route ${routeNumber}`} okLabel="Submit update" onSubmit={submit}>
      <p className="text-[13px] text-mut">
        {route.v} · {driverOf(route.v)}
      </p>
      <Label>What does the driver report?</Label>
      <Select options={options.driverOutcomes} value={outcome} onChange={setOutcome} />
      <Label>Waste collected (kg, if completed)</Label>
      <Input type="number" value={kg} onChange={(e) => setKg(e.target.value)} />
    </ModalContent>
  );
}
