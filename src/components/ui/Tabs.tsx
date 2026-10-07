import { cn } from "@/lib/cn";

interface TabsProps {
  items: string[];
  active: string;
  onChange: (value: string) => void;
}

export function Tabs({ items, active, onChange }: TabsProps) {
  return (
    <div className="mb-4 flex gap-[22px] overflow-x-auto border-b border-line">
      {items.map((x) => (
        <button
          key={x}
          type="button"
          onClick={() => onChange(x)}
          className={cn(
            "whitespace-nowrap border-b-2 bg-transparent py-2",
            active === x ? "border-ac font-semibold text-ac" : "border-transparent text-mut"
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
    <div className="mb-3 flex flex-wrap gap-2">
      {items.map((x) => (
        <button
          key={x}
          type="button"
          onClick={() => onChange(x)}
          className={cn(
            "rounded-[14px] border px-3 py-1 text-[13px]",
            active === x ? "border-ac bg-ac text-white" : "border-line bg-transparent text-mut"
          )}
        >
          {x}
        </button>
      ))}
    </div>
  );
}
