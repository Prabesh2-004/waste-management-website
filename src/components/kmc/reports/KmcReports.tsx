"use client";

import { Box } from "@/components/ui/Box";
import { PageHeader } from "@/components/ui/PageHeader";
import { Row } from "@/components/ui/Row";
import { ReportFilters } from "@/components/shared/ReportFilters";
import { KmcStatus } from "../KmcStatus";
import { ReportDrawer } from "./ReportDrawer";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";

export function KmcReports() {
  const { reports, reportStatusFilter, setReportStatusFilter, reportCategory, setReportCategory } = useKmc();
  const { openDrawer } = useUi();
  const list = reports.filter(
    (r) => (reportStatusFilter === "All" || r.s === reportStatusFilter) && (reportCategory === "All" || r.c === reportCategory)
  );

  return (
    <>
      <PageHeader title="Reports & Complaints" subtitle="Issues from citizens, drivers and wards. Wards handle them; KMC monitors." />
      <ReportFilters status={reportStatusFilter} category={reportCategory} onStatus={setReportStatusFilter} onCategory={setReportCategory} />
      <Box>
        {list.map((r) => (
          <Row key={r.id} onClick={() => openDrawer(<ReportDrawer reportId={r.id} />)}>
            <span>
              <b>{r.ty}</b>{" "}
              <span className="text-mut">
                Ward {r.w} · {r.src} · {r.d}
              </span>
            </span>
            <span className="shrink-0">
              <KmcStatus status={r.s} />
            </span>
          </Row>
        ))}
        {list.length === 0 && <p className="text-mut">No reports match.</p>}
      </Box>
    </>
  );
}
