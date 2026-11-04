"use client";

import { useState } from "react";
import { CalendarDays, CircleCheck, CircleDot, Compass, Info, Timer, TriangleAlert, Truck, WifiOff } from "lucide-react";
import { KmcStatus } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { IconBubble } from "@/components/ui/IconBubble";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { ListItem } from "@/components/ui/ListItem";
import { useToast } from "@/context/ToastContext";
import { COLLECTION_EXCEPTIONS, SCHEDULE_APPROVALS, WARD_COLLECTION } from "@/data/kmc";
import { WardMap } from "./WardMap";

const EXCEPTION_ICONS = {
  missed: TriangleAlert,
  delayed: CircleDot,
  deviation: Compass,
  offline: WifiOff,
  none: Info,
};

export function KmcCollection() {
  const toast = useToast();
  const [approved, setApproved] = useState<string[]>([]);

  const approve = (wards: string) => {
    setApproved((list) => [...list, wards]);
    toast(`${wards} approved`);
  };

  return (
    <>
      <KpiGrid columns={5}>
        <Kpi icon={<Truck />} label="Total Waste Collected" value="1,248 tons" note="↑ 6% vs. last week" />
        <Kpi icon={<CalendarDays />} label="Scheduled" value="1,280" note="↑ 4% vs. last week" />
        <Kpi icon={<CircleCheck />} label="Completed" value="1,190" note="↑ 8% vs. last week" />
        <Kpi icon={<TriangleAlert />} label="Missed" value="23" note="↓ 45% vs. last week" />
        <Kpi icon={<Timer />} label="Delayed" value="67" note="↓ 22% vs. last week" />
      </KpiGrid>

      <div className="grid flex-1 gap-3 xl:grid-cols-[2fr_1fr]">
        <div className="flex min-w-0 flex-col gap-3">
          <Card>
            <CardHeader title="Citywide Collection Map" subtitle="Live status by ward — select a ward" />
            <WardMap />
          </Card>
          <Card>
            <CardHeader title="Ward Collection Status" />
            <DataTable
              rows={WARD_COLLECTION}
              rowKey={(r) => r.ward}
              columns={[
                { header: "Ward", cell: (r) => r.ward },
                { header: "Status", cell: (r) => <KmcStatus status={r.status} /> },
                { header: "Done / Scheduled", cell: (r) => r.progress },
                { header: "Waste", cell: (r) => r.waste },
                { header: "Vehicle", cell: (r) => r.vehicle },
              ]}
            />
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <Card>
            <CardHeader title="Collection Exceptions" />
            {COLLECTION_EXCEPTIONS.map((x) => {
              const Icon = EXCEPTION_ICONS[x.kind];
              return (
                <ListItem
                  key={x.title}
                  leading={
                    <IconBubble>
                      <Icon />
                    </IconBubble>
                  }
                  title={x.title}
                  subtitle={x.detail}
                  trailing={<KmcStatus status={x.priority} />}
                />
              );
            })}
          </Card>
          <Card>
            <CardHeader title="Multi-ward Schedule Approvals" />
            {SCHEDULE_APPROVALS.map((x) => (
              <ListItem
                key={x.wards}
                leading={
                  <IconBubble>
                    <CalendarDays />
                  </IconBubble>
                }
                title={x.wards}
                subtitle={x.change}
                trailing={
                  approved.includes(x.wards) ? (
                    <KmcStatus status="Approved" />
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => approve(x.wards)}>
                      Approve
                    </Button>
                  )
                }
              />
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
