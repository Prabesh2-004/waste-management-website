"use client";

import { Button } from "@/components/ui/Button";
import { KeyValueGrid } from "@/components/ui/KeyValueGrid";
import { DrawerContent } from "@/components/ui/Overlays";
import { KmcStatus } from "../KmcStatus";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";
import options from "@/data/kmc/options.json";

export function ProgramDrawer({ programId }: { programId: number }) {
  const { programs, registerCitizens } = useKmc();
  const { toast } = useUi();
  const p = programs.find((x) => x.id === programId);
  if (!p) return null;

  return (
    <DrawerContent>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="m-0">{p.n}</h2>
          <span className="text-sm text-mut">Ward {p.w}</span>
        </div>
        <KmcStatus status={p.s} />
      </div>
      <p className="text-[13px] text-mut">
        {p.d} · {p.tm}
        {p.loc ? ` · ${p.loc}` : ""}
      </p>
      <p className="rounded-xl bg-ac-wash px-3 py-2.5">{p.ds}</p>
      <KeyValueGrid
        items={[
          { label: "Expected", value: p.exp },
          { label: "Registered", value: p.reg },
          { label: "Attended", value: p.att },
          { label: "Status", value: <KmcStatus status={p.s} />, compact: true },
        ]}
      />
      <p className="text-[13px] text-mut">Citizens register in the Citizen section; the ward records attendance.</p>
      {p.s === "Upcoming" && (
        <Button
          variant="soft"
          onClick={() => {
            registerCitizens(p.id);
            toast(`${options.registrationBatch} citizens registered through the Citizen app.`);
          }}
        >
          Simulate {options.registrationBatch} new registrations
        </Button>
      )}
    </DrawerContent>
  );
}
