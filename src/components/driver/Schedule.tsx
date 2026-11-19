"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, ChevronRight, Clock, Leaf, MapPin } from "lucide-react";
import { Pill } from "@/components/kit/Status";
import { useDriver } from "@/context/DriverContext";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/format";
import { ROUTE_TONE } from "./Home";

export function DriverSchedule() {
  const { state, current, selectRoute } = useDriver();
  const router = useRouter();
  if (!state) return null;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ac-soft text-ac">
          <CalendarDays size={26} />
        </span>
        <div>
          <h1 className="m-0 text-2xl">Assigned routes</h1>
          <span className="text-sm text-mut">
            {today} · {state.routes.length} route{state.routes.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
      {state.routes.length === 0 && <p className="text-mut">No routes are assigned to your vehicles yet.</p>}
      <div className="space-y-2.5">
        {state.routes.map((r) => {
          const done = r.stops.filter((s) => s.status !== "Pending").length;
          const selected = current?.id === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                selectRoute(r.id);
                router.push("/driver/route");
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-3xl border bg-surface p-4 text-left shadow-card",
                selected ? "border-ac ring-2 ring-ac-soft" : "border-line"
              )}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ac-soft text-ac">
                <MapPin size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <b className="text-[17px]">Route {r.n}</b>
                  <Pill tone={ROUTE_TONE[r.status] ?? ""}>{r.status}</Pill>
                </span>
                <span className="block text-sm text-mut">
                  Ward {r.ward} · {r.area} · {r.vehicle}
                </span>
                <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-mut">
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {formatTime(r.time)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Leaf size={14} /> {r.waste}
                  </span>
                  <span>
                    {done}/{r.stops.length} stops
                  </span>
                </span>
              </span>
              <ChevronRight size={18} className="text-mut" />
            </button>
          );
        })}
      </div>
    </>
  );
}
