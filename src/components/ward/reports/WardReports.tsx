"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, ChevronRight, Clock, FileText, Inbox, MapPin, Search } from "lucide-react";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatStrip } from "@/components/ui/StatStrip";
import { ReportFilters } from "@/components/shared/ReportFilters";
import { SourceBadge } from "@/components/shared/admin/ReportEvidence";
import { ReportIcon, matches } from "@/components/shared/admin/reportIcons";
import { WardStatus } from "../WardStatus";
import { ReportDrawer } from "./ReportDrawer";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";

export function WardReports() {
  const { reports, reportStatusFilter, setReportStatusFilter, reportCategory, setReportCategory, wardName, simulateComplaint } = useWard();
  const { openDrawer, toast } = useUi();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const list = reports.filter(
    (r) =>
      (reportStatusFilter === "All" || r.s === reportStatusFilter) &&
      (reportCategory === "All" || r.c === reportCategory) &&
      matches(query, r.ref, r.ty, r.ds, r.loc, r.src, r.rt ? `route ${r.rt}` : "")
  );
  const count = (s: string) => reports.filter((r) => r.s === s).length;

  return (
    <>
      <PageHeader
        title="Reports & Complaints"
        subtitle={`Review community reports in ${wardName} and follow each issue through resolution`}
        action={
          <Button
            variant="outline"
            onClick={() => {
              simulateComplaint();
              router.push("/ward/reports");
              toast("A citizen submitted a complaint. It is Pending.");
            }}
          >
            Simulate new citizen complaint
          </Button>
        }
      />
      <StatStrip
        items={[
          { label: "New", value: String(count("Pending")), hint: "Needs attention", icon: <Inbox size={20} />, tone: "A" },
          { label: "In progress", value: String(count("In Progress")), hint: "Being handled", icon: <Clock size={20} />, tone: "B" },
          { label: "Resolved", value: String(count("Resolved")), hint: "Completed", icon: <CheckCircle2 size={20} />, tone: "G" },
          { label: "Total", value: String(reports.length), hint: "All reports", icon: <FileText size={20} /> },
        ]}
      />
      <div className="relative mb-3">
        <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mut" />
        <Input
          className="pl-10"
          placeholder="Search by reference, issue, location or route…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search reports"
        />
      </div>
      <ReportFilters status={reportStatusFilter} category={reportCategory} onStatus={setReportStatusFilter} onCategory={setReportCategory} />
      <Box title="Reported issues" action={<span className="text-xs text-mut">{list.length} of {reports.length}</span>}>
        <div className="space-y-2.5">
          {list.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => openDrawer(<ReportDrawer reportId={r.id} />)}
              className="flex w-full items-start gap-3 rounded-2xl border border-line p-3 text-left transition-colors hover:border-ac hover:bg-ac-faint"
            >
              <ReportIcon category={r.c} status={r.s} />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <b className="text-[15px]">{r.ty}</b>
                  {r.ref && <span className="text-xs font-semibold text-mut">#{r.ref}</span>}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-mut">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {r.loc || "—"}
                    {r.rt ? ` · Route ${r.rt}` : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays size={12} /> {r.d}
                  </span>
                </span>
                <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <WardStatus status={r.s} />
                  <SourceBadge source={r.src} />
                </span>
              </span>
              <ChevronRight size={16} className="mt-2 shrink-0 text-mut" />
            </button>
          ))}
        </div>
        {list.length === 0 && <p className="m-0 text-mut">No reports match.</p>}
      </Box>
    </>
  );
}
