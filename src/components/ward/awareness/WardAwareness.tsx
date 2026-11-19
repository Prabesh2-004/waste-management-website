"use client";

import { CalendarDays, CheckCircle2, Clock, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatStrip } from "@/components/ui/StatStrip";
import { Tabs } from "@/components/ui/Tabs";
import { ProgramCard } from "@/components/shared/admin/ProgramCard";
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
  const attended = programs.reduce((a, p) => a + p.att, 0);

  return (
    <>
      <PageHeader
        title="Awareness Programs"
        subtitle={`Plan and manage community initiatives in ${wardName}`}
        action={
          <Button onClick={() => openModal(<NewProgramModal />)}>
            <Plus size={16} /> Create Program
          </Button>
        }
      />
      <StatStrip
        items={[
          { label: "Upcoming", value: String(programs.filter((p) => p.s === "Scheduled").length), hint: "Scheduled", icon: <CalendarDays size={20} />, tone: "B" },
          { label: "Completed", value: String(programs.filter((p) => p.s === "Completed").length), hint: "Programs held", icon: <CheckCircle2 size={20} />, tone: "G" },
          {
            label: "Pending approval",
            value: String(programs.filter((p) => p.ap === "Pending KMC review").length),
            hint: "Awaiting KMC decision",
            icon: <Clock size={20} />,
            tone: "A",
          },
          { label: "Participants", value: String(attended), hint: "Total attended", icon: <Users size={20} />, tone: "P" },
        ]}
      />
      <Tabs items={options.awarenessTabs} active={awarenessTab} onChange={setAwarenessTab} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => {
          const held = p.s === "Completed" || p.s === "Ongoing";
          const n = held ? p.att : p.reg;
          return (
            <ProgramCard
              key={p.id}
              id={p.id}
              name={p.n}
              date={p.d}
              time={p.tm}
              place={p.loc}
              count={`${n} / ${p.exp} ${held ? "attended" : "registered"}`}
              percent={p.exp ? (n / p.exp) * 100 : 0}
              status={<WardStatus status={programStatus(p)} />}
              onOpen={() => openDrawer(<ProgramDrawer programId={p.id} />)}
            />
          );
        })}
      </div>
      {list.length === 0 && <p className="text-mut">Nothing here yet.</p>}
    </>
  );
}
