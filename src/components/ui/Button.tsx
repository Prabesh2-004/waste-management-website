import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "link";
type Size = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "border-0 bg-ac text-white",
  outline: "border border-line bg-transparent text-ink",
  link: "border-0 bg-transparent text-ac",
};

function padding(variant: Variant, size: Size): string {
  if (variant === "link") return "px-0 py-1";
  if (size === "sm") return "px-2.5 py-[3px] text-[13px]";
  return "px-3.5 py-2";
}

export function Button({ variant = "primary", size = "md", block, className, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn("cursor-pointer rounded-lg", variants[variant], padding(variant, size), block && "w-full", className)}
      {...rest}
    />
  );
}

export function LinkText({ children }: { children: React.ReactNode }) {
  return <span className="cursor-pointer rounded-lg px-0 py-1 text-ac">{children}</span>;
}
