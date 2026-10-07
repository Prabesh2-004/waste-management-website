"use client";

import { Row } from "@/components/ui/Row";
import { KmcStatus } from "../KmcStatus";
import { VehicleDrawer } from "./VehicleDrawer";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";

export function VehiclesTab() {
  const { vehicles, routes } = useKmc();
  const { openDrawer } = useUi();

  return (
    <>
      {vehicles.map((x) => {
        const route = routes.find((q) => q.v === x.id);
        return (
          <Row key={x.id} onClick={() => openDrawer(<VehicleDrawer vehicleId={x.id} />)}>
            <span>
              <b>{x.id}</b>{" "}
              <span className="text-mut">
                {x.drv}
                {route ? ` · Ward ${route.w}` : ""}
              </span>
            </span>
            <span className="shrink-0">
              {x.cap} t · <KmcStatus status={x.st} />
            </span>
          </Row>
        );
      })}
    </>
  );
}
