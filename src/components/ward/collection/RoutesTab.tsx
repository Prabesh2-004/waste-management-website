"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Row } from "@/components/ui/Row";
import { LiveMap, MapLegend } from "@/components/map/LiveMap";
import { WardStatus } from "../WardStatus";
import { RouteDrawer } from "./RouteDrawer";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import { useLive } from "@/lib/useLive";
import { formatTime } from "@/lib/format";

export function RoutesTab() {
  const { routes, driverOf, call, user, schedule } = useWard();
  const { openDrawer } = useUi();
  const { data } = useLive(call, user.ward);
  const [focus, setFocus] = useState<number | null>(null);
  const focusId = data?.routes.find((r) => r.n === focus)?.id ?? null;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div>
        <h3>Routes and stops</h3>
        <LiveMap
          routes={data?.routes ?? []}
          vehicles={data?.vehicles ?? []}
          liveSeconds={data?.liveSeconds}
          focusRouteId={focusId}
          className="h-[320px] sm:h-[420px]"
        />
        <MapLegend className="mt-2.5" />
      </div>
      <div>
        <h3>Routes</h3>
        {routes.map((r) => {
          const detail = data?.routes.find((x) => x.n === r.n);
          return (
            <Row key={r.n} onClick={() => openDrawer(<RouteDrawer routeNumber={r.n} />)}>
              <span
                className="min-w-0"
                onMouseEnter={() => setFocus(r.n)}
                onMouseLeave={() => setFocus(null)}
              >
                <b>Route {r.n}</b> <span className="text-mut">{r.area}</span>
                <span className="block truncate text-[13px] text-mut">
                  {r.v} · {driverOf(r.v)} · {formatTime(schedule[r.n])}
                  {detail ? ` · ${detail.stops.length} stops · ${detail.waste}` : ""}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1">
                <WardStatus status={r.s} />
                <ChevronRight size={16} className="text-mut" />
              </span>
            </Row>
          );
        })}
        <p className="mb-0 mt-2 text-xs text-mut">Point at a route to highlight it on the map; select it to change its vehicle.</p>
      </div>
    </div>
  );
}
