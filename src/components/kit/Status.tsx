import { cn } from "@/lib/cn";
import type { Tone, ToneMap } from "@/types";

const toneClass: Record<Tone, string> = {
  G: "bg-ok",
  A: "bg-warn",
  R: "bg-bad",
  B: "bg-info",
  P: "bg-violet",
  "": "bg-mut",
};

const pillClass: Record<Tone, string> = {
  G: "bg-ok-soft text-ok",
  A: "bg-warn-soft text-warn",
  R: "bg-bad-soft text-bad",
  B: "bg-info-soft text-info",
  P: "bg-violet-soft text-violet",
  "": "bg-ac-faint text-mut",
};

export function Dot({ tone }: { tone: Tone }) {
  return <span className={cn("mr-[7px] inline-block h-2 w-2 shrink-0 rounded-full", toneClass[tone])} />;
}

export function Pill({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold", pillClass[tone], className)}>
      {children}
    </span>
  );
}

interface StatusProps {
  status: string;
  tones: ToneMap;
  dotOnly?: boolean;
}

export function Status({ status, tones, dotOnly }: StatusProps) {
  const tone = tones[status] ?? "";
  if (dotOnly) return <Dot tone={tone} />;
  return <Pill tone={tone}>{status}</Pill>;
}
