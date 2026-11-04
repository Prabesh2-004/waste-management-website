"use client";

import { FileText, Leaf, Lock, Recycle, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { Donut } from "@/components/ui/Donut";
import { IconBubble } from "@/components/ui/IconBubble";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { ListItem } from "@/components/ui/ListItem";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/context/ToastContext";
import { KMC_UPDATES, MILESTONES, PERFORMANCE_ACTIVITY, PUBLIC_NOTICES, WEEKLY_COLLECTION } from "@/data/ward";
import { HelpBox, QuickActions, WardPage } from "./WardPage";

const BRAND = "#0f8a5a";
/** Chart y-axis: value 10 sits on the baseline (y=130), 1 unit = 1.5px. */
const y = (value: number) => 130 - (value - 10) * 1.5;

function CollectionChart() {
  return (
    <svg viewBox="0 0 330 150" className="h-auto min-h-[150px] w-full flex-1" role="img" aria-label="Collection over the last 7 days">
      <path d="M25 10H330M25 50H330M25 90H330M25 130H330" stroke="#e6f0ec" />
      <g fontSize="9" fill="#889">
        {[80, 60, 40, 20].map((label, i) => (
          <text key={label} x="2" y={13 + i * 40}>
            {label}
          </text>
        ))}
      </g>
      {WEEKLY_COLLECTION.map((d, i) => {
        const x = 34 + i * 42;
        return (
          <g key={d.day}>
            <rect x={x} y={y(d.total)} width="24" height={130 - y(d.total)} fill="#c9e9d9" />
            <rect x={x} y={y(d.recyclables)} width="24" height={130 - y(d.recyclables)} fill={BRAND} />
            <text x={x} y="146" fontSize="9" fill="#889">
              {d.day}
            </text>
          </g>
        );
      })}
      <polyline fill="none" stroke={BRAND} strokeWidth="2" points={WEEKLY_COLLECTION.map((d, i) => `${46 + i * 42},${y(d.coverage)}`).join(" ")} />
    </svg>
  );
}

export function WardPerformance() {
  const toast = useToast();

  const rail = (
    <>
      <QuickActions
        actions={[
          { title: "Create public notice", description: "Share updates with the community", onClick: () => toast("Create public notice") },
          { title: "Post KMC update", description: "Internal updates for KMC officials", onClick: () => toast("Post KMC update") },
          { title: "Download performance report", description: "PDF · Excel", onClick: () => toast("Preparing performance report") },
        ]}
      />
      <Card className="flex-1">
        <CardHeader title="Recent activity" />
        {PERFORMANCE_ACTIVITY.map((a) => (
          <div key={a.title} className="border-b border-line py-2 last:border-b-0">
            <span className="block text-[13px]">{a.title}</span>
            <small className="text-xs text-muted">{a.detail}</small>
          </div>
        ))}
      </Card>
      <Card>
        <CardHeader title="Update permissions" />
        <div className="grid grid-cols-2 gap-2">
          <HelpBox title="Public notices">
            <Users className="mb-1 size-4 text-brand" />
            Visible to all residents. Published by: Ward Official
          </HelpBox>
          <HelpBox title="KMC updates">
            <Lock className="mb-1 size-4 text-brand" />
            Visible to KMC officials only. Published by: KMC
          </HelpBox>
        </div>
      </Card>
    </>
  );

  return (
    <WardPage rail={rail}>
      <KpiGrid>
        <Kpi square icon={<Trash2 />} label="Total Waste Collected" value="228.4 tons" note="↑ 12% vs. last week" />
        <Kpi square icon={<Recycle />} label="Recyclables Recovered" value="78.2 tons" note="↑ 18% vs. last week" />
        <Kpi square icon={<Leaf />} label="Collection Coverage" value="92%" note="↑ 5% vs. last month" />
        <Kpi square icon={<Users />} label="Community Participation" value="1,245" note="↑ 27% vs. last month" />
      </KpiGrid>

      <div className="grid gap-3 lg:grid-cols-[1.25fr_1fr]">
        <Card>
          <CardHeader title="Collection Performance" action={<span className="text-xs text-muted">Last 7 days</span>} />
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <CollectionChart />
            <div className="mx-auto flex w-[120px] flex-col items-center gap-1 text-center">
              <Donut
                size={92}
                segments={[
                  { value: 92, color: "var(--brand)" },
                  { value: 8, color: "#d8eee3" },
                ]}
              >
                <b className="text-base">92%</b>
              </Donut>
              <span className="text-[13px]">Coverage rate</span>
              <HelpBox title="Target: 90%" className="w-full">
                ✓ On track
              </HelpBox>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Ward Milestones" />
          <div className="flex flex-col gap-3">
            {MILESTONES.map((m) => (
              <div key={m.title}>
                <span className="block text-[13px] font-medium">{m.title}</span>
                <small className="block text-xs text-muted">{m.target}</small>
                <div className="mt-1 flex items-center gap-2">
                  <ProgressBar value={m.progress} className="flex-1" />
                  <span className="w-10 text-right text-xs">{m.label}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader title="Public Notices" />
          {PUBLIC_NOTICES.map((n) => (
            <ListItem
              key={n.title}
              leading={<span className="h-[34px] w-11 flex-none rounded-[7px] bg-gradient-to-br from-[#9fd3b7] to-[#4b9c78]" />}
              title={
                <>
                  <Badge>Public</Badge> {n.title}
                </>
              }
              subtitle={n.body}
              trailing={<small className="flex-none text-xs text-muted">{n.date}</small>}
              onClick={() => toast(n.title)}
            />
          ))}
        </Card>
        <Card>
          <CardHeader title="KMC Updates" />
          {KMC_UPDATES.map((u) => (
            <ListItem
              key={u.title}
              leading={
                <IconBubble tone="info" square>
                  <FileText />
                </IconBubble>
              }
              title={
                <>
                  <Badge tone="info">KMC Only</Badge> {u.title}
                </>
              }
              subtitle={u.body}
              trailing={<small className="flex-none text-xs text-muted">{u.date}</small>}
              onClick={() => toast(u.title)}
            />
          ))}
        </Card>
      </div>
    </WardPage>
  );
}
