"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Field";
import { DrawerContent } from "@/components/ui/Overlays";
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
      <h3>{report.ty}</h3>
      <h2>Ward {report.w}</h2>
      <p className="text-mut">
        Reported by {report.src} · {report.d} · {report.c}
      </p>
      <p>&quot;{report.ds}&quot;</p>
      <p className="text-[13px] text-mut">Handled by: Ward {report.w} office</p>
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
          variant="outline"
          onClick={() => {
            setReportStatus(reportId, "Resolved");
            closeOverlay();
            toast("Complaint marked as resolved.");
          }}
        >
          Mark resolved
        </Button>
      </p>
      <p className="text-[13px] text-mut">Flow: Reported → Ward handles → KMC monitors → Resolved</p>
    </DrawerContent>
  );
}
