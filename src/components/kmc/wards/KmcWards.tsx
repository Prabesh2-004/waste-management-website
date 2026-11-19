"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BarChart3, CheckCircle2, Leaf, Megaphone, MessageSquareWarning, Search, Trash2, Truck } from "lucide-react";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { ProgressBar, SplitBar } from "@/components/ui/Bars";
import { Input, Select } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { Row } from "@/components/ui/Row";
import { StatStrip } from "@/components/ui/StatStrip";
import { Chips } from "@/components/ui/Tabs";
import { KmcStatus } from "../KmcStatus";
import { useKmc } from "@/context/KmcContext";
import { completionPercent } from "@/lib/kmc";
import { parseWard, wardLabel, wardOptions } from "@/lib/format";
import { cn } from "@/lib/cn";
import meta from "@/data/shared/meta.json";
import shared from "@/data/shared/options.json";
import options from "@/data/kmc/options.json";

const STATUS_FILTERS = ["All", ...options.collectionStatuses];

export function KmcWards() {
  const {
    wards, selectedWard, selectWard, wardStatus, period, setPeriod, routes, programs, reports,
    openComplaints, driverOf, setReportStatusFilter, setReportCategory,
  } = useKmc();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const ward = wards[selectedWard - 1];
  const factor = options.wardPeriods.find((p) => p.label === period)?.factor ?? 1;
  const total = ward.t * factor;
  const organic = total * shared.organicRatio;
  const status = wardStatus[selectedWard];
  const wardRoutes = routes.filter((x) => x.w === selectedWard);
  const wardPrograms = programs.filter((p) => p.w === selectedWard);
  const wardReports = reports.filter((r) => r.w === selectedWard);
  const q = query.replace(/\D/g, "");
  const table = wards.filter((w) => (statusFilter === "All" || wardStatus[w.n] === statusFilter) && (!q || String(w.n).includes(q)));
  const maxTons = Math.max(1, ...wards.map((w) => w.t));

  return (
    <>
      <PageHeader
        title="Ward Monitoring"
        subtitle="Track ward performance, compare progress and find wards that need city-level support"
        action={
          <div className="w-[150px]">
            <Select
              aria-label="Ward"
              options={wardOptions(meta.wardCount)}
              value={wardLabel(selectedWard)}
              onChange={(v) => selectWard(parseWard(v))}
            />
          </div>
        }
      />
      <StatStrip
        items={[
          { label: `Ward ${selectedWard} waste`, value: `${total.toFixed(1)} t`, hint: period, icon: <Trash2 size={20} /> },
          { label: "Collection completion", value: `${completionPercent(ward, status)}%`, hint: status, icon: <CheckCircle2 size={20} />, tone: "G" },
          { label: "Active vehicles", value: String(ward.veh), hint: `Ward ${selectedWard}`, icon: <Truck size={20} />, tone: "B" },
          { label: "Open complaints", value: String(openComplaints(selectedWard)), hint: `Ward ${selectedWard}`, icon: <MessageSquareWarning size={20} />, tone: "R" },
        ]}
      />
      <Chips items={options.wardPeriods.map((p) => p.label)} active={period} onChange={setPeriod} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Box title={`Ward ${selectedWard} · waste & collection`} icon={<Leaf size={18} />}>
          <b className="text-2xl">{total.toFixed(1)} t</b>
          <SplitBar
            segments={[
              { percent: shared.organicRatio * 100, className: "bg-ok" },
              { percent: 100 - shared.organicRatio * 100, className: "bg-info" },
            ]}
          />
          <Row>
            <span>Organic</span>
            <b>{organic.toFixed(1)} t</b>
          </Row>
          <Row>
            <span>Inorganic</span>
            <b>{(total - organic).toFixed(1)} t</b>
          </Row>
          <h3 className="mt-4">Collection &amp; vehicles</h3>
          <Row>
            <span>Status today</span>
            <KmcStatus status={status} />
          </Row>
          {wardRoutes.map((r) => (
            <Row key={r.n}>
              <span className="flex items-center gap-2">
                <Truck size={15} className="text-ac" /> {r.v} · {driverOf(r.v)}
              </span>
              <span className="text-mut">Route {r.n}</span>
            </Row>
          ))}
          {wardRoutes.length === 0 && <p className="m-0 text-[13px] text-mut">Routes run normally.</p>}
        </Box>
        <Box title="Awareness & complaints" icon={<Megaphone size={18} />}>
          <Row>
            <span>Programs conducted</span>
            <b>{wardPrograms.filter((p) => p.s === "Completed").length}</b>
          </Row>
          <Row>
            <span>Upcoming</span>
            <b>{wardPrograms.filter((p) => p.s === "Upcoming").length}</b>
          </Row>
          <Row>
            <span>Participation</span>
            <b>{wardPrograms.reduce((a, p) => a + p.att, 0)}</b>
          </Row>
          <Row>
            <span>Open complaints</span>
            <b>{openComplaints(selectedWard)}</b>
          </Row>
          <Row>
            <span>Resolved complaints</span>
            <b>{wardReports.filter((r) => r.s === "Resolved").length}</b>
          </Row>
          {openComplaints(selectedWard) > 2 && (
            <p className="mb-0 mt-3 flex items-center gap-2 rounded-xl bg-warn-soft px-3 py-2 text-[13px] text-warn">
              <AlertTriangle size={15} /> Many open complaints: this ward may need support.
            </p>
          )}
          <Button
            variant="link"
            className="mt-2"
            onClick={() => {
              setReportStatusFilter("All");
              setReportCategory("All");
              router.push("/kmc/reports");
            }}
          >
            See all reports
          </Button>
        </Box>
      </div>

      <Box title="Ward performance" icon={<BarChart3 size={18} />} className="mt-5">
        <div className="mb-3 grid gap-2 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] sm:items-center">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mut" />
            <Input className="pl-9" inputMode="numeric" placeholder="Ward number…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search ward" />
          </div>
          <Chips items={STATUS_FILTERS} active={statusFilter} onChange={setStatusFilter} />
        </div>
        <div className="hidden grid-cols-[90px_minmax(0,1.3fr)_minmax(0,1.2fr)_110px_90px_70px] gap-3 border-b border-line px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-mut md:grid">
          <span>Ward</span>
          <span>Completion</span>
          <span>Waste collected</span>
          <span>Status</span>
          <span>Complaints</span>
          <span />
        </div>
        {table.map((w) => {
          const pct = completionPercent(w, wardStatus[w.n]);
          return (
            <button
              key={w.n}
              type="button"
              onClick={() => {
                selectWard(w.n);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={cn(
                "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 border-b border-line px-2 py-2.5 text-left text-sm last:border-b-0 hover:bg-ac-faint md:grid-cols-[90px_minmax(0,1.3fr)_minmax(0,1.2fr)_110px_90px_70px]",
                w.n === selectedWard && "bg-ac-soft"
              )}
            >
              <b>Ward {w.n}</b>
              <span className="md:hidden">
                <KmcStatus status={wardStatus[w.n]} />
              </span>
              <span className="col-span-2 flex items-center gap-2 md:col-span-1">
                <ProgressBar className="flex-1" percent={pct} />
                <span className="w-10 text-right text-xs">{pct}%</span>
              </span>
              <span className="col-span-2 flex items-center gap-2 md:col-span-1">
                <ProgressBar className="flex-1" percent={(w.t / maxTons) * 100} barClassName="bg-info" />
                <span className="w-14 text-right text-xs">{w.t.toFixed(1)} t</span>
              </span>
              <span className="hidden md:block">
                <KmcStatus status={wardStatus[w.n]} />
              </span>
              <span className="text-xs text-mut md:text-sm md:text-ink">
                <span className="md:hidden">Open complaints: </span>
                {openComplaints(w.n)}
              </span>
              <span className="text-right text-xs font-semibold text-ac">View</span>
            </button>
          );
        })}
        {table.length === 0 && <p className="m-0 text-mut">No wards match.</p>}
      </Box>
    </>
  );
}
