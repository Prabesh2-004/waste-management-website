"use client";

import { BarChart3 } from "lucide-react";
import { Box } from "@/components/ui/Box";
import { ProgressBar } from "@/components/ui/Bars";
import { Row } from "@/components/ui/Row";
import { useKmc } from "@/context/KmcContext";

export function ParticipationByWard() {
  const { programs } = useKmc();
  const byWard: Record<number, number> = {};
  programs.forEach((p) => {
    const w = p.w ?? 0;
    byWard[w] = (byWard[w] || 0) + p.att;
  });
  const max = Math.max(1, ...Object.values(byWard));
  const entries = Object.entries(byWard)
    .filter((e) => e[1])
    .sort((a, b) => b[1] - a[1]);

  return (
    <Box className="mt-[22px]" title="Participation by ward" icon={<BarChart3 size={18} />}>
      {entries.map(([ward, count]) => (
        <Row key={ward}>
          <b>Ward {ward}</b>
          <span className="flex items-center gap-2 text-sm">
            <ProgressBar className="w-[160px] max-sm:w-[90px]" percent={(count / max) * 100} />
            <b className="w-24 text-right">{count} attended</b>
          </span>
        </Row>
      ))}
      {entries.length === 0 && <p className="m-0 text-mut">No attendance recorded yet.</p>}
    </Box>
  );
}
