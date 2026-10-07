"use client";

import { Row } from "@/components/ui/Row";
import { WardStatus } from "../WardStatus";
import { RouteDrawer } from "./RouteDrawer";
import { RouteMap } from "./RouteMap";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";

export function RoutesTab() {
  const { routes, driverOf } = useWard();
  const { openDrawer } = useUi();

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div>
        <h3>Route tracking (approximate)</h3>
        <RouteMap />
      </div>
      <div>
        <h3>Routes</h3>
        {routes.map((r) => (
          <Row key={r.n} onClick={() => openDrawer(<RouteDrawer routeNumber={r.n} />)}>
            <span>
              <b>Route {r.n}</b> <span className="text-mut">{r.area}</span>
              <br />
              <span className="text-[13px] text-mut">
                {r.v} · {driverOf(r.v)}
              </span>
            </span>
            <span className="shrink-0">
              <WardStatus status={r.s} />
            </span>
          </Row>
        ))}
      </div>
    </div>
  );
}
