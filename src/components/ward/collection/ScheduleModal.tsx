"use client";

import { useState } from "react";
import { Input, Label, Select } from "@/components/ui/Field";
import { ModalContent } from "@/components/ui/Overlays";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import { parseRoute } from "@/lib/format";
import options from "@/data/ward/options.json";

export function ScheduleModal({ route }: { route?: number }) {
  const { routes, schedule, changeSchedule } = useWard();
  const { closeOverlay, toast } = useUi();
  const routeOptions = routes.map((x) => `Route ${x.n}`);
  const [routeValue, setRouteValue] = useState(`Route ${route ?? options.defaultScheduleRoute}`);
  const [time, setTime] = useState(route !== undefined ? schedule[route] : options.defaultPickupTime);

  const submit = () => {
    if (!time) return toast("Select a pickup time");
    changeSchedule(parseRoute(routeValue), time);
    closeOverlay();
    toast("Collection schedule updated. Drivers and citizens are informed; KMC can see the change.");
  };

  return (
    <ModalContent
      title={route !== undefined ? "Change collection time" : "Create schedule"}
      okLabel={route !== undefined ? "Publish change" : "Create"}
      onSubmit={submit}
    >
      <Label>Route</Label>
      <Select options={routeOptions} value={routeValue} onChange={setRouteValue} />
      <Label>Pickup time</Label>
      <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
    </ModalContent>
  );
}
