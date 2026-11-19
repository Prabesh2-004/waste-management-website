"use client";

import { CalendarDays, ClipboardCheck, Megaphone, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatStrip } from "@/components/ui/StatStrip";
import { Tabs } from "@/components/ui/Tabs";
import { NewProgramModal } from "./NewProgramModal";
import { ProgramList } from "./ProgramList";
import { ParticipationByWard } from "./ParticipationByWard";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";
import options from "@/data/kmc/options.json";
import meta from "@/data/shared/meta.json";

export function KmcAwareness() {
  const { awarenessTab, setAwarenessTab, programs } = useKmc();
  const { openModal } = useUi();
  const wards = new Set(programs.map((p) => p.w)).size;

  return (
    <>
      <PageHeader
        title="Awareness Programs"
        subtitle={`Coordinate campaigns and monitor participation across all ${meta.wardCount} wards`}
        action={
          <Button onClick={() => openModal(<NewProgramModal />)}>
            <Plus size={16} /> Create Program
          </Button>
        }
      />
      <StatStrip
        items={[
          { label: "Upcoming", value: String(programs.filter((p) => p.s === "Upcoming").length), hint: "Scheduled", icon: <Megaphone size={20} />, tone: "B" },
          { label: "Registrations", value: String(programs.reduce((a, p) => a + p.reg, 0)), hint: "All programs", icon: <CalendarDays size={20} /> },
          { label: "Attendance", value: String(programs.reduce((a, p) => a + p.att, 0)), hint: "Recorded by wards", icon: <Users size={20} />, tone: "G" },
          { label: "Wards participating", value: `${wards} / ${meta.wardCount}`, hint: "With a program", icon: <ClipboardCheck size={20} />, tone: "P" },
        ]}
      />
      <Tabs items={options.awarenessTabs} active={awarenessTab} onChange={setAwarenessTab} />
      <ProgramList />
      <ParticipationByWard />
    </>
  );
}
