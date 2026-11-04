"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, Leaf, TriangleAlert, Trash2, Truck } from "lucide-react";
import { KmcStatus } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Donut } from "@/components/ui/Donut";
import { IconBubble } from "@/components/ui/IconBubble";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { KeyValue, ListItem } from "@/components/ui/ListItem";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useKmc } from "@/context/KmcContext";
import { CITY_TARGETS, DASHBOARD_ATTENTION, RECENT_ACTIVITY, wardSnapshot } from "@/data/kmc";
import { WardMap } from "./WardMap";

const ATTENTION_TARGET = {
  vehicle: { icon: Truck, href: "/kmc/vehicles" },
  schedule: { icon: CalendarDays, href: "/kmc/collection" },
  complaint: { icon: TriangleAlert, href: "/kmc/reports" },
};

export function KmcDashboard() {
  const router = useRouter();
  const { selectedWard } = useKmc();
  const ward = wardSnapshot(selectedWard);

  return (
    <>
      <KpiGrid>
        <Kpi icon={<Trash2 />} label="Waste Collected" value="1,600 tons" note="↑ 6% vs. last week" />
        <Kpi icon={<Leaf />} label="Collection Coverage" value="92%" note="↑ 4% vs. last month" />
        <Kpi icon={<Truck />} label="Active Vehicles" value="128" note="112 operational · 16 maintenance" />
        <Kpi icon={<TriangleAlert />} label="Escalated Complaints" value="18" note="↑ 20% vs. last week" trend="down" />
      </KpiGrid>

      <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader title="Kathmandu Wards (32)" subtitle="Select a ward to see its status" />
          <div className="grid flex-1 gap-3 md:grid-cols-[1.5fr_1fr]">
            <WardMap />
            <Card>
              <CardHeader title={`Ward ${selectedWard}`} subtitle={<>Today&apos;s status: <KmcStatus status={ward.status} /></>} />
              <KeyValue label="Waste collected" value={ward.collected} />
              <KeyValue label="Coverage" value={ward.coverage} />
              <KeyValue label="Active vehicles" value={ward.vehicles} />
              <KeyValue label="Open issues" value={ward.openIssues} />
              <Button className="mt-auto" onClick={() => router.push("/kmc/monitoring")}>
                View ward details
              </Button>
            </Card>
          </div>
        </Card>

        <Card>
          <CardHeader title="Needs KMC Attention" subtitle="12 items pending" />
          {DASHBOARD_ATTENTION.map((item) => {
            const { icon: Icon, href } = ATTENTION_TARGET[item.kind];
            return (
              <ListItem
                key={item.title}
                leading={
                  <IconBubble>
                    <Icon />
                  </IconBubble>
                }
                title={item.title}
                subtitle={item.detail}
                trailing={<KmcStatus status={item.status} />}
                onClick={() => router.push(href)}
              />
            );
          })}
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr]">
        <Card>
          <CardHeader title="Citywide Progress" subtitle="Progress toward waste management targets" />
          {CITY_TARGETS.map((t) => (
            <div key={t.label} className="flex items-center gap-3 border-b border-line py-2 last:border-b-0">
              <div className="flex-1">
                <span className="mb-1 block text-[13px]">{t.label}</span>
                <ProgressBar value={t.value} />
              </div>
              <b>{t.value}%</b>
            </div>
          ))}
        </Card>

        <Card>
          <CardHeader title="Ward Performance" />
          <div className="flex flex-1 items-center gap-4">
            <Donut
              size={112}
              thickness={18}
              segments={[
                { value: 81, color: "var(--brand)" },
                { value: 13, color: "#fbe9b7" },
                { value: 6, color: "#f8c9c9" },
              ]}
            >
              <b className="block text-xl">32</b>
              <small className="text-muted">Wards</small>
            </Donut>
            <div className="flex-1">
              <KeyValue label="On schedule" value="26 · 81%" />
              <KeyValue label="Partial" value="4 · 12%" />
              <KeyValue label="Intervention" value="2 · 6%" />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent Activity" />
          {RECENT_ACTIVITY.map((a) => (
            <div key={a.text} className="flex justify-between gap-3 border-b border-line py-1.5 text-[13px] last:border-b-0">
              <span>{a.text}</span>
              <span className="flex-none text-muted">{a.time}</span>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
