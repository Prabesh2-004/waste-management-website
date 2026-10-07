"use client";

import { useState } from "react";
import { Input, Label, Select } from "@/components/ui/Field";
import { ModalContent } from "@/components/ui/Overlays";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";
import { parseWard, wardLabel, wardOptions } from "@/lib/format";
import meta from "@/data/shared/meta.json";
import options from "@/data/kmc/options.json";

export function ScheduleModal({ ward }: { ward?: number }) {
  const { schedule, changeSchedule } = useKmc();
  const { closeOverlay, toast } = useUi();
  const editing = ward !== undefined;
  const [wardValue, setWardValue] = useState(wardLabel(ward ?? options.defaultWard));
  const [time, setTime] = useState(editing ? schedule[ward].t : options.defaultPickupTime);
  const [kind, setKind] = useState(editing ? schedule[ward].k : options.wasteKinds[0]);

  const submit = () => {
    if (!time) return toast("Select a pickup time");
    changeSchedule(parseWard(wardValue), time, kind);
    closeOverlay();
    toast("Collection schedule updated successfully. Ward and citizens will see the update.");
  };

  return (
    <ModalContent title={editing ? "Change collection time" : "Create schedule"} okLabel={editing ? "Publish change" : "Create"} onSubmit={submit}>
      <Label>Ward</Label>
      <Select options={wardOptions(meta.wardCount)} value={wardValue} onChange={setWardValue} />
      <Label>Pickup time</Label>
      <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      <Label>Waste types</Label>
      <Select options={options.wasteKinds} value={kind} onChange={setKind} />
    </ModalContent>
  );
}
