"use client";

import { useState } from "react";
import { Check, CircleCheck, FileText, Truck, Wrench } from "lucide-react";
import { KmcStatus } from "@/components/ui/Badge";
import { Button, ButtonRow } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { CellStack, DataTable } from "@/components/ui/DataTable";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { Tabs } from "@/components/ui/Tabs";
import { useKmc } from "@/context/KmcContext";
import { useToast } from "@/context/ToastContext";
import { APPROVAL_REQUIREMENTS, REQUEST_DOCUMENTS, type VehicleRequest } from "@/data/kmc";

const TABS = [
  { value: "requests", label: "Vehicle Requests" },
  { value: "records", label: "Vehicle Records" },
  { value: "routes", label: "Routes & Coordination" },
] as const;

export function KmcVehicles() {
  const { vehicleRequests, setRequestStatus } = useKmc();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState(vehicleRequests[0].id);
  const request = vehicleRequests.find((r) => r.id === selectedId) ?? vehicleRequests[0];

  const decide = (status: "Approved" | "Rejected" | "Returned") => {
    setRequestStatus(request.id, status);
    toast(`${request.id} ${status.toLowerCase()}`);
  };

  return (
    <>
      <KpiGrid>
        <Kpi icon={<Truck />} label="Registered Vehicles" value="48" note="↑ 6% vs. last month" />
        <Kpi icon={<CircleCheck />} label="Operational" value="42" note="↑ 5% vs. last month" />
        <Kpi icon={<Wrench />} label="Under Maintenance" value="4" note="↑ 2% vs. last month" />
        <Kpi icon={<FileText />} label="Pending Ward Requests" value="7" note="↓ 3% vs. last month" trend="down" />
      </KpiGrid>

      <div className="grid flex-1 gap-3 xl:grid-cols-[2.2fr_1fr]">
        <Card>
          <Tabs
            items={[...TABS]}
            value="requests"
            onChange={(tab) => tab !== "requests" && toast(`${TABS.find((t) => t.value === tab)?.label} – coming soon`)}
          />
          <CardHeader title="Ward Vehicle Approval Queue" subtitle="Review and approve vehicle registration requests from wards" />
          <DataTable<VehicleRequest>
            rows={vehicleRequests}
            rowKey={(r) => r.id}
            selectedKey={request.id}
            onRowClick={(r) => setSelectedId(r.id)}
            columns={[
              { header: "ID", cell: (r) => r.id, className: "whitespace-nowrap" },
              { header: "Ward", cell: (r) => <CellStack primary={r.ward} secondary={r.area} /> },
              { header: "Vehicle", cell: (r) => <CellStack primary={r.vehicle} secondary={r.spec} /> },
              { header: "Submitted", cell: (r) => r.submitted },
              { header: "Status", cell: (r) => <KmcStatus status={r.status} /> },
            ]}
          />
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[15px] font-semibold">{request.id}</h3>
            <KmcStatus status={request.status} />
          </div>
          <b className="mt-1">
            {request.ward} – {request.vehicle}
          </b>
          <p className="mb-2 text-xs text-muted">
            {request.area} · Submitted {request.submitted}, 2026
          </p>

          <h4 className="text-sm font-semibold">Approval requirements</h4>
          {APPROVAL_REQUIREMENTS.map((req) => (
            <div key={req} className="flex items-center gap-2 border-b border-line py-1.5 text-[13px]">
              <Check className="size-4 text-brand" />
              {req}
            </div>
          ))}

          <h4 className="mt-3 text-sm font-semibold">Documents</h4>
          {REQUEST_DOCUMENTS.map((doc) => (
            <div key={doc} className="flex items-center justify-between gap-2 border-b border-line py-1.5 text-[13px]">
              <span className="flex items-center gap-2">
                <FileText className="size-4 text-muted" />
                {doc}
              </span>
              <button type="button" className="text-brand hover:underline" onClick={() => toast(`Opening ${doc}`)}>
                View
              </button>
            </div>
          ))}

          <ButtonRow>
            <Button onClick={() => decide("Approved")}>Approve</Button>
            <Button variant="danger" onClick={() => decide("Rejected")}>
              Reject
            </Button>
            <Button variant="outline" onClick={() => decide("Returned")}>
              Return
            </Button>
          </ButtonRow>
        </Card>
      </div>
    </>
  );
}
