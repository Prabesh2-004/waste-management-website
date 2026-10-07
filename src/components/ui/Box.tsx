import { cn } from "@/lib/cn";

interface BoxProps {
  children: React.ReactNode;
  className?: string;
}

export function Box({ children, className }: BoxProps) {
  return <div className={cn("rounded-[10px] border border-line bg-surface p-[18px]", className)}>{children}</div>;
}
