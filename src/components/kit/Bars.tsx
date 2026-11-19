import { cn } from "@/lib/cn";

interface ProgressBarProps {
  percent: number;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({ percent, className, barClassName }: ProgressBarProps) {
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-ac-soft", className)}>
      <i className={cn("block h-full rounded-full bg-ac transition-[width] duration-500", barClassName)} style={{ width: `${p}%` }} />
    </div>
  );
}

export interface SplitSegment {
  percent: number;
  className: string;
}

export function SplitBar({ segments }: { segments: SplitSegment[] }) {
  return (
    <div className="my-2 flex h-2.5 gap-0.5 overflow-hidden rounded-full">
      {segments.map((s, i) => (
        <i key={i} className={cn("block h-full", s.className)} style={{ width: `${s.percent}%` }} />
      ))}
    </div>
  );
}

/** Circular progress, e.g. "75% completed". */
export function Ring({ percent, size = 96, stroke = 10, children }: { percent: number; size?: number; stroke?: number; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--ac)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(p / 100) * c} ${c}`}
          className="transition-[stroke-dasharray] duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
