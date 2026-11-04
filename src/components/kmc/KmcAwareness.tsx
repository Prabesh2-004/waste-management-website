"use client";

import { useState } from "react";
import { CalendarDays, MapPin, Megaphone, Users } from "lucide-react";
import { KmcStatus } from "@/components/ui/Badge";
import { Button, ButtonRow } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Field, inputClass } from "@/components/ui/Field";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tabs } from "@/components/ui/Tabs";
import { useKmc } from "@/context/KmcContext";
import { useToast } from "@/context/ToastContext";
import type { Campaign } from "@/data/kmc";

type Filter = "All" | Campaign["type"];

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "All", label: "All" },
  { value: "Citywide", label: "Citywide" },
  { value: "Ward", label: "Ward" },
];

const CARD_GRADIENTS = [
  "from-[#7fc99a] to-[#2b9a5c]",
  "from-[#7fc99a] to-[#2b9a5c]",
  "from-[#e8c27a] to-[#d98b3a]",
  "from-[#9cc5e8] to-[#4b8fd0]",
];

const EMPTY_FORM = { name: "", type: "Citywide" as Campaign["type"], description: "", startDate: "", audience: "General public" };

const percent = (c: Campaign) => (c.capacity ? (c.registered / c.capacity) * 100 : 0);

function formatDate(isoDate: string): string {
  if (!isoDate) return "TBD";
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function KmcAwareness() {
  const { campaigns, addCampaign } = useKmc();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("All");
  const [form, setForm] = useState(EMPTY_FORM);

  const rows = campaigns.filter((c) => filter === "All" || c.type === filter);
  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const create = () => {
    const name = form.name.trim();
    if (!name) {
      toast("Enter a campaign name");
      return;
    }
    addCampaign({
      name,
      type: form.type,
      dates: formatDate(form.startDate),
      wards: form.type === "Ward" ? "Ward 1" : "All 32",
      registered: 0,
      capacity: 100,
      status: "Draft",
    });
    setForm(EMPTY_FORM);
    setFilter("All");
    toast("Campaign created");
  };

  return (
    <>
      <KpiGrid>
        <Kpi icon={<Megaphone />} label="Upcoming Campaigns" value="4" note="2 citywide · 2 ward-specific" />
        <Kpi icon={<CalendarDays />} label="Total Registrations" value="2,842" note="↑ 18% vs. last month" />
        <Kpi icon={<Users />} label="Attendance Recorded" value="2,317" note="↑ 22% vs. last month" />
        <Kpi icon={<MapPin />} label="Wards Participating" value="28 / 32" note="↑ 9 vs. last month" />
      </KpiGrid>

      <div className="grid flex-1 gap-3 xl:grid-cols-[2.3fr_1fr]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {campaigns.slice(0, 4).map((c, i) => (
              <div key={c.name} className="overflow-hidden rounded-xl border border-line bg-surface">
                <div className={`h-20 bg-gradient-to-br ${CARD_GRADIENTS[i]}`} />
                <div className="p-3">
                  <b className="block leading-snug">{c.name}</b>
                  <p className="my-1 text-xs text-muted">
                    {c.dates} · {c.wards}
                  </p>
                  <ProgressBar value={percent(c)} />
                  <small className="mt-1 block text-xs text-muted">
                    {c.registered} / {c.capacity} registered
                  </small>
                  <div className="mt-2">
                    <KmcStatus status={c.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Card className="flex-1">
            <CardHeader title="Campaigns & Events" />
            <Tabs items={FILTERS} value={filter} onChange={setFilter} />
            <DataTable
              rows={rows}
              rowKey={(c) => c.name}
              columns={[
                { header: "Campaign", cell: (c) => c.name },
                { header: "Type", cell: (c) => c.type },
                { header: "Date", cell: (c) => c.dates, className: "whitespace-nowrap" },
                { header: "Wards", cell: (c) => c.wards },
                {
                  header: "Registration",
                  cell: (c) => (
                    <>
                      <span className="mb-1 block whitespace-nowrap">
                        {c.registered} / {c.capacity}
                      </span>
                      <ProgressBar value={percent(c)} />
                    </>
                  ),
                },
                { header: "Status", cell: (c) => <KmcStatus status={c.status} /> },
              ]}
            />
          </Card>
        </div>

        <Card>
          <CardHeader title="Create Campaign" subtitle="Add a new citywide or ward campaign" />
          <form
            className="flex flex-1 flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              create();
            }}
          >
            <Field label="Campaign name *">
              <input className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Clean Kathmandu Green Future" />
            </Field>
            <Field label="Campaign type *">
              <select className={inputClass} value={form.type} onChange={(e) => update("type", e.target.value as Campaign["type"])}>
                <option>Citywide</option>
                <option>Ward</option>
              </select>
            </Field>
            <Field label="Description *">
              <textarea
                rows={3}
                className={`${inputClass} resize-none`}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Add a brief description"
              />
            </Field>
            <Field label="Start date">
              <input type="date" className={inputClass} value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
            </Field>
            <Field label="Target audience">
              <select className={inputClass} value={form.audience} onChange={(e) => update("audience", e.target.value)}>
                <option>General public</option>
                <option>Students</option>
                <option>Households</option>
              </select>
            </Field>
            <ButtonRow>
              <Button variant="outline" onClick={() => setForm(EMPTY_FORM)}>
                Cancel
              </Button>
              <Button type="submit">Create Campaign</Button>
            </ButtonRow>
          </form>
        </Card>
      </div>
    </>
  );
}
