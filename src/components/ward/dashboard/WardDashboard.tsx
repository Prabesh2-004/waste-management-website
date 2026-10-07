"use client";

import { useRouter } from "next/navigation";
import { Box } from "@/components/ui/Box";
import { Button, LinkText } from "@/components/ui/Button";
import { SplitBar } from "@/components/ui/Bars";
import { PageHeader } from "@/components/ui/PageHeader";
import { Row } from "@/components/ui/Row";
import { StatStrip } from "@/components/ui/StatStrip";
import { WardStatus } from "../WardStatus";
import { RouteDrawer } from "../collection/RouteDrawer";
import { ProgramDrawer } from "../awareness/ProgramDrawer";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import options from "@/data/ward/options.json";
import shared from "@/data/shared/options.json";

interface Alert {
  text: string;
  status: string;
  href: string;
  tab?: string;
}

export function WardDashboard() {
  const { wardName, routes, vehicles, reports, updates, programs, tons, completion, openComplaints, setCollectionTab } = useWard();
  const { openDrawer } = useUi();
  const router = useRouter();

  const total = tons();
  const organic = (total * options.organicShare.organic) / options.organicShare.total;

  const alerts: Alert[] = [];
  routes
    .filter((r) => r.s === "Delayed" || r.s === "Incomplete")
    .forEach((r) =>
      alerts.push({
        text: `Route ${r.n} collection ${r.s === "Delayed" ? "delayed" : "incomplete"}`,
        status: r.s,
        href: "/ward/collection",
        tab: "Overview",
      })
    );
  alerts.push({ text: "Vehicle KMC-04 requires maintenance in 12 days", status: "Pending", href: "/ward/collection", tab: "Vehicles" });
  const pending = reports.filter((r) => r.s === "Pending").length;
  if (pending) alerts.push({ text: `${pending} citizen complaints are waiting for a response`, status: "Pending", href: "/ward/reports" });
  if (updates[0]?.t.startsWith("Collection timing")) {
    alerts.push({
      text: `Collection schedule changed: ${updates[0].t.replace("Collection timing changed for ", "")}`,
      status: "Upcoming",
      href: "/ward/updates",
    });
  }

  const next = programs.find((p) => p.s === "Scheduled" && p.ap === "Approved");

  return (
    <>
      <PageHeader title={`${wardName} today`} subtitle="What is happening with waste collection in your ward" />
      <StatStrip
        items={[
          { label: "Waste collected today", value: `${total.toFixed(2)} t` },
          { label: "Collection completion", value: `${completion()}%` },
          { label: "Active vehicles", value: String(vehicles.filter((x) => x.st === "Active").length) },
          { label: "Open complaints", value: String(openComplaints()) },
        ]}
      />
      <Box className="mb-[22px]">
        <h2>Needs attention</h2>
        {alerts.map((a, i) => (
          <Row
            key={`${a.text}-${i}`}
            onClick={() => {
              if (a.tab) setCollectionTab(a.tab);
              router.push(a.href);
            }}
          >
            <span>
              <WardStatus status={a.status} dotOnly /> {a.text}
            </span>
            <LinkText>View</LinkText>
          </Row>
        ))}
      </Box>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Box>
          <h2>Today&apos;s collection</h2>
          {routes.map((r) => (
            <Row key={r.n} onClick={() => openDrawer(<RouteDrawer routeNumber={r.n} />)}>
              <span>
                <b>Route {r.n}</b> <span className="text-mut">{r.area}</span>
              </span>
              <span className="shrink-0">
                <WardStatus status={r.s} />
              </span>
            </Row>
          ))}
        </Box>
        <div>
          <Box className="mb-[22px]">
            <h2>Waste collected</h2>
            <b className="text-[26px]">{total.toFixed(2)} tons</b>
            <SplitBar
              segments={[
                { percent: shared.organicRatio * 100, className: "bg-ac" },
                { percent: 100 - shared.organicRatio * 100, className: "bg-line" },
              ]}
            />
            <div className="text-[13px]">
              <span className="text-mut">Organic</span> {organic.toFixed(1)} t · <span className="text-mut">Inorganic</span>{" "}
              {(total - organic).toFixed(1)} t
            </div>
            <p className="mb-0 mt-2.5 text-[13px] text-mut">This total is shared with KMC.</p>
          </Box>
          <Box>
            <h3>Next awareness program</h3>
            {next ? (
              <>
                <b>{next.n}</b>
                <div className="text-[13px] text-mut">
                  {next.d} · {next.reg} registered
                </div>
                <p className="mb-0 mt-2.5">
                  <Button variant="outline" onClick={() => openDrawer(<ProgramDrawer programId={next.id} />)}>
                    View Program
                  </Button>
                </p>
              </>
            ) : (
              <p className="text-mut">None scheduled.</p>
            )}
          </Box>
        </div>
      </div>
    </>
  );
}
