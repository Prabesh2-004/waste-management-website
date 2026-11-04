import { cn } from "@/lib/cn";
import { kmcTone, wardTone, type Tone } from "@/lib/status";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-tint text-brand-strong",
  warn: "bg-[#fdf1d8] text-[#a8740a]",
  danger: "bg-[#fde4e4] text-[#c43838]",
  info: "bg-[#e3eeff] text-[#2a63b8]",
  purple: "bg-[#ece7fa] text-purple",
  neutral: "bg-[#eef0ef] text-[#6b7f78]",
};

interface BadgeProps {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ tone = "success", className, children }: BadgeProps) {
  return (
    <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap", TONE_CLASSES[tone], className)}>
      {children}
    </span>
  );
}

/** Status badge coloured with the KMC prototype's status palette. */
export function KmcStatus({ status }: { status: string }) {
  return <Badge tone={kmcTone(status)}>{status}</Badge>;
}

/** Status badge coloured with the ward prototype's status palette. */
export function WardStatus({ status }: { status: string }) {
  return <Badge tone={wardTone(status)}>{status}</Badge>;
}
