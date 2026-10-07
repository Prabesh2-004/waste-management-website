"use client";

import { useMemo } from "react";
import { useKmc } from "@/context/KmcContext";
import { buildHexCells } from "@/lib/kmc";
import { cn } from "@/lib/cn";
import hexData from "@/data/kmc/hexLayout.json";

interface WardMapProps {
  mode: "tons" | "routes";
  onPick?: (ward: number) => void;
}

export function WardMap({ mode, onPick }: WardMapProps) {
  const { wards, selectedWard, routes, wardStatus, vehicles } = useKmc();
  const cells = useMemo(() => buildHexCells(), []);
  const tons = wards.map((w) => w.t);
  const max = Math.max(...tons);
  const min = Math.min(...tons);

  return (
    <svg
      className="h-auto w-full [&_text]:pointer-events-none [&_text]:text-[11px]"
      viewBox={hexData.viewBox}
      role="img"
      aria-label="Stylized map of Kathmandu's 32 wards"
    >
      {cells.map((h) => {
        const points = h.p.map((q) => q.map((z) => z.toFixed(1)).join(",")).join(" ");
        if (mode === "tons") {
          const t = wards[h.n - 1].t;
          const p = 8 + ((t - min) / (max - min)) * 62;
          const selected = h.n === selectedWard;
          return (
            <g key={h.n}>
              <polygon
                className={cn("cursor-pointer", selected ? "stroke-ink stroke-3" : "stroke-surface stroke-2 hover:stroke-ink")}
                points={points}
                style={{ fill: `color-mix(in srgb,var(--ac) ${p}%,var(--s))` }}
                onClick={() => onPick?.(h.n)}
              >
                <title>{`Ward ${h.n}: ${t.toFixed(1)} t`}</title>
              </polygon>
              <text x={h.c[0]} y={h.c[1] - 1} textAnchor="middle" fill={p > 40 ? "#fff" : "var(--ink)"}>
                {`W${h.n}`}
              </text>
              <text x={h.c[0]} y={h.c[1] + 11} textAnchor="middle" fill={p > 40 ? "#fff" : "var(--mut)"}>
                {t.toFixed(1)}
              </text>
            </g>
          );
        }
        return (
          <g key={h.n}>
            <polygon className="cursor-default fill-line stroke-surface stroke-2 hover:stroke-ink" points={points} />
            <text x={h.c[0]} y={h.c[1] + 4} textAnchor="middle" fill="var(--mut)">
              {h.n}
            </text>
          </g>
        );
      })}
      {mode === "routes" &&
        routes
          .filter((r) => wardStatus[r.w] === "In Progress" && vehicles.find((x) => x.id === r.v)?.st === "Active")
          .map((r) => {
            const h = cells[r.w - 1];
            return (
              <g key={`${r.w}-${r.v}`}>
                <circle cx={h.c[0] + 8} cy={h.c[1] - 9} r={9} fill="var(--ac)" />
                <text x={h.c[0] + 8} y={h.c[1] - 6} textAnchor="middle" fill="#fff" style={{ fontSize: 8 }}>
                  {r.v.slice(4)}
                </text>
              </g>
            );
          })}
    </svg>
  );
}
