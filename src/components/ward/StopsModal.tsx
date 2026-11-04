"use client";

import { WardStatus } from "@/components/ui/Badge";
import { Field, inputClass } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import { useWard } from "@/context/WardContext";
import { STOP_STATUSES, type StopStatus } from "@/lib/collection";

/** Lists a route's stops and lets the ward official correct each stop's status. */
export function StopsModal() {
  const { routes, stops, updateStop, stopsRouteId, openStops, closeStops } = useWard();
  const toast = useToast();
  const route = routes.find((r) => r.routeId === stopsRouteId);

  const change = (stopId: string, status: StopStatus) => {
    updateStop(stopId, status);
    toast(`${stopId} updated to ${status}`);
  };

  return (
    <Modal open={!!route} title="Update collection status" onClose={closeStops}>
      {route && (
        <>
          <Field label="Route">
            <select className={inputClass} value={route.routeId} onChange={(e) => openStops(e.target.value)}>
              {routes.map((r) => (
                <option key={r.routeId} value={r.routeId}>
                  {r.name} · {r.vehicle} · {r.driver}
                </option>
              ))}
            </select>
          </Field>
          <div className="mb-3 flex items-center justify-between text-[13px] text-muted">
            <span>
              {route.done} / {route.total} stops completed · {route.start}–{route.end}
            </span>
            <WardStatus status={route.status} />
          </div>
          <div className="flex flex-col gap-2">
            {stops
              .filter((s) => s.routeId === route.routeId)
              .map((s) => (
                <div key={s.stopId} className="flex flex-wrap items-center gap-3 rounded-[10px] border border-line px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <b className="block text-[13px]">
                      {s.stopId} · {s.location}
                    </b>
                    <small className="block text-xs text-muted">
                      {s.scheduledTime} · {s.wasteType} · Updated by {s.lastModifiedBy}
                    </small>
                    {s.exceptionReason && <small className="block text-xs text-[#a8740a]">{s.exceptionReason}</small>}
                  </div>
                  <select
                    aria-label={`Status of ${s.stopId}`}
                    className={`${inputClass} w-36`}
                    value={s.status}
                    onChange={(e) => change(s.stopId, e.target.value as StopStatus)}
                  >
                    {STOP_STATUSES.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>
              ))}
          </div>
          <p className="mt-3 text-xs text-muted">Demo data · Delay threshold: 30 minutes. Cancelled stops are excluded from totals.</p>
        </>
      )}
    </Modal>
  );
}
