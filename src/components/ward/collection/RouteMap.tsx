"use client";

import { useWard } from "@/context/WardContext";
import routeMap from "@/data/ward/routeMap.json";

const lines = routeMap.lines as Record<string, number[][]>;
const strokes = routeMap.strokes as Record<string, string>;

export function RouteMap() {
  const { routes } = useWard();

  return (
    <svg className="h-auto w-full rounded-lg bg-ac-wash" viewBox={routeMap.viewBox} role="img" aria-label="Simplified route map">
      {routes.map((r) => {
        const pts = lines[r.n];
        const mid = pts[2];
        return (
          <g key={r.n}>
            <polyline
              points={pts.map((p) => p.join(",")).join(" ")}
              fill="none"
              stroke={strokes[r.s]}
              strokeWidth={3}
              strokeDasharray={routeMap.dashed.includes(r.s) ? "6 4" : undefined}
            />
            <text x={pts[0][0]} y={pts[0][1] - 6} fontSize={11} fill="var(--ink)">
              {`R${r.n}`}
            </text>
            {r.s === "In Progress" && (
              <>
                <circle cx={mid[0]} cy={mid[1]} r={7} fill="var(--ac)" />
                <text x={mid[0]} y={mid[1] - 10} fontSize={10} textAnchor="middle" fill="var(--ink)">
                  {r.v}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
