"use client";

import { useState } from "react";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { ModalContent } from "@/components/ui/Overlays";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";
import { parseWard, wardLabel, wardOptions } from "@/lib/format";
import meta from "@/data/shared/meta.json";
import options from "@/data/kmc/options.json";

export function NewProgramModal() {
  const { addProgram } = useKmc();
  const { closeOverlay, toast } = useUi();
  const d = options.newProgramDefaults;
  const [name, setName] = useState(d.name);
  const [ward, setWard] = useState(wardLabel(options.defaultWard));
  const [date, setDate] = useState(d.date);
  const [time, setTime] = useState(d.time);
  const [description, setDescription] = useState(d.description);
  const [expected, setExpected] = useState(String(d.expected));

  const submit = () => {
    if (!time) return toast("Select a time");
    addProgram({ name, ward: parseWard(ward), date, time, description, expected: Number(expected) });
    closeOverlay();
    toast("Awareness program created. An announcement was added to Updates.");
  };

  return (
    <ModalContent title="Create awareness program" okLabel="Create Program" onSubmit={submit}>
      <Label>Program name</Label>
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <Label>Ward</Label>
      <Select options={wardOptions(meta.wardCount)} value={ward} onChange={setWard} />
      <Label>Date</Label>
      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <Label>Time</Label>
      <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      <Label>Description</Label>
      <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      <Label>Attendee capacity</Label>
      <Input type="number" value={expected} onChange={(e) => setExpected(e.target.value)} />
    </ModalContent>
  );
}
