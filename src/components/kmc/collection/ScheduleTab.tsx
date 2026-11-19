"use client";

import { Clock } from "lucide-react";
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
    <div className="max-h-[560px] overflow-auto">
      {Object.keys(schedule).map((key) => {
        const n = Number(key);
        return (
          <Row key={n} onClick={() => openModal(<ScheduleModal ward={n} />)}>
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ac-soft text-ac">
                <Clock size={17} />
              </span>
              <span className="min-w-0">
                <b>Ward {n}</b>
                <span className="block truncate text-[13px] text-mut">
                  {formatTime(schedule[n].t)} · {schedule[n].k}
                </span>
              </span>
            </span>
            <LinkText>Change</LinkText>
          </Row>
        );
      })}
    </div>
  );
}
