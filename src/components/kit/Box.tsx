import { cn } from "@/lib/cn";

interface BoxProps {
  children: React.ReactNode;
  className?: string;
  /** Optional heading row: icon, title, and something on the right (a link or button). */
  title?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function Box({ children, className, title, icon, action }: BoxProps) {
  return (
    <div className={cn("rounded-2xl border border-line bg-surface p-[18px] shadow-card sm:p-5", className)}>
      {title && (
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <h2 className="m-0 flex min-w-0 items-center gap-2.5">
            {icon && <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-ac-soft text-ac">{icon}</span>}
            <span className="truncate">{title}</span>
          </h2>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
