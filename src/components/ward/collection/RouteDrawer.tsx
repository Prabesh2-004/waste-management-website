"use client";

import { useState } from "react";
import { CheckCircle2, Circle, MinusCircle, Route as RouteIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Field";
import { KeyValueGrid } from "@/components/ui/KeyValueGrid";
import { DrawerContent } from "@/components/ui/Overlays";
import { LiveMap } from "@/components/map/LiveMap";
import { TruckGps, routeEta } from "@/components/shared/admin/LiveCollection";
import { WardStatus } from "../WardStatus";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import { useLive } from "@/lib/useLive";
import { clock, formatMinutes } from "@/lib/eta";
import { formatTime } from "@/lib/format";

export function RouteDrawer({ routeNumber }: { routeNumber: number }) {
  const { routes, vehicles, schedule, wardName, driverOf, assignVehicleToRoute, call, user } = useWard();
  const { closeOverlay, toast } = useUi();
  const { data } = useLive(call, user.ward);
  const route = routes.find((x) => x.n === routeNumber);
  const vehicleOptions = vehicles.filter((x) => x.st !== "Maintenance").map((x) => x.id);
  const [vehicle, setVehicle] = useState(route && vehicleOptions.includes(route.v) ? route.v : vehicleOptions[0]);
  if (!route) return null;
  const detail = data?.routes.find((r) => r.n === routeNumber);
  const truck = data?.vehicles.find((v) => v.id === route.v);
  const eta = detail ? routeEta(detail, truck) : null;

  return (
    <DrawerContent>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-ac-soft text-ac">
          <RouteIcon size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="m-0">Route {route.n}</h2>
          <span className="text-sm text-mut">
            {route.area}, {wardName}
          </span>
        </div>
        <WardStatus status={route.s} />
      </div>
      <KeyValueGrid
        items={[
          { label: "Pickup time", value: formatTime(schedule[route.n]), compact: true },
          { label: "Waste type", value: detail?.waste ?? "–", compact: true },
          { label: "Vehicle", value: route.v || "None", compact: true },
          { label: "Driver", value: driverOf(route.v) || "–", compact: true },
        ]}
      />
      {detail && detail.stops.length > 0 && (
        <>
          <LiveMap routes={[detail]} vehicles={truck ? [truck] : []} liveSeconds={data?.liveSeconds} focusRouteId={detail.id} className="h-[220px]" />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[13px]">
            <TruckGps vehicle={truck} liveSeconds={data?.liveSeconds ?? 120} />
            {eta && (
              <b>
                Finish ≈ {clock(eta.finishAt)} · {formatMinutes(eta.totalMin)} left
              </b>
            )}
          </div>
          <h3 className="mt-4">Stops</h3>
          <ol className="m-0 list-none p-0">
            {detail.stops.map((s) => {
              const Icon = s.status === "Collected" ? CheckCircle2 : s.status === "Skipped" ? MinusCircle : Circle;
              return (
                <li key={s.id} className="flex items-center gap-2.5 border-b border-line py-2 text-sm last:border-b-0">
                  <Icon size={18} className={s.status === "Collected" ? "text-ok" : s.status === "Skipped" ? "text-mut" : "text-info"} />
                  <span className="flex-1">
                    {s.seq}. {s.name}
                  </span>
                  <span className="text-xs text-mut">{s.status}</span>
                </li>
              );
            })}
          </ol>
        </>
      )}
      <Label>Assign vehicle</Label>
      <Select options={vehicleOptions} value={vehicle} onChange={setVehicle} />
      <p className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            assignVehicleToRoute(route.n, vehicle);
            closeOverlay();
            toast(`Vehicle assigned to Route ${route.n}.`);
          }}
        >
          Assign vehicle
        </Button>
      </p>
    </DrawerContent>
  );
}
