import type { KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

interface RowProps {
  children: React.ReactNode;
  onClick?: () => void;
  block?: boolean;
  className?: string;
}

export function Row({ children, onClick, block, className }: RowProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cn(
        "gap-3 border-b border-line px-1 py-[11px] last:border-b-0 hover:bg-ac-faint",
        block ? "block" : "flex items-center justify-between",
        onClick ? "cursor-pointer" : "cursor-default",
        className
      )}
    >
      {children}
    </div>
  );
}
