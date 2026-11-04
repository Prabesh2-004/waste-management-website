import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/status";
import { IconBubble } from "./IconBubble";

interface KpiProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  /** "up" and "down" colour the note green or red; "muted" keeps it grey. */
  trend?: "up" | "down" | "muted";
  tone?: Tone;
  square?: boolean;
  /** Extra content under the value, e.g. a progress bar. */
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Kpi({ icon, label, value, note, trend = "up", tone, square, children, onClick, className }: KpiProps) {
  const body = (
    <>
      <IconBubble tone={tone} square={square} size="lg">
        {icon}
      </IconBubble>
      <div className="min-w-0 flex-1">
        <span className="block text-xs text-muted">{label}</span>
        <b className="block text-2xl leading-tight">{value}</b>
        {children}
        {note && (
          <span
            className={cn(
              "block text-xs",
              trend === "up" && "text-brand",
              trend === "down" && "text-danger",
              trend === "muted" && "text-muted"
            )}
          >
            {note}
          </span>
        )}
      </div>
      {onClick && <ChevronRight className="size-4 flex-none text-muted" />}
    </>
  );

  const classes = cn(
    "flex min-w-0 items-center gap-3 rounded-xl border border-line bg-surface p-3 text-left",
    onClick && "transition-colors hover:bg-hover",
    className
  );

  return onClick ? (
    <button type="button" onClick={onClick} className={classes}>
      {body}
    </button>
  ) : (
    <div className={classes}>{body}</div>
  );
}

/** Responsive grid for a row of KPI cards. */
export function KpiGrid({ columns = 4, children }: { columns?: 4 | 5; children: React.ReactNode }) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", columns === 4 ? "xl:grid-cols-4" : "lg:grid-cols-3 xl:grid-cols-5")}>
      {children}
    </div>
  );
}
