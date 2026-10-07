"use client";

import { Box } from "@/components/ui/Box";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatStrip } from "@/components/ui/StatStrip";
import { WardMap } from "../WardMap";
import { WardPanel } from "./WardPanel";
import { CollectionToday } from "./CollectionToday";
import { AttentionList } from "./AttentionList";
import { useKmc } from "@/context/KmcContext";
import meta from "@/data/shared/meta.json";

export function KmcDashboard() {
  const { user, totalTons, countStatus, vehicles, reports, selectWard } = useKmc();

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} subtitle={`${meta.todayLabel} · Kathmandu, all ${meta.wardCount} wards`} />
      <StatStrip
        items={[
          { label: "Waste collected today", value: `${totalTons().toFixed(0)} tons` },
          { label: "Collection completion", value: `${Math.round((countStatus("Completed") / meta.wardCount) * 100)}%` },
          { label: "Active vehicles", value: `${vehicles.filter((x) => x.st === "Active").length} of ${vehicles.length}` },
          { label: "Open complaints", value: String(reports.filter((r) => r.s !== "Resolved").length) },
        ]}
      />
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <Box>
          <h2>Waste collected by ward (tons)</h2>
          <p className="-mt-1.5 text-[13px] text-mut">Stylized ward layout, not to geographic scale. Select a ward.</p>
          <WardMap mode="tons" onPick={selectWard} />
          <div className="flex items-center gap-2 text-xs text-mut">
            Low
            <i className="h-2 w-[140px] rounded bg-[linear-gradient(90deg,color-mix(in_srgb,var(--ac)_8%,var(--s)),var(--ac))]" />
            High
          </div>
        </Box>
        <div>
          <Box className="mb-5">
            <WardPanel />
          </Box>
          <CollectionToday />
        </div>
      </div>
      <AttentionList />
    </>
  );
}
