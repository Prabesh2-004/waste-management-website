import optionsData from "@/data/kmc/options.json";
import toneData from "@/data/kmc/statusTones.json";
import hexData from "@/data/kmc/hexLayout.json";
import type { HexCell, WardStat } from "@/types/kmc";
import type { ToneMap } from "@/types";

export const kmcTones = toneData as ToneMap;

export function completionPercent(ward: WardStat, status: string): number {
  if (status === "Completed") return 100;
  const { base, step, mod } = optionsData.fallbackCompletion;
  return ward.comp || Math.round(base + (ward.n % mod) * step);
}

export function buildHexCells(): HexCell[] {
  const { size: s, origin, warp, rows } = hexData;
  const w = Math.sqrt(3) * s;
  const wp = (x: number, y: number): [number, number] => [
    x + warp.amplitude * Math.sin(y / warp.xDivisor),
    y + warp.amplitude * Math.sin(x / warp.yDivisor),
  ];
  const cells: HexCell[] = [];
  let k = 1;
  rows.forEach((r, i) => {
    for (let j = 0; j < r[0]; j++) {
      const cx = origin.x + (r[1] + j) * w + ((i % 2) * w) / 2;
      const cy = origin.y + i * 1.5 * s;
      cells.push({
        n: k++,
        c: wp(cx, cy),
        p: [0, 1, 2, 3, 4, 5].map((a) => {
          const g = ((30 + 60 * a) * Math.PI) / 180;
          return wp(cx + s * Math.cos(g), cy + s * Math.sin(g));
        }),
      });
    }
  });
  return cells;
}
