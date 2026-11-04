import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/status";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-tint text-brand",
  info: "bg-[#e4effd] text-[#2f6fdb]",
  warn: "bg-[#fdf0d5] text-[#e0990b]",
  danger: "bg-[#fde4e4] text-[#dc4a4a]",
  purple: "bg-[#eee6fb] text-[#7a4fd0]",
  neutral: "bg-[#eef0ef] text-[#6b7f78]",
};

interface IconBubbleProps {
  tone?: Tone;
  /** Rounded square (ward style) instead of a circle (KMC style). */
  square?: boolean;
  size?: "md" | "lg";
  className?: string;
  children: React.ReactNode;
}

export function IconBubble({ tone = "success", square, size = "md", className, children }: IconBubbleProps) {
  return (
    <span
      className={cn(
        "grid flex-none place-items-center",
        size === "md" ? "size-9 [&>svg]:size-[18px]" : "size-11 [&>svg]:size-[22px]",
        square ? "rounded-[10px]" : "rounded-full",
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
