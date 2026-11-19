"use client";

import { AlertTriangle } from "lucide-react";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Ring } from "@/components/ui/Bars";
import { Row } from "@/components/ui/Row";
import { Dot } from "@/components/ui/Status";
import { LiveCollection } from "@/components/shared/admin/LiveCollection";
import { WardStatus } from "../WardStatus";
import { DriverUpdateModal } from "./DriverUpdateModal";
import { RouteDrawer } from "./RouteDrawer";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import type { Tone } from "@/types";

const BREAKDOWN: [string, Tone][] = [
  ["Completed", "G"],
  ["In Progress", "B"],
  ["Delayed", "A"],
  ["Incomplete", "R"],
  ["Upcoming", ""],
];

export function OverviewTab() {
  const { routes, doneCount, driverOf, startRoute, call, user } = useWard();
  const { openModal, openDrawer, toast } = useUi();
  const pending = routes.filter((r) => r.s !== "Completed");
  const pct = routes.length ? Math.round((doneCount() / routes.length) * 100) : 0;

  const onAction = (n: number, status: string) => {
    if (status !== "In Progress") {
      startRoute(n);
      toast(`Driver started Route ${n}. Status is now In Progress.`);
    } else {
      openModal(<DriverUpdateModal routeNumber={n} />);
    }
  };

  const label = (s: string) => (s === "In Progress" ? "Record driver update" : s === "Upcoming" ? "Start for driver" : "Resume for driver");

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <LiveCollection
        call={call}
        ward={user.ward}
        title="Live collection view"
        onOpenRoute={(r) => openDrawer(<RouteDrawer routeNumber={r.n} />)}
      />
      <div className="space-y-5">
        <Box title="Today's collection status">
          <div className="flex items-center gap-4">
            <Ring percent={pct} size={104}>
              <div>
                <b className="block text-xl">{pct}%</b>
                <span className="text-[11px] text-mut">completed</span>
              </div>
            </Ring>
            <div className="flex-1 text-sm">
              {BREAKDOWN.map(([s, tone]) => (
                <div key={s} className="flex items-center justify-between py-0.5">
                  <span className="flex items-center">
                    <Dot tone={tone} />
                    {s}
                  </span>
                  <b>{routes.filter((r) => r.s === s).length}</b>
                </div>
              ))}
            </div>
          </div>
        </Box>
        <Box title="Needs attention" icon={<AlertTriangle size={18} />}>
          {pending.map((r) => (
            <Row key={r.n} block>
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0">
                  <b className="block">Route {r.n}</b>
                  <span className="block truncate text-xs text-mut">
                    {r.area} · {r.v} · {driverOf(r.v)}
                  </span>
                </span>
                <WardStatus status={r.s} />
              </div>
              <Button variant="soft" size="sm" className="mt-2" onClick={() => onAction(r.n, r.s)}>
                {label(r.s)}
              </Button>
            </Row>
          ))}
          {pending.length === 0 && <p className="m-0 text-mut">All routes are completed.</p>}
          <p className="mb-0 mt-2 text-xs text-mut">
            Drivers update routes from the Driver section on their phones. Use these buttons when a driver calls it in.
          </p>
        </Box>
      </div>
    </div>
  );
}
