"use client";

import { useState } from "react";
import { CalendarDays, Landmark, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Field";
import { DrawerContent } from "@/components/ui/Overlays";
import { ReportEvidence, SourceBadge } from "@/components/shared/admin/ReportEvidence";
import { ReportIcon } from "@/components/shared/admin/reportIcons";
import { KmcStatus } from "../KmcStatus";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";
import shared from "@/data/shared/options.json";

export function ReportDrawer({ reportId }: { reportId: number }) {
  const { reports, setReportStatus } = useKmc();
  const { closeOverlay, toast } = useUi();
  const report = reports.find((x) => x.id === reportId);
  const [status, setStatus] = useState(report?.s ?? shared.reportStatuses[0]);
  if (!report) return null;

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
        <KmcStatus status={report.s} />
        <SourceBadge source={report.src} />
      </div>
      <div className="mt-3 space-y-1 text-[13px] text-mut">
        <div className="flex items-center gap-1.5">
          <MapPin size={14} /> Ward {report.w}
          {report.loc ? ` · ${report.loc}` : ""}
          {report.rt ? ` · Route ${report.rt}` : ""}
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarDays size={14} /> {report.d} · {report.c}
        </div>
        <div className="flex items-center gap-1.5">
          <Landmark size={14} /> Handled by the Ward {report.w} office
        </div>
      </div>
      <p className="rounded-xl bg-ac-wash px-3 py-2.5">&ldquo;{report.ds}&rdquo;</p>
      <ReportEvidence report={report} />
      {report.notes && report.notes.length > 0 && (
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
      <p className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            setReportStatus(reportId, status);
            closeOverlay();
            toast(`Report status changed to ${status}.`);
          }}
        >
          Update status
        </Button>
        <Button
          variant="soft"
          onClick={() => {
            setReportStatus(reportId, "Resolved");
            closeOverlay();
            toast("Complaint marked as resolved.");
          }}
        >
          Mark resolved
        </Button>
      </p>
      <p className="mb-0 text-xs text-mut">Flow: Reported → Ward handles → KMC monitors → Resolved</p>
    </DrawerContent>
  );
}
