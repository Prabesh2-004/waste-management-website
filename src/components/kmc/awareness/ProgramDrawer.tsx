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
      <h3>{p.n}</h3>
      <h2>Ward {p.w}</h2>
      <p className="text-mut">
        {p.d} · {p.tm}
      </p>
      <p>{p.ds}</p>
      <KeyValueGrid
        items={[
          { label: "Expected", value: p.exp },
          { label: "Registered", value: p.reg },
          { label: "Attended", value: p.att },
          { label: "Status", value: <KmcStatus status={p.s} />, compact: true },
        ]}
      />
      <p className="text-[13px] text-mut">Citizens and drivers register through their apps; the ward records attendance.</p>
      {p.s === "Upcoming" && (
        <Button
          variant="outline"
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
