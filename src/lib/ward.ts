import toneData from "@/data/ward/statusTones.json";
import type { AwarenessProgram, ToneMap } from "@/types";

export const wardTones = toneData as ToneMap;

export function programStatus(p: AwarenessProgram): string {
  return p.ap === "Approved" ? p.s : (p.ap ?? p.s);
}
