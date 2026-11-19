import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "soft" | "danger" | "link";
type Size = "md" | "sm" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "border border-transparent bg-ac text-white shadow-sm hover:bg-ac-strong",
  outline: "border border-line bg-surface text-ink hover:border-ac hover:text-ac",
  soft: "border border-transparent bg-ac-soft text-ac hover:bg-ac hover:text-white",
  danger: "border border-transparent bg-bad-soft text-bad hover:bg-bad hover:text-white",
  link: "border-0 bg-transparent text-ac hover:underline",
};

function padding(variant: Variant, size: Size): string {
  if (variant === "link") return "px-0 py-1";
  if (size === "sm") return "px-3 py-1.5 text-[13px]";
  if (size === "lg") return "px-5 py-3.5 text-base";
  return "px-4 py-2.5";
}

export function Button({ variant = "primary", size = "md", block, className, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-55 disabled:hover:bg-ac",
        variant === "link" ? "" : "min-h-9",
        variants[variant],
        padding(variant, size),
        block && "w-full",
        className
      )}
      {...rest}
    />
  );
}

export function LinkText({ children }: { children: React.ReactNode }) {
  return <span className="shrink-0 cursor-pointer text-[13px] font-semibold text-ac">{children}</span>;
}
