import { cn } from "@/lib/cn";
import type { Tone, ToneMap } from "@/types";

const toneClass: Record<Tone, string> = {
  G: "bg-ok",
  A: "bg-warn",
  R: "bg-bad",
  B: "bg-info",
  "": "bg-mut",
};

export function Dot({ tone }: { tone: Tone }) {
  return <span className={cn("mr-[7px] inline-block h-2 w-2 rounded-full", toneClass[tone])} />;
}

interface StatusProps {
  status: string;
  tones: ToneMap;
  dotOnly?: boolean;
}

export function Status({ status, tones, dotOnly }: StatusProps) {
  return (
    <span>
      <Dot tone={tones[status] ?? ""} />
      {dotOnly ? null : status}
    </span>
  );
}
