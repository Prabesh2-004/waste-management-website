"use client";

import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { NewProgramModal } from "./NewProgramModal";
import { ProgramList } from "./ProgramList";
import { ParticipationByWard } from "./ParticipationByWard";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";
import options from "@/data/kmc/options.json";

export function KmcAwareness() {
  const { awarenessTab, setAwarenessTab } = useKmc();
  const { openModal } = useUi();

  return (
    <>
      <PageHeader
        title="Awareness Programs"
        subtitle="Programs across wards and how many people join"
        action={<Button onClick={() => openModal(<NewProgramModal />)}>Create Program</Button>}
      />
      <Tabs items={options.awarenessTabs} active={awarenessTab} onChange={setAwarenessTab} />
      <ProgramList />
      <ParticipationByWard />
    </>
  );
}
