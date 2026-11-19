"use client";

import { Clock } from "lucide-react";
import { LinkText } from "@/components/ui/Button";
import { Row } from "@/components/ui/Row";
import { ScheduleModal } from "./ScheduleModal";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import { formatTime } from "@/lib/format";

export function ScheduleTab() {
  const { routes, schedule } = useWard();
  const { openModal } = useUi();

  return (
    <>
      {routes.map((r) => (
        <Row key={r.n} onClick={() => openModal(<ScheduleModal route={r.n} />)}>
          <span className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ac-soft text-ac">
              <Clock size={17} />
            </span>
            <span className="min-w-0">
              <b>Route {r.n}</b> <span className="text-mut">{r.area}</span>
              <span className="block text-[13px] text-mut">Daily pickup at {formatTime(schedule[r.n])}</span>
            </span>
          </span>
          <LinkText>Change time</LinkText>
        </Row>
      ))}
      <p className="mb-0 mt-2 text-xs text-mut">A time change is posted to Updates and texted to the ward&apos;s SMS subscribers.</p>
    </>
  );
}
