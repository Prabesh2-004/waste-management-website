"use client";

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
          <span>
            <b>Route {r.n}</b> <span className="text-mut">{r.area}</span>
          </span>
          <span className="shrink-0">
            {formatTime(schedule[r.n])} · <LinkText>Change time</LinkText>
          </span>
        </Row>
      ))}
    </>
  );
}
