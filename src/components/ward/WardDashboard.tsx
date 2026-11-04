"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CalendarDays, ChartColumn, FileText, Info, MapPin, Megaphone, Star, Timer, TriangleAlert, Trash2, Truck, Users } from "lucide-react";
import { Badge, WardStatus } from "@/components/ui/Badge";
import { TextLink } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Donut } from "@/components/ui/Donut";
import { IconBubble } from "@/components/ui/IconBubble";
import { Kpi } from "@/components/ui/Kpi";
import { ListItem } from "@/components/ui/ListItem";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tabs } from "@/components/ui/Tabs";
import { useWard } from "@/context/WardContext";
import { ATTENTION_ITEMS, OPEN_COMPLAINT_COUNT, UPCOMING_ACTIVITIES, VEHICLES } from "@/data/ward";
import { STATUS_COLORS } from "@/lib/status";
import { RouteMap } from "./RouteMap";
import { WardPage } from "./WardPage";

const ATTENTION_ICONS = { missed: TriangleAlert, delayed: Timer, complaint: FileText, vehicle: Truck, schedule: CalendarDays };
const ACTIVITY_ICONS = { program: Megaphone, schedule: CalendarDays, file: FileText };

export function WardDashboard() {
  const router = useRouter();
  const { routes, stops, metrics, openStops } = useWard();
  const [panel, setPanel] = useState<"routes" | "stops">("routes");
  const available = VEHICLES.filter((v) => v.status !== "Maintenance").length;

  const rail = (
    <>
      <Card className="flex-[1.5]">
        <CardHeader
          icon={<Bell />}
          title="Needs your attention"
          badge={<Badge tone="danger">{ATTENTION_ITEMS.length}</Badge>}
          action={<TextLink href="/ward/collection">View all</TextLink>}
        />
        <div className="flex flex-col gap-1.5">
          {ATTENTION_ITEMS.map((item) => {
            const Icon = ATTENTION_ICONS[item.kind];
            return (
              <ListItem
                key={item.title}
                boxed
                leading={
                  <IconBubble tone={item.tone} square>
                    <Icon />
                  </IconBubble>
                }
                title={item.title}
                subtitle={
                  <>
                    {item.where}
                    <br />
                    {item.next}
                  </>
                }
                onClick={() => router.push(item.href)}
              />
            );
          })}
        </div>
      </Card>
      <Card>
        <CardHeader icon={<CalendarDays />} title="Upcoming activities" action={<TextLink href="/ward/awareness">View all</TextLink>} />
        <div className="flex flex-col gap-1.5">
          {UPCOMING_ACTIVITIES.map((a) => {
            const Icon = ACTIVITY_ICONS[a.kind];
            return (
              <ListItem
                key={a.title}
                boxed
                leading={
                  <IconBubble tone={a.tone} square>
                    <Icon />
                  </IconBubble>
                }
                title={a.title}
                subtitle={a.when}
                trailing={<WardStatus status={a.status} />}
              />
            );
          })}
        </div>
      </Card>
    </>
  );

  return (
    <WardPage rail={rail}>
      <Card>
        <CardHeader icon={<Timer />} title="Today’s operational summary" action={<TextLink href="/ward/collection">View all →</TextLink>} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi
            square
            icon={<Truck />}
            label="Collections"
            value={`${metrics.completed} / ${metrics.total}`}
            note="Stops completed today"
            trend="muted"
            onClick={() => router.push("/ward/collection")}
            className="bg-gradient-to-r from-[#eef9f4] to-surface"
          >
            <div className="my-0.5 flex items-center gap-1.5">
              <ProgressBar value={metrics.completionRate} className="w-24" />
              <span className="text-xs text-muted">{metrics.completionRate}%</span>
            </div>
          </Kpi>
          <Kpi
            square
            tone="warn"
            icon={<TriangleAlert />}
            label="Delayed / Missed"
            value={metrics.delayed + metrics.missed}
            note="Need follow-up"
            trend="muted"
            onClick={() => router.push("/ward/collection")}
          />
          <Kpi
            square
            tone="danger"
            icon={<FileText />}
            label="Open complaints"
            value={OPEN_COMPLAINT_COUNT}
            note="2 overdue"
            trend="muted"
            onClick={() => router.push("/ward/reports")}
          />
          <Kpi
            square
            tone="info"
            icon={<Truck />}
            label="Vehicles available"
            value={`${available} / ${VEHICLES.length}`}
            note="Demo vehicle inventory"
            trend="muted"
            onClick={() => router.push("/ward/vehicles")}
          />
        </div>
      </Card>

      <Card className="flex-1">
        <CardHeader
          icon={<MapPin />}
          title="Collection activity"
          badge={<Badge tone="neutral">Demo data</Badge>}
          subtitle="GPS location separate from driver-confirmed status"
          action={<TextLink href="/ward/collection">View all routes →</TextLink>}
        />
        <div className="grid min-h-0 gap-3 lg:h-[23rem] lg:grid-cols-[1.35fr_1fr] lg:grid-rows-[minmax(0,1fr)]">
          <RouteMap legend />
          <div className="flex min-h-0 flex-col rounded-[10px] border border-line px-2.5 py-1">
            <Tabs
              variant="underline"
              value={panel}
              onChange={setPanel}
              items={[
                { value: "routes", label: "Routes" },
                { value: "stops", label: "Stops" },
              ]}
            />
            <div className="max-h-80 min-h-0 flex-1 overflow-y-auto lg:max-h-none">
              {panel === "routes"
                ? routes.map((r) => (
                    <ListItem
                      key={r.routeId}
                      leading={<span className="size-2.5 flex-none rounded-full" style={{ background: r.color }} />}
                      title={r.name}
                      subtitle={
                        <>
                          {r.vehicle} · Driver: {r.driver}
                          <br />
                          {r.done} / {r.total} stops · {r.start}–{r.end}
                        </>
                      }
                      trailing={<WardStatus status={r.status} />}
                      onClick={() => openStops(r.routeId)}
                    />
                  ))
                : stops.map((s) => (
                    <ListItem
                      key={s.stopId}
                      leading={<span className="size-2.5 flex-none rounded-full" style={{ background: STATUS_COLORS[s.status] }} />}
                      title={s.location}
                      subtitle={`${s.stopId} · ${s.scheduledTime} · ${s.wasteType}`}
                      trailing={<WardStatus status={s.status} />}
                      onClick={() => openStops(s.routeId)}
                    />
                  ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader icon={<ChartColumn />} title="Ward progress snapshot" action={<TextLink href="/ward/performance">View details</TextLink>} />
        <div className="grid items-center gap-3 sm:grid-cols-2 xl:grid-cols-[1.1fr_1fr_1fr_1fr_1.5fr]">
          <div className="flex items-center gap-2.5">
            <Donut
              size={56}
              thickness={8}
              segments={[
                { value: metrics.completionRate, color: "var(--brand)" },
                { value: 100 - metrics.completionRate, color: "#d8eee3" },
              ]}
            >
              <b className="text-xs">{metrics.completionRate}%</b>
            </Donut>
            <div>
              <span className="block text-xs text-muted">Collection completion rate</span>
              <b className="text-[13px]">
                {metrics.completed} / {metrics.total} stops
              </b>
            </div>
          </div>
          <Snapshot icon={<Trash2 />} value="12.6 tons" label="Waste collected (today)" note="↑ 8% vs. last week" />
          <Snapshot icon={<Users />} value="124" label="Awareness participation" note="↑ 12% vs. last month" />
          <Snapshot icon={<Star />} value="3 / 5" label="Milestones achieved" note="On track" />
          <div className="flex gap-2.5 rounded-[10px] bg-tint px-3 py-2.5 text-xs text-[#3f6354] sm:col-span-2 xl:col-span-1">
            <Info className="size-4 flex-none text-brand" />
            <div>
              <b className="block text-[12.5px] text-ink">GPS-supported tracking is active</b>
              You can view current vehicle locations and route progress on the map. Drivers also update collection status manually from the mobile app.
            </div>
          </div>
        </div>
      </Card>
    </WardPage>
  );
}

function Snapshot({ icon, value, label, note }: { icon: React.ReactNode; value: string; label: string; note: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <IconBubble square>{icon}</IconBubble>
      <div>
        <b className="block text-lg leading-tight">{value}</b>
        <span className="block text-xs text-muted">{label}</span>
        <span className="block text-xs text-brand">{note}</span>
      </div>
    </div>
  );
}
