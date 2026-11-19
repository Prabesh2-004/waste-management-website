"use client";

import { AlertTriangle } from "lucide-react";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/Bars";
import { Row } from "@/components/ui/Row";
import { LiveCollection } from "@/components/shared/admin/LiveCollection";
import { KmcStatus } from "../KmcStatus";
import { DriverCompleteModal } from "./DriverCompleteModal";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";
import meta from "@/data/shared/meta.json";
import options from "@/data/kmc/options.json";

const order = options.attentionOrder as Record<string, number>;
const nextAction = options.nextDriverAction as Record<string, string>;

export function OverviewTab() {
  const { wardStatus, routes, driverOf, countStatus, restartRoute, call } = useKmc();
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
    <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <LiveCollection call={call} ward={null} title="Citywide collection map" showCentres listFilter={(r) => r.status !== "Completed"} />
      <Box title="Collection exceptions" icon={<AlertTriangle size={18} />}>
        <b className="text-xl">
          {completed} / {meta.wardCount} wards completed
        </b>
        <ProgressBar className="mb-4 mt-2 w-full" percent={(completed / meta.wardCount) * 100} />
        {attention.map((r) => (
          <Row key={r.w} block>
            <div className="flex items-start justify-between gap-2">
              <span className="min-w-0">
                <b className="block">
                  Ward {r.w} · Route {r.n}
                </b>
                <span className="block truncate text-xs text-mut">
                  {r.v} · {driverOf(r.v)}
                </span>
              </span>
              <KmcStatus status={wardStatus[r.w]} />
            </div>
            <Button variant="soft" size="sm" className="mt-2" onClick={() => onDriverAction(r.w)}>
              {nextAction[wardStatus[r.w]]}
            </Button>
          </Row>
        ))}
        {attention.length === 0 && <p className="m-0 text-mut">Every ward is done.</p>}
        <p className="mb-0 mt-2 text-xs text-mut">Drivers report from the Driver section; these buttons record an update on their behalf.</p>
      </Box>
    </div>
  );
}
