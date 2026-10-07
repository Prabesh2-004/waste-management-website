"use client";

import { useRouter } from "next/navigation";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Row } from "@/components/ui/Row";
import { ReportFilters } from "@/components/shared/ReportFilters";
import { WardStatus } from "../WardStatus";
import { ReportDrawer } from "./ReportDrawer";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";

export function WardReports() {
  const { reports, reportStatusFilter, setReportStatusFilter, reportCategory, setReportCategory, wardName, simulateComplaint } = useWard();
  const { openDrawer, toast } = useUi();
  const router = useRouter();
  const list = reports.filter(
    (r) => (reportStatusFilter === "All" || r.s === reportStatusFilter) && (reportCategory === "All" || r.c === reportCategory)
  );

  return (
    <>
      <PageHeader
        title="Reports & Complaints"
        subtitle={`Issues in ${wardName} from citizens, drivers and ward staff`}
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
      <ReportFilters status={reportStatusFilter} category={reportCategory} onStatus={setReportStatusFilter} onCategory={setReportCategory} />
      <Box>
        {list.map((r) => (
          <Row key={r.id} onClick={() => openDrawer(<ReportDrawer reportId={r.id} />)}>
            <span>
              <b>{r.ty}</b>{" "}
              <span className="text-mut">
                {r.src} · Route {r.rt} · {r.d}
              </span>
            </span>
            <span className="shrink-0">
              <WardStatus status={r.s} />
            </span>
          </Row>
        ))}
        {list.length === 0 && <p className="text-mut">No reports match.</p>}
      </Box>
    </>
  );
}
