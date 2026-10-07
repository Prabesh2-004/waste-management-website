"use client";

import { useRouter } from "next/navigation";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { SplitBar } from "@/components/ui/Bars";
import { Select } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { Row } from "@/components/ui/Row";
import { StatStrip } from "@/components/ui/StatStrip";
import { Chips } from "@/components/ui/Tabs";
import { KmcStatus } from "../KmcStatus";
import { useKmc } from "@/context/KmcContext";
import { completionPercent } from "@/lib/kmc";
import { parseWard, wardLabel, wardOptions } from "@/lib/format";
import meta from "@/data/shared/meta.json";
import shared from "@/data/shared/options.json";
import options from "@/data/kmc/options.json";

export function KmcWards() {
  const {
    wards, selectedWard, selectWard, wardStatus, period, setPeriod, routes, programs, reports,
    openComplaints, driverOf, setReportStatusFilter, setReportCategory,
  } = useKmc();
  const router = useRouter();
  const ward = wards[selectedWard - 1];
  const factor = options.wardPeriods.find((p) => p.label === period)?.factor ?? 1;
  const total = ward.t * factor;
  const organic = total * shared.organicRatio;
  const status = wardStatus[selectedWard];
  const wardRoutes = routes.filter((x) => x.w === selectedWard);
  const wardPrograms = programs.filter((p) => p.w === selectedWard);
  const wardReports = reports.filter((r) => r.w === selectedWard);

  return (
    <>
      <PageHeader
        title={`Ward ${selectedWard}`}
        subtitle="A closer look at one ward"
        action={
          <div className="w-[150px]">
            <Select
              options={wardOptions(meta.wardCount)}
              value={wardLabel(selectedWard)}
              onChange={(v) => selectWard(parseWard(v))}
            />
          </div>
        }
      />
      <StatStrip
        items={[
          { label: "Waste collected", value: `${total.toFixed(1)} t` },
          { label: "Collection completion", value: `${completionPercent(ward, status)}%` },
          { label: "Active vehicles", value: String(ward.veh) },
          { label: "Open complaints", value: String(openComplaints(selectedWard)) },
        ]}
      />
      <Chips items={options.wardPeriods.map((p) => p.label)} active={period} onChange={setPeriod} />
      <div className="grid gap-[22px] lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <Box>
          <h2>Waste</h2>
          <SplitBar
            segments={[
              { percent: shared.organicRatio * 100, className: "bg-ac" },
              { percent: 100 - shared.organicRatio * 100, className: "bg-line" },
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
          <h2 className="mt-[18px]">Collection &amp; vehicles</h2>
          <Row>
            <span>Status today</span>
            <span>
              <KmcStatus status={status} />
            </span>
          </Row>
          {wardRoutes.map((r) => (
            <Row key={r.n}>
              <span>
                {r.v} · {driverOf(r.v)}
              </span>
              <span className="text-mut">Route {r.n}</span>
            </Row>
          ))}
          {wardRoutes.length === 0 && <p className="text-[13px] text-mut">Routes run normally.</p>}
        </Box>
        <Box>
          <h2>Awareness</h2>
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
          <h2 className="mt-[18px]">Complaints</h2>
          <Row>
            <span>Open</span>
            <b>{openComplaints(selectedWard)}</b>
          </Row>
          <Row>
            <span>Resolved</span>
            <b>{wardReports.filter((r) => r.s === "Resolved").length}</b>
          </Row>
          <p>
            <Button
              variant="link"
              onClick={() => {
                setReportStatusFilter("All");
                setReportCategory("All");
                router.push("/kmc/reports");
              }}
            >
              See all reports
            </Button>
          </p>
        </Box>
      </div>
    </>
  );
}
