"use client";

import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/Bars";
import { Row } from "@/components/ui/Row";
import { KmcStatus } from "../KmcStatus";
import { DriverCompleteModal } from "./DriverCompleteModal";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";
import meta from "@/data/shared/meta.json";
import options from "@/data/kmc/options.json";

const order = options.attentionOrder as Record<string, number>;
const nextAction = options.nextDriverAction as Record<string, string>;

export function OverviewTab() {
  const { wardStatus, routes, driverOf, countStatus, restartRoute } = useKmc();
  const { openModal, toast } = useUi();
  const completed = countStatus("Completed");

  const onDriverAction = (ward: number) => {
    if (wardStatus[ward] === "In Progress") {
      openModal(<DriverCompleteModal ward={ward} />);
    } else {
      restartRoute(ward);
      toast("Driver restarted the route. Status is now In Progress.");
    }
  };

  const attention = routes.filter((r) => wardStatus[r.w] !== "Completed").sort((x, y) => order[wardStatus[x.w]] - order[wardStatus[y.w]]);

  return (
    <>
      <b className="text-[22px]">
        {completed} / {meta.wardCount} wards completed
      </b>
      <ProgressBar className="mb-4 mt-2 w-full" percent={(completed / meta.wardCount) * 100} />
      <h3>Needs attention</h3>
      {attention.map((r) => (
        <Row key={r.w}>
          <span>
            <b>Ward {r.w}</b>{" "}
            <span className="text-mut">
              {r.v} · {driverOf(r.v)}
            </span>
          </span>
          <span className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <KmcStatus status={wardStatus[r.w]} />
            <Button variant="outline" size="sm" onClick={() => onDriverAction(r.w)}>
              {nextAction[wardStatus[r.w]]}
            </Button>
          </span>
        </Row>
      ))}
      <p className="text-[13px] text-mut">Statuses come from driver updates. These buttons stand in for the driver app.</p>
    </>
  );
}
