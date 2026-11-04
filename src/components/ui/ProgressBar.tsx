import { cn } from "@/lib/cn";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-1.5 min-w-12 overflow-hidden rounded-full bg-tint", className)}>
      <i className="block h-full rounded-full bg-brand" style={{ width: `${width}%` }} />
    </div>
  );
}
