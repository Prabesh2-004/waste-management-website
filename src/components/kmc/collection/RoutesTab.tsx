"use client";

import { Row } from "@/components/ui/Row";
import { KmcStatus } from "../KmcStatus";
import { WardMap } from "../WardMap";
import { EditRouteModal } from "./EditRouteModal";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";

export function RoutesTab() {
  const { routes, wardStatus, driverOf } = useKmc();
  const { openModal } = useUi();

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
      <div>
        <h3>Active vehicles (approximate location)</h3>
        <WardMap mode="routes" />
      </div>
      <div>
        <h3>Routes</h3>
        {routes.map((r) => (
          <Row key={r.w} onClick={() => openModal(<EditRouteModal ward={r.w} />)}>
            <span>
              <b>
                Ward {r.w} — Route {r.n}
              </b>
              <br />
              <span className="text-[13px] text-mut">
                {r.v} · {driverOf(r.v)}
              </span>
            </span>
            <span className="shrink-0">
              <KmcStatus status={wardStatus[r.w]} />
            </span>
          </Row>
        ))}
      </div>
    </div>
  );
}
