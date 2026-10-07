"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/Field";
import { ModalContent } from "@/components/ui/Overlays";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";
import options from "@/data/kmc/options.json";

export function DriverCompleteModal({ ward }: { ward: number }) {
  const { routes, driverOf, completeRoute } = useKmc();
  const { closeOverlay, toast } = useUi();
  const [kg, setKg] = useState(String(options.completeKgDefault));
  const route = routes.find((x) => x.w === ward);
  if (!route) return null;

  const submit = () => {
    const amount = Number(kg) || 0;
    const total = completeRoute(ward, amount);
    closeOverlay();
    toast(`${amount} kg = ${(amount / 1000).toFixed(2)} t added. Ward ${ward} is now ${total.toFixed(2)} t and the map is updated.`);
  };

  return (
    <ModalContent title={`Driver completes Ward ${ward} · Route ${route.n}`} okLabel="Submit" onSubmit={submit}>
      <p className="text-[13px] text-mut">
        {route.v} · {driverOf(route.v)}
      </p>
      <Label>Waste collected (kg)</Label>
      <Input type="number" value={kg} onChange={(e) => setKg(e.target.value)} />
    </ModalContent>
  );
}
