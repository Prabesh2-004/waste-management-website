"use client";

import { Download } from "lucide-react";
import { Badge, WardStatus } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { useToast } from "@/context/ToastContext";
import { OPEN_COMPLAINT_COUNT, OPEN_COMPLAINTS } from "@/data/ward";
import { downloadCsv } from "@/lib/csv";
import { QuickActions, WardPage } from "./WardPage";

export function WardReports() {
  const toast = useToast();

  const exportComplaints = () =>
    downloadCsv(
      "ward-17-complaints.csv",
      ["Ref", "Location", "Issue", "Status"],
      OPEN_COMPLAINTS.map((c) => [c.ref, c.location, c.issue, c.status])
    );

  return (
    <WardPage
      rail={
        <QuickActions
          actions={[
            { title: "Download complaints report", description: "Export as CSV", icon: <Download />, onClick: exportComplaints },
            { title: "Download ward report", description: "PDF · Excel", onClick: () => toast("Preparing ward report") },
          ]}
        />
      }
    >
      <Card className="flex-1">
        <CardHeader title="Open complaints" badge={<Badge tone="danger">{OPEN_COMPLAINT_COUNT}</Badge>} />
        <DataTable
          rows={OPEN_COMPLAINTS}
          rowKey={(c) => c.ref}
          onRowClick={(c) => toast(`Complaint ${c.ref}`)}
          columns={[
            { header: "Ref", cell: (c) => c.ref, className: "whitespace-nowrap" },
            { header: "Location", cell: (c) => c.location },
            { header: "Issue", cell: (c) => c.issue },
            { header: "Status", cell: (c) => <WardStatus status={c.status} /> },
          ]}
        />
      </Card>
    </WardPage>
  );
}
