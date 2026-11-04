import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface ListItemProps {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Shows a chevron and makes the row a button. */
  onClick?: () => void;
  /** Bordered, rounded row (ward rail style) instead of a divider line. */
  boxed?: boolean;
  className?: string;
}

export function ListItem({ leading, title, subtitle, trailing, onClick, boxed, className }: ListItemProps) {
  const classes = cn(
    "flex w-full items-center gap-3 py-2 text-left",
    boxed ? "rounded-[10px] border border-line px-2.5" : "border-b border-line px-1 last:border-b-0",
    onClick && "transition-colors hover:bg-hover",
    className
  );
  const body = (
    <>
      {leading}
      <div className="min-w-0 flex-1">
        <b className="block font-semibold">{title}</b>
        {subtitle && <small className="block text-xs text-muted">{subtitle}</small>}
      </div>
      {trailing}
      {onClick && <ChevronRight className="size-4 flex-none text-muted" />}
    </>
  );

  return onClick ? (
    <button type="button" onClick={onClick} className={classes}>
      {body}
    </button>
  ) : (
    <div className={classes}>{body}</div>
  );
}

/** Label / value row with a bottom border. */
export function KeyValue({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-1.5 text-[13px]">
      <span className="text-muted">{label}</span>
      <b className="text-right">{value}</b>
    </div>
  );
}
