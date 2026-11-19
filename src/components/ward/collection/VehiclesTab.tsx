"use client";

import { ChevronRight, Truck, User } from "lucide-react";
import { WardStatus } from "../WardStatus";
import { VehicleDrawer } from "./VehicleDrawer";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import { cn } from "@/lib/cn";

export function VehiclesTab() {
  const { vehicles, routes } = useWard();
  const { openDrawer } = useUi();

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {vehicles.map((x) => {
        const assigned = routes.filter((q) => q.v === x.id).map((q) => `Route ${q.n}`).join(", ");
        return (
          <button
            key={x.id}
            type="button"
            onClick={() => openDrawer(<VehicleDrawer vehicleId={x.id} />)}
            className="flex items-center gap-3 rounded-2xl border border-line p-3.5 text-left transition-colors hover:border-ac hover:bg-ac-faint"
          >
            <span
              className={cn(
                "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                x.st === "Maintenance" ? "bg-bad-soft text-bad" : x.st === "Active" ? "bg-ac-soft text-ac" : "bg-info-soft text-info"
              )}
            >
              <Truck size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <b>{x.id}</b>
                <WardStatus status={x.st} />
              </span>
              <span className="flex items-center gap-1 truncate text-xs text-mut">
                <User size={12} /> {x.drv || "No driver"} · {x.cap} t
              </span>
              <span className="block truncate text-xs text-mut">{assigned || "Unassigned"}</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-mut" />
          </button>
        );
      })}
    </div>
  );
}
