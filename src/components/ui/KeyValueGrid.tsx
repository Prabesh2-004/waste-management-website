import { cn } from "@/lib/cn";

interface KeyValue {
  label: string;
  value: React.ReactNode;
  compact?: boolean;
}

export function KeyValueGrid({ items }: { items: KeyValue[] }) {
  return (
    <div className="my-3.5 grid grid-cols-2 gap-x-5 gap-y-3">
      {items.map((it) => (
        <div key={it.label} className="text-[13px] text-mut">
          {it.label}
          <b className={cn("block", it.compact ? "text-base" : "text-xl")}>{it.value}</b>
        </div>
      ))}
    </div>
  );
}
