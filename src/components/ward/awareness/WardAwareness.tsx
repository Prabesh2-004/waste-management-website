"use client";

import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Row } from "@/components/ui/Row";
import { Tabs } from "@/components/ui/Tabs";
import { WardStatus } from "../WardStatus";
import { NewProgramModal } from "./NewProgramModal";
import { ProgramDrawer } from "./ProgramDrawer";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import { programStatus } from "@/lib/ward";
import options from "@/data/ward/options.json";
import type { AwarenessProgram } from "@/types";

const filters: Record<string, (p: AwarenessProgram) => boolean> = {
  All: () => true,
  Upcoming: (p) => p.s === "Scheduled",
  Ongoing: (p) => p.s === "Ongoing",
  Completed: (p) => p.s === "Completed",
};

export function WardAwareness() {
  const { programs, awarenessTab, setAwarenessTab, wardName } = useWard();
  const { openModal, openDrawer } = useUi();
  const list = programs.filter(filters[awarenessTab]);

  return (
    <>
      <PageHeader
        title="Awareness Programs"
        subtitle={`Programs in ${wardName}`}
        action={<Button onClick={() => openModal(<NewProgramModal />)}>Create Program</Button>}
      />
      <Tabs items={options.awarenessTabs} active={awarenessTab} onChange={setAwarenessTab} />
      <Box>
        {list.map((p) => (
          <Row key={p.id} onClick={() => openDrawer(<ProgramDrawer programId={p.id} />)}>
            <span>
              <b>{p.n}</b> <span className="text-mut">{p.d}</span>
            </span>
            <span className="shrink-0 text-right">
              <WardStatus status={programStatus(p)} /> ·{" "}
              {p.s === "Completed" || p.s === "Ongoing" ? `${p.att} / ${p.exp} attended` : `${p.reg} / ${p.exp} registered`}
            </span>
          </Row>
        ))}
        {list.length === 0 && <p className="text-mut">Nothing here yet.</p>}
      </Box>
    </>
  );
}
