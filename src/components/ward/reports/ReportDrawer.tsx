"use client";

import { useState } from "react";
import { CalendarDays, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Label, Select, Textarea } from "@/components/ui/Field";
import { DrawerContent } from "@/components/ui/Overlays";
import { ReportEvidence, SourceBadge } from "@/components/shared/admin/ReportEvidence";
import { ReportIcon } from "@/components/shared/admin/reportIcons";
import { WardStatus } from "../WardStatus";
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
        ? "Complaint marked as resolved. The citizen is notified and KMC sees the status."
        : `Report status changed to ${next}.`
    );
  };

  return (
    <DrawerContent>
      <div className="flex items-start gap-3">
        <ReportIcon category={report.c} status={report.s} size={20} />
        <div className="min-w-0 flex-1">
          <h2 className="m-0">{report.ty}</h2>
          {report.ref && <span className="text-xs font-semibold text-mut">#{report.ref}</span>}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <WardStatus status={report.s} />
        <SourceBadge source={report.src} />
      </div>
      <div className="mt-3 space-y-1 text-[13px] text-mut">
        <div className="flex items-center gap-1.5">
          <MapPin size={14} /> {report.loc || "No location"} · {wardName}
          {report.rt ? ` · Route ${report.rt}` : ""}
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarDays size={14} /> {report.d} · {report.c}
        </div>
        <div className="flex items-center gap-1.5">
          <User size={14} /> Reported by {report.src}
        </div>
      </div>
      <p className="rounded-xl bg-ac-wash px-3 py-2.5">&ldquo;{report.ds}&rdquo;</p>
      <ReportEvidence report={report} />
      {report.notes.length > 0 && (
        <>
          <h3 className="mt-4">Notes</h3>
          {report.notes.map((n, i) => (
            <p key={i} className="my-1 text-[13px]">
              • {n}
            </p>
          ))}
        </>
      )}
      <Label>Status</Label>
      <Select options={shared.reportStatuses} value={status} onChange={setStatus} />
      <Label>Response / note (optional)</Label>
      <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      <p className="flex flex-wrap gap-2">
        <Button onClick={() => save(status)}>Save update</Button>
        <Button variant="soft" onClick={() => save("Resolved")}>
          Mark resolved
        </Button>
      </p>
    </DrawerContent>
  );
}
