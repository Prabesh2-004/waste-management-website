import { cn } from "@/lib/cn";

export interface TabItem<T extends string> {
  value: T;
  label: React.ReactNode;
}

interface TabsProps<T extends string> {
  items: Array<TabItem<T>>;
  value: T;
  onChange: (value: T) => void;
  /** pill: KMC filled pills · underline: ward tabs · chip: ward filter chips */
  variant?: "pill" | "underline" | "chip";
  /** Underline variant only: draw the bottom divider line (default true). */
  divider?: boolean;
  className?: string;
}

/* "off" and "on" set the same properties, so exactly one of them is applied. */
const ITEM_CLASSES = {
  pill: {
    base: "rounded-full border px-3.5 py-1 text-[13px]",
    off: "border-line bg-surface text-ink hover:bg-hover",
    on: "border-brand bg-brand text-white",
  },
  underline: {
    base: "-mb-px border-b-2 px-3.5 py-2 text-[13px]",
    off: "border-transparent font-medium text-muted hover:text-ink",
    on: "border-brand font-semibold text-brand-strong",
  },
  chip: {
    base: "rounded-full px-3 py-1 text-xs",
    off: "bg-[#f2f6f4] text-[#47645a] hover:bg-tint",
    on: "bg-tint font-semibold text-brand-strong",
  },
};

export function Tabs<T extends string>({ items, value, onChange, variant = "pill", divider = true, className }: TabsProps<T>) {
  const styles = ITEM_CLASSES[variant];
  return (
    <div
      role="tablist"
      className={cn(
        "flex flex-none gap-1.5 overflow-x-auto overflow-y-hidden",
        variant === "underline" && "gap-1",
        variant === "underline" && divider && "border-b border-line",
        variant === "pill" && "mb-2.5",
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          onClick={() => onChange(item.value)}
          className={cn("flex flex-none items-center gap-1.5 whitespace-nowrap", styles.base, item.value === value ? styles.on : styles.off)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
