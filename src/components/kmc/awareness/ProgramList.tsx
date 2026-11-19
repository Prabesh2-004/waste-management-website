"use client";

import { ProgramCard } from "@/components/shared/admin/ProgramCard";
import { KmcStatus } from "../KmcStatus";
import { ProgramDrawer } from "./ProgramDrawer";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";

export function ProgramList() {
  const { programs, awarenessTab } = useKmc();
  const { openDrawer } = useUi();
  const list = programs.filter((p) => p.s === awarenessTab);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => {
          const upcoming = p.s === "Upcoming";
          const n = upcoming ? p.reg : p.att;
          return (
            <ProgramCard
              key={p.id}
              id={p.id}
              name={p.n}
              date={p.d}
              time={p.tm}
              place={`Ward ${p.w}${p.loc ? ` · ${p.loc}` : ""}`}
              count={upcoming ? `${p.reg} registered · ${p.exp} expected` : `${p.att} / ${p.exp} attended`}
              percent={p.exp ? (n / p.exp) * 100 : 0}
              status={<KmcStatus status={p.s} />}
              onOpen={() => openDrawer(<ProgramDrawer programId={p.id} />)}
            />
          );
        })}
      </div>
      {list.length === 0 && <p className="text-mut">Nothing here yet.</p>}
    </>
  );
}
