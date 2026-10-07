"use client";

import { useState } from "react";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { ModalContent } from "@/components/ui/Overlays";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import options from "@/data/ward/options.json";

const yesNo = ["No", "Yes"];

export function NewProgramModal() {
  const { createProgram } = useWard();
  const { closeOverlay, toast } = useUi();
  const d = options.newProgramDefaults;
  const [name, setName] = useState(d.name);
  const [date, setDate] = useState(d.date);
  const [time, setTime] = useState(d.time);
  const [location, setLocation] = useState(d.location);
  const [description, setDescription] = useState(d.description);
  const [expected, setExpected] = useState(String(d.expected));
  const [coordination, setCoordination] = useState(yesNo[0]);

  const submit = () => {
    if (!time) return toast("Select a time");
    const needsCoordination = coordination === "Yes";
    createProgram({ name, date, time, location, description, expected: Number(expected), needsCoordination });
    closeOverlay();
    toast(needsCoordination ? "Awareness program created. Status: Pending KMC review." : "Awareness program created and scheduled.");
  };

  return (
    <ModalContent title="Create awareness program" okLabel="Create Program" onSubmit={submit}>
      <Label>Program name</Label>
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <Label>Date</Label>
      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <Label>Time</Label>
      <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      <Label>Location</Label>
      <Input value={location} onChange={(e) => setLocation(e.target.value)} />
      <Label>Description</Label>
      <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      <Label>Expected attendees</Label>
      <Input type="number" value={expected} onChange={(e) => setExpected(e.target.value)} />
      <Label>Needs city-level coordination?</Label>
      <Select options={yesNo} value={coordination} onChange={setCoordination} />
    </ModalContent>
  );
}
