"use client";

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
  const max = Math.max(...Object.values(byWard));
  const entries = Object.entries(byWard)
    .filter((e) => e[1])
    .sort((a, b) => b[1] - a[1]);

  return (
    <Box className="mt-[22px]">
      <h2>Program participation by ward</h2>
      {entries.map(([ward, count]) => (
        <Row key={ward}>
          <span>Ward {ward}</span>
          <span className="flex items-center gap-2">
            {count} attendees
            <ProgressBar className="w-[140px] max-sm:w-[80px]" percent={(count / max) * 100} />
          </span>
        </Row>
      ))}
    </Box>
  );
}
