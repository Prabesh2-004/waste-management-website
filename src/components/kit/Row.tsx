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
        "-mx-2 gap-3 rounded-xl border-b border-line px-2 py-3 last:border-b-0",
        block ? "block" : "flex items-center justify-between",
        onClick ? "cursor-pointer hover:bg-ac-faint" : "cursor-default",
        className
      )}
    >
      {children}
    </div>
  );
}
