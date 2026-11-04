"use client";

import { CalendarDays, CircleCheck, CircleDashed, Plus, Users } from "lucide-react";
import { WardStatus } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Donut, LegendRow } from "@/components/ui/Donut";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { useToast } from "@/context/ToastContext";
import { ATTENDANCE, AWARENESS_ACTIVITY, PARTICIPANTS, PROGRAMS } from "@/data/ward";
import { HelpBox, WardPage } from "./WardPage";

export function WardAwareness() {
  const toast = useToast();

  const rail = (
    <>
      <Button onClick={() => toast("Create new program")}>
        <Plus className="size-4" /> Create new program
      </Button>
      <Card>
        <CardHeader title="Program summary" />
        <div className="flex items-center gap-2.5">
          <Donut size={84} thickness={13} segments={PARTICIPANTS.map((p) => ({ value: p.share, color: p.color }))}>
            <b className="block text-base">342</b>
            <small className="text-[10px] text-muted">Participants</small>
          </Donut>
          <div className="flex flex-1 flex-col gap-1.5">
            {PARTICIPANTS.map((p) => (
              <LegendRow key={p.label} color={p.color} label={p.label} value={p.value} />
            ))}
          </div>
        </div>
      </Card>
      <Card className="flex-1">
        <CardHeader title="Recent activity" />
        {AWARENESS_ACTIVITY.map((a) => (
          <div key={a.title} className="flex gap-2 border-b border-line py-2 last:border-b-0">
            <div className="min-w-0 flex-1">
              <span className="block text-[13px]">{a.title}</span>
              <small className="text-xs text-muted">{a.detail}</small>
            </div>
            <small className="flex-none text-xs text-muted">{a.time}</small>
          </div>
        ))}
      </Card>
      <HelpBox title="Impact so far">More awareness. Less waste. Your programs help build a cleaner, healthier and more sustainable Ward 17.</HelpBox>
    </>
  );

  return (
    <WardPage rail={rail}>
      <KpiGrid>
        <Kpi square icon={<CalendarDays />} label="Total Programs" value="8" note="This month" trend="muted" />
        <Kpi square icon={<Users />} label="Total Participants" value="342" note="This month" trend="muted" />
        <Kpi square icon={<CircleCheck />} label="Completed" value="5" note="62% of total" trend="muted" />
        <Kpi square icon={<CircleDashed />} label="Upcoming" value="3" note="This month" trend="muted" />
      </KpiGrid>

      <Card className="flex-1">
        <CardHeader title="Upcoming Programs" />
        {PROGRAMS.map((p) => {
          const isDraft = p.status === "Draft";
          return (
            <div key={p.title} className="flex flex-wrap items-center gap-3 border-b border-line py-2 last:border-b-0">
              <div className="h-[46px] w-[62px] flex-none rounded-[7px] bg-gradient-to-br from-[#9fd3b7] to-[#4b9c78]" />
              <div className="min-w-[12rem] flex-1">
                <b className="block text-brand-strong">{p.title}</b>
                <small className="text-xs text-muted">{p.when}</small>
              </div>
              <WardStatus status={p.status} />
              <div className="w-[70px]">
                <b className="block">{p.registered}</b>
                <small className="text-xs text-muted">Registered</small>
              </div>
              <div className="w-[56px]">
                <b className="block">{p.attended}</b>
                <small className="text-xs text-muted">Attended</small>
              </div>
              <Button size="sm" variant={isDraft ? "soft" : "primary"} onClick={() => toast(`${isDraft ? "Edit" : "View details"}: ${p.title}`)}>
                {isDraft ? "Edit" : "View details"}
              </Button>
            </div>
          );
        })}
      </Card>

      <Card>
        <CardHeader title="Program registration & attendance" action={<span className="text-xs text-muted">Last 30 days</span>} />
        <DataTable
          rows={ATTENDANCE}
          rowKey={(r) => r.program}
          onRowClick={(r) => toast(r.program)}
          columns={[
            { header: "Program", cell: (r) => r.program },
            { header: "Date", cell: (r) => r.date, className: "whitespace-nowrap" },
            { header: "Registered", cell: (r) => r.registered },
            { header: "Attended", cell: (r) => r.attended },
            { header: "Rate", cell: (r) => r.rate },
            { header: "Status", cell: (r) => <WardStatus status={r.status} /> },
          ]}
        />
      </Card>
    </WardPage>
  );
}
