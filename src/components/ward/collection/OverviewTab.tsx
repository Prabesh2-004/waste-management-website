"use client";

import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/Bars";
import { Row } from "@/components/ui/Row";
import { WardStatus } from "../WardStatus";
import { DriverUpdateModal } from "./DriverUpdateModal";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";

export function OverviewTab() {
  const { routes, doneCount, driverOf, startRoute } = useWard();
  const { openModal, toast } = useUi();
  const pending = routes.filter((r) => r.s !== "Completed");

  const onAction = (n: number, status: string) => {
    if (status !== "In Progress") {
      startRoute(n);
      toast(`Driver started Route ${n}. Status is now In Progress.`);
    } else {
      openModal(<DriverUpdateModal routeNumber={n} />);
    }
  };

  const label = (s: string) => (s === "In Progress" ? "Simulate driver update" : s === "Upcoming" ? "Driver starts" : "Driver resumes");

  return (
    <>
      <b className="text-[22px]">
        {doneCount()} of {routes.length} routes completed
      </b>
      <ProgressBar className="mb-4 mt-2" percent={(doneCount() / routes.length) * 100} />
      <h3>Needs attention</h3>
      {pending.map((r) => (
        <Row key={r.n}>
          <span>
            <b>Route {r.n}</b>{" "}
            <span className="text-mut">
              {r.area} · {r.v} · {driverOf(r.v)}
            </span>
          </span>
          <span className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <WardStatus status={r.s} />
            <Button variant="outline" size="sm" onClick={() => onAction(r.n, r.s)}>
              {label(r.s)}
            </Button>
          </span>
        </Row>
      ))}
      {pending.length === 0 && <p className="text-mut">All routes are completed.</p>}
      <p className="text-[13px] text-mut">Statuses come from driver updates. These buttons stand in for the driver app.</p>
    </>
  );
}
