"use client";

import { useRouter } from "next/navigation";
import { Box } from "@/components/ui/Box";
import { LinkText } from "@/components/ui/Button";
import { Row } from "@/components/ui/Row";
import { KmcStatus } from "../KmcStatus";
import { useKmc } from "@/context/KmcContext";
import alerts from "@/data/kmc/dashboardAlerts.json";

export function AttentionList() {
  const { reports, setCollectionTab } = useKmc();
  const router = useRouter();
  const pending = reports.filter((r) => r.s === "Pending").length;

  return (
    <Box className="mt-[22px]">
      <h2>Needs attention</h2>
      {alerts.map((a) => (
        <Row
          key={a.id}
          onClick={() => {
            if (a.collectionTab) setCollectionTab(a.collectionTab);
            router.push(a.href);
          }}
        >
          <span>
            <KmcStatus status={a.status} dotOnly /> {a.text.replace("{count}", String(pending))}
          </span>
          <LinkText>Open</LinkText>
        </Row>
      ))}
    </Box>
  );
}
