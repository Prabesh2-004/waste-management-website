import { cn } from "@/lib/cn";

interface TabsProps {
  items: string[];
  active: string;
  onChange: (value: string) => void;
}

export function Tabs({ items, active, onChange }: TabsProps) {
  return (
    <div role="tablist" className="no-scrollbar mb-4 flex gap-6 overflow-x-auto border-b border-line">
      {items.map((x) => (
        <button
          key={x}
          type="button"
          role="tab"
          aria-selected={active === x}
          onClick={() => onChange(x)}
          className={cn(
            "-mb-px whitespace-nowrap border-b-2 bg-transparent pb-2.5 pt-1 text-[15px]",
            active === x ? "border-ac font-semibold text-ac" : "border-transparent text-mut hover:text-ink"
          )}
        >
          {x}
        </button>
      ))}
    </div>
  );
}

export function Chips({ items, active, onChange }: TabsProps) {
  return (
    <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
      {items.map((x) => (
        <button
          key={x}
          type="button"
          aria-pressed={active === x}
          onClick={() => onChange(x)}
          className={cn(
            "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
            active === x ? "border-ac bg-ac text-white" : "border-line bg-surface text-mut hover:border-ac hover:text-ac"
          )}
        >
          {x}
        </button>
      ))}
    </div>
  );
}

/** Two or three equal options in a rounded track, e.g. "Programs | News & Progress". */
export function Segmented({ items, active, onChange }: TabsProps) {
  return (
    <div role="tablist" className="mb-4 flex gap-1 rounded-2xl bg-ac-soft p-1">
      {items.map((x) => (
        <button
          key={x}
          type="button"
          role="tab"
          aria-selected={active === x}
          onClick={() => onChange(x)}
          className={cn(
            "flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
            active === x ? "bg-ac text-white shadow-sm" : "text-ac"
          )}
        >
          {x}
        </button>
      ))}
    </div>
  );
}
