import { cn } from "@/lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div className={cn("flex min-w-0 flex-col rounded-xl border border-line bg-surface p-3.5", className)} {...rest}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  /** Rendered next to the title, e.g. a count badge. */
  badge?: React.ReactNode;
  /** Rendered on the right, e.g. a "View all" link. */
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, icon, badge, action, className }: CardHeaderProps) {
  return (
    <div className={cn("mb-2.5 flex flex-wrap items-start gap-x-3 gap-y-1", className)}>
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-2 text-[15px] leading-tight font-semibold">
          {icon && <span className="text-brand [&>svg]:size-[18px]">{icon}</span>}
          {title}
          {badge}
        </h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
