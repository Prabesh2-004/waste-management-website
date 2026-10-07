"use client";

import { LinkText } from "@/components/ui/Button";
import { Row } from "@/components/ui/Row";
import { ScheduleModal } from "./ScheduleModal";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";
import { formatTime } from "@/lib/format";

export function ScheduleTab() {
  const { schedule } = useKmc();
  const { openModal } = useUi();

  return (
    <div className="max-h-[420px] overflow-auto">
      {Object.keys(schedule).map((key) => {
        const n = Number(key);
        return (
          <Row key={n} onClick={() => openModal(<ScheduleModal ward={n} />)}>
            <span>
              <b>Ward {n}</b> <span className="text-mut">{schedule[n].k}</span>
            </span>
            <span className="shrink-0">
              {formatTime(schedule[n].t)} <LinkText>Change</LinkText>
            </span>
          </Row>
        );
      })}
    </div>
  );
}
