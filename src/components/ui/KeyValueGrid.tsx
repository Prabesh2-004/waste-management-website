import { cn } from "@/lib/cn";

interface KeyValue {
  label: string;
  value: React.ReactNode;
  compact?: boolean;
}

export function KeyValueGrid({ items }: { items: KeyValue[] }) {
  return (
    <div className="my-3.5 grid grid-cols-2 gap-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl bg-ac-wash px-3 py-2.5 text-[13px] text-mut">
          {it.label}
          <b className={cn("block text-ink", it.compact ? "text-base" : "text-xl")}>{it.value}</b>
        </div>
      ))}
    </div>
  );
}
