"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label, Select, Textarea } from "@/components/ui/Field";
import { DrawerContent } from "@/components/ui/Overlays";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import shared from "@/data/shared/options.json";

export function ReportDrawer({ reportId }: { reportId: number }) {
  const { reports, wardName, saveReport } = useWard();
  const { closeOverlay, toast } = useUi();
  const report = reports.find((x) => x.id === reportId);
  const [status, setStatus] = useState(report?.s ?? shared.reportStatuses[0]);
  const [note, setNote] = useState("");
  if (!report) return null;

  const save = (next: string) => {
    saveReport(reportId, next, note);
    closeOverlay();
    toast(
      next === "Resolved"
        ? 'Complaint marked as resolved. The citizen is told "Your complaint has been resolved." and KMC sees the status.'
        : `Report status changed to ${next}.`
    );
  };

  return (
    <DrawerContent>
      <h3>{report.ty}</h3>
      <h2>
        {wardName} · Route {report.rt}
      </h2>
      <p className="text-mut">
        Reported by {report.src} · {report.d} · {report.c}
      </p>
      <p>&quot;{report.ds}&quot;</p>
      <p className="text-[13px] text-mut">Location: {report.loc} (no photo attached)</p>
      {report.notes.map((n, i) => (
        <p key={i} className="text-[13px]">
          • {n}
        </p>
      ))}
      <Label>Status</Label>
      <Select options={shared.reportStatuses} value={status} onChange={setStatus} />
      <Label>Response / note (optional)</Label>
      <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      <p className="flex flex-wrap gap-2">
        <Button onClick={() => save(status)}>Save update</Button>
        <Button variant="outline" onClick={() => save("Resolved")}>
          Mark resolved
        </Button>
      </p>
    </DrawerContent>
  );
}
