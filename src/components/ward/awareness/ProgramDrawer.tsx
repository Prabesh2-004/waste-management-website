"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { KeyValueGrid } from "@/components/ui/KeyValueGrid";
import { DrawerContent } from "@/components/ui/Overlays";
import { WardStatus } from "../WardStatus";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import { programStatus } from "@/lib/ward";

export function ProgramDrawer({ programId }: { programId: number }) {
  const { programs, wardName, decideProgram, resubmitProgram, startProgram, completeProgram } = useWard();
  const { closeOverlay, toast } = useUi();
  const p = programs.find((x) => x.id === programId);
  const [attended, setAttended] = useState(String(p?.att ?? 0));
  if (!p) return null;

  const decide = (approve: boolean) => {
    decideProgram(p.id, approve);
    closeOverlay();
    toast(approve ? "KMC approved. Program is Scheduled and citizens can register." : "KMC asked for changes.");
  };

  let actions: React.ReactNode = null;
  if (p.ap === "Pending KMC review") {
    actions = (
      <>
        <p className="text-[13px] text-mut">Waiting for KMC. In the real system KMC reviews this.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => decide(true)}>
            Simulate KMC: Approve
          </Button>
          <Button variant="outline" size="sm" onClick={() => decide(false)}>
            Needs changes
          </Button>
        </div>
      </>
    );
  } else if (p.ap === "Needs changes") {
    actions = (
      <Button
        onClick={() => {
          resubmitProgram(p.id);
          closeOverlay();
          toast("Program resubmitted for KMC review.");
        }}
      >
        Resubmit to KMC
      </Button>
    );
  } else if (p.s === "Scheduled") {
    actions = (
      <Button
        onClick={() => {
          startProgram(p.id);
          closeOverlay();
          toast("Program is now Ongoing.");
        }}
      >
        Start program
      </Button>
    );
  } else if (p.s === "Ongoing") {
    actions = (
      <>
        <Label>Actual attendees</Label>
        <Input type="number" value={attended} onChange={(e) => setAttended(e.target.value)} />
        <p>
          <Button
            onClick={() => {
              const count = completeProgram(p.id, Number(attended) || 0);
              closeOverlay();
              toast(`Program completed. KMC now sees: ${wardName} · ${count} attendees.`);
            }}
          >
            Record attendance &amp; complete
          </Button>
        </p>
      </>
    );
  }

  return (
    <DrawerContent>
      <h3>{p.n}</h3>
      <h2>{wardName}</h2>
      <p className="text-mut">
        {p.d} · {p.tm}
        <br />
        Location: {p.loc}
      </p>
      <p>{p.ds}</p>
      <KeyValueGrid
        items={[
          { label: "Expected", value: p.exp },
          { label: "Registered", value: p.reg },
          { label: "Attended", value: p.att },
          { label: "Status", value: <WardStatus status={programStatus(p)} />, compact: true },
        ]}
      />
      {actions}
    </DrawerContent>
  );
}
