import { cn } from "@/lib/cn";
import type { Tone } from "@/types";

export interface Stat {
  label: string;
  value: string;
  /** Small line under the value, e.g. "of 12 routes". */
  hint?: string;
  icon?: React.ReactNode;
  tone?: Tone;
}

export const toneSoft: Record<Tone, string> = {
  G: "bg-ok-soft text-ok",
  A: "bg-warn-soft text-warn",
  R: "bg-bad-soft text-bad",
  B: "bg-info-soft text-info",
  P: "bg-violet-soft text-violet",
  "": "bg-ac-soft text-ac",
};

export function StatStrip({ items }: { items: Stat[] }) {
  return (
    <div className={cn("mb-[22px] grid grid-cols-2 gap-3 sm:gap-4", items.length >= 5 ? "md:grid-cols-5" : "md:grid-cols-4")}>
      {items.map((s) => (
        <div key={s.label} className="flex min-w-0 items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-card sm:p-4">
          {s.icon && (
            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl max-sm:hidden", toneSoft[s.tone ?? ""])}>{s.icon}</span>
          )}
          <div className="min-w-0">
            <div className="truncate text-[13px] text-mut">{s.label}</div>
            <b className="block text-[22px] leading-tight text-ink sm:text-2xl">{s.value}</b>
            {s.hint && <div className="truncate text-xs text-mut">{s.hint}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
