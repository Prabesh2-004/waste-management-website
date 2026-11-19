"use client";

import { BookOpen, CalendarDays, ChevronRight, MapPin, Megaphone, Recycle, Sprout, Users } from "lucide-react";
import { ProgressBar } from "@/components/ui/Bars";
import { cn } from "@/lib/cn";

const ICONS = [Recycle, Sprout, BookOpen, Megaphone];
const TINTS = ["bg-ok-soft text-ok", "bg-warn-soft text-warn", "bg-info-soft text-info", "bg-violet-soft text-violet"];

interface ProgramCardProps {
  id: number;
  name: string;
  date: string;
  time: string;
  place?: string;
  /** e.g. "32 / 50 registered" */
  count: string;
  percent: number;
  status: React.ReactNode;
  onOpen: () => void;
}

/** Program tile for the awareness pages (UI reference 4 and 8). */
export function ProgramCard({ id, name, date, time, place, count, percent, status, onOpen }: ProgramCardProps) {
  const Icon = ICONS[id % ICONS.length];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col rounded-2xl border border-line bg-surface p-4 text-left shadow-card transition-colors hover:border-ac"
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn("grid h-11 w-11 place-items-center rounded-xl", TINTS[id % TINTS.length])}>
          <Icon size={20} />
        </span>
        {status}
      </div>
      <b className="mt-3 block text-[15px] leading-snug">{name}</b>
      <div className="mt-2 space-y-1 text-[13px] text-mut">
        <div className="flex items-center gap-1.5">
          <CalendarDays size={14} /> {date} · {time}
        </div>
        {place && (
          <div className="flex items-center gap-1.5">
            <MapPin size={14} /> <span className="truncate">{place}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Users size={14} /> {count}
        </div>
      </div>
      <ProgressBar className="mt-3" percent={percent} />
      <span className="mt-3 inline-flex items-center gap-1 self-end rounded-lg bg-ac-soft px-2.5 py-1 text-xs font-semibold text-ac">
        View details <ChevronRight size={14} />
      </span>
    </button>
  );
}
