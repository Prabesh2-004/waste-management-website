import { cn } from "@/lib/cn";

interface ProgressBarProps {
  percent: number;
  className?: string;
}

export function ProgressBar({ percent, className }: ProgressBarProps) {
  return (
    <div className={cn("h-2 overflow-hidden rounded bg-line", className)}>
      <i className="block h-full bg-ac" style={{ width: `${percent}%` }} />
    </div>
  );
}

export interface SplitSegment {
  percent: number;
  className: string;
}

export function SplitBar({ segments }: { segments: SplitSegment[] }) {
  return (
    <div className="my-2 flex h-2.5 overflow-hidden rounded-[5px]">
      {segments.map((s, i) => (
        <i key={i} className={cn("block h-full", s.className)} style={{ width: `${s.percent}%` }} />
      ))}
    </div>
  );
}
