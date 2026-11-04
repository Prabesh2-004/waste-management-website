"use client";

import { useState } from "react";
import { CalendarDays, FileText, Leaf, Megaphone, Recycle, TriangleAlert, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { KmcStatus } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { IconBubble } from "@/components/ui/IconBubble";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { ListItem } from "@/components/ui/ListItem";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/context/ToastContext";
import { LATEST_UPDATES, QUICK_UPDATES, UPCOMING_EVENTS, type UpdateCategory } from "@/data/kmc";

type Filter = "All" | Extract<UpdateCategory, "Announcement" | "Report" | "Notice">;

const FILTERS: Array<{ value: Filter; label: string }> = ["All", "Announcement", "Report", "Notice"].map((v) => ({
  value: v as Filter,
  label: v,
}));

const CATEGORY_ICONS: Record<UpdateCategory, LucideIcon> = {
  Announcement: Megaphone,
  Report: FileText,
  Notice: TriangleAlert,
  Event: CalendarDays,
  Guideline: FileText,
};

const QUICK_ICONS = { leaf: Leaf, calendar: CalendarDays, file: FileText, recycle: Recycle, users: Users };

export function KmcUpdates() {
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("All");
  const updates = LATEST_UPDATES.filter((u) => filter === "All" || u.category === filter);

  return (
    <>
      <KpiGrid>
        <Kpi icon={<Megaphone />} label="Total Announcements" value="12" note="↑ 33% vs. last month" />
        <Kpi icon={<FileText />} label="Reports & Publications" value="8" note="↑ 14% vs. last month" />
        <Kpi icon={<TriangleAlert />} label="Important Notices" value="5" note="↑ 67% vs. last month" />
        <Kpi icon={<CalendarDays />} label="Upcoming Events" value="6" note="↑ 20% vs. last month" />
      </KpiGrid>

      <div className="grid flex-1 gap-3 xl:grid-cols-[2.3fr_1fr]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
            <div className="flex flex-col rounded-xl bg-gradient-to-br from-[#1c9a58] to-[#0b5a36] p-5 text-white">
              <small className="opacity-90">Oct 23, 2026 · Announcement</small>
              <h3 className="my-2 text-2xl leading-tight font-bold">New Waste Collection Schedule for Ward 17</h3>
              <p className="opacity-90">
                The collection schedule for Ward 17 has been updated effective Nov 1, 2026. See the attached schedule for details.
              </p>
              <Button variant="light" className="mt-auto w-fit" onClick={() => toast("Opening Schedule_Ward17.pdf")}>
                View details
              </Button>
            </div>
            <Card>
              <CardHeader title="Upcoming Events" />
              {UPCOMING_EVENTS.map((e) => (
                <ListItem
                  key={e.title}
                  leading={
                    <IconBubble className="content-center gap-0.5 text-[11px] leading-none font-semibold">
                      <span className="text-[9px] uppercase">{e.month}</span>
                      {e.day}
                    </IconBubble>
                  }
                  title={e.title}
                  subtitle={`${e.month} ${e.day}`}
                  trailing={<KmcStatus status={e.scope} />}
                />
              ))}
            </Card>
          </div>

          <Card className="flex-1">
            <CardHeader title="Latest Updates" />
            <Tabs items={FILTERS} value={filter} onChange={setFilter} />
            {updates.map((u) => {
              const Icon = CATEGORY_ICONS[u.category];
              return (
                <ListItem
                  key={u.title}
                  leading={
                    <IconBubble>
                      <Icon />
                    </IconBubble>
                  }
                  title={u.title}
                  subtitle={`${u.date}, 2026`}
                  trailing={<KmcStatus status={u.category} />}
                />
              );
            })}
          </Card>
        </div>

        <Card>
          <CardHeader title="Quick Updates" />
          {QUICK_UPDATES.map((q) => {
            const Icon = QUICK_ICONS[q.kind];
            return (
              <ListItem
                key={q.title}
                leading={
                  <IconBubble>
                    <Icon />
                  </IconBubble>
                }
                title={q.title}
                subtitle="Oct 2026"
                trailing={<KmcStatus status={q.status} />}
              />
            );
          })}
        </Card>
      </div>
    </>
  );
}
