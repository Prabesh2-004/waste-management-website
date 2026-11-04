"use client";

import { useState } from "react";
import { FileText, TriangleAlert, Truck, Users } from "lucide-react";
import { KmcStatus } from "@/components/ui/Badge";
import { Button, ButtonRow } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CellStack, DataTable } from "@/components/ui/DataTable";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { KeyValue } from "@/components/ui/ListItem";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/context/ToastContext";
import { WARD_PERFORMANCE, type WardPerformance } from "@/data/kmc";

const TABS = [
  { value: "performance", label: "Ward Performance" },
  { value: "targets", label: "Targets & Milestones" },
  { value: "support", label: "City-level Support Needed" },
] as const;

function PercentCell({ value }: { value: number }) {
  return (
    <>
      <span className="mb-1 block">{value}%</span>
      <ProgressBar value={value} />
    </>
  );
}

export function KmcMonitoring() {
  const toast = useToast();
  const [selected, setSelected] = useState(WARD_PERFORMANCE[3].ward);
  const ward = WARD_PERFORMANCE.find((w) => w.ward === selected) ?? WARD_PERFORMANCE[0];

  return (
    <>
      <KpiGrid>
        <Kpi icon={<Truck />} label="Collection Completion" value="92%" note="↑ 3% vs. last week" />
        <Kpi icon={<TriangleAlert />} label="Missed Collections" value="23" note="↓ 45% vs. last week" />
        <Kpi icon={<FileText />} label="Complaint Resolution" value="87%" note="↑ 6% vs. last week" />
        <Kpi icon={<Users />} label="Awareness Participation" value="28 / 32" note="↑ 9% vs. last month" />
      </KpiGrid>

      <div className="grid flex-1 gap-3 xl:grid-cols-[2.4fr_1fr]">
        <Card>
          <Tabs
            items={[...TABS]}
            value="performance"
            onChange={(tab) => tab !== "performance" && toast(`${TABS.find((t) => t.value === tab)?.label} – coming soon`)}
          />
          <DataTable<WardPerformance>
            rows={WARD_PERFORMANCE}
            rowKey={(w) => w.ward}
            selectedKey={ward.ward}
            onRowClick={(w) => setSelected(w.ward)}
            columns={[
              { header: "Ward", cell: (w) => <CellStack primary={w.ward} secondary={w.area} />, className: "whitespace-nowrap" },
              { header: "Collection", cell: (w) => <PercentCell value={w.collection} /> },
              { header: "Missed", cell: (w) => w.missed },
              { header: "Waste", cell: (w) => `${w.waste} t`, className: "whitespace-nowrap" },
              { header: "Complaints", cell: (w) => <PercentCell value={w.complaints} /> },
              { header: "Awareness", cell: (w) => w.awareness, className: "whitespace-nowrap" },
              { header: "Target", cell: (w) => <PercentCell value={w.target} /> },
              { header: "Status", cell: (w) => <KmcStatus status={w.status} /> },
            ]}
          />
        </Card>

        <Card>
          <h3 className="mb-2 text-[15px] font-semibold">Ward Details</h3>
          <div className="mb-1 flex items-center justify-between gap-2">
            <b>
              {ward.ward} · {ward.area}
            </b>
            <KmcStatus status={ward.status} />
          </div>
          <KeyValue label="Collection completion" value={`${ward.collection}%`} />
          <KeyValue label="Missed collections" value={ward.missed} />
          <KeyValue label="Waste collected" value={`${ward.waste} tons`} />
          <KeyValue label="Complaints resolved" value={`${ward.complaints}%`} />
          <KeyValue label="Awareness" value={ward.awareness} />
          <KeyValue label="Target progress" value={`${ward.target}%`} />
          <ButtonRow>
            <Button variant="outline" onClick={() => toast(`Support requested for ${ward.ward}`)}>
              Request Support
            </Button>
            <Button variant="outline" onClick={() => toast("Note added")}>
              Add Note
            </Button>
          </ButtonRow>
        </Card>
      </div>
    </>
  );
}
