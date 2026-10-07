"use client";

import { Row } from "@/components/ui/Row";
import { WardStatus } from "../WardStatus";
import { VehicleDrawer } from "./VehicleDrawer";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";

export function VehiclesTab() {
  const { vehicles, routes } = useWard();
  const { openDrawer } = useUi();

  return (
    <>
      {vehicles.map((x) => {
        const assigned = routes.filter((q) => q.v === x.id).map((q) => `Route ${q.n}`).join(", ");
        return (
          <Row key={x.id} onClick={() => openDrawer(<VehicleDrawer vehicleId={x.id} />)}>
            <span>
              <b>{x.id}</b>{" "}
              <span className="text-mut">
                {x.drv}
                {assigned ? ` · ${assigned}` : ""}
              </span>
            </span>
            <span className="shrink-0">
              {x.cap} t · <WardStatus status={x.st} />
            </span>
          </Row>
        );
      })}
    </>
  );
}
