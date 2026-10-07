"use client";

import { Box } from "@/components/ui/Box";
import { Row } from "@/components/ui/Row";
import { KmcStatus } from "../KmcStatus";
import { ProgramDrawer } from "./ProgramDrawer";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";

export function ProgramList() {
  const { programs, awarenessTab } = useKmc();
  const { openDrawer } = useUi();
  const list = programs.filter((p) => p.s === awarenessTab);

  return (
    <Box>
      {list.map((p) => (
        <Row key={p.id} onClick={() => openDrawer(<ProgramDrawer programId={p.id} />)}>
          <span>
            <b>{p.n}</b>{" "}
            <span className="text-mut">
              Ward {p.w} · {p.d}
            </span>
          </span>
          <span className="shrink-0 text-right">
            <KmcStatus status={p.s} /> · {p.s === "Upcoming" ? `${p.reg} registered` : `${p.att} / ${p.exp} attended`}
          </span>
        </Row>
      ))}
      {list.length === 0 && <p className="text-mut">Nothing here yet.</p>}
    </Box>
  );
}
