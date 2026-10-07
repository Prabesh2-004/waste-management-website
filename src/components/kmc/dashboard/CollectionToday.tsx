"use client";

import { useRouter } from "next/navigation";
import { Box } from "@/components/ui/Box";
import { SplitBar } from "@/components/ui/Bars";
import { Row } from "@/components/ui/Row";
import { KmcStatus } from "../KmcStatus";
import { useKmc } from "@/context/KmcContext";
import { kmcTones } from "@/lib/kmc";
import options from "@/data/kmc/options.json";
import meta from "@/data/shared/meta.json";

const toneBackground = { G: "bg-ok", A: "bg-warn", R: "bg-bad", B: "bg-info", "": "bg-mut" } as const;

export function CollectionToday() {
  const { countStatus, setCollectionTab } = useKmc();
  const router = useRouter();
  const statuses = options.collectionStatuses;

  return (
    <Box>
      <h2>Collection today</h2>
      <SplitBar
        segments={statuses.map((s) => ({
          percent: (countStatus(s) / meta.wardCount) * 100,
          className: toneBackground[kmcTones[s] ?? ""],
        }))}
      />
      {statuses.map((s) => (
        <Row
          key={s}
          onClick={() => {
            setCollectionTab("Overview");
            router.push("/kmc/collection");
          }}
        >
          <span>
            <KmcStatus status={s} />
          </span>
          <b>{countStatus(s)}</b>
        </Row>
      ))}
    </Box>
  );
}
