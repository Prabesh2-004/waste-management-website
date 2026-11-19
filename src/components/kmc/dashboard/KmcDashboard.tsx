"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, Clock, Leaf, Map as MapIcon, Trash2, Truck } from "lucide-react";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatStrip } from "@/components/ui/StatStrip";
import { LiveCollection } from "@/components/shared/admin/LiveCollection";
import { WardMap } from "../WardMap";
import { WardPanel } from "./WardPanel";
import { CollectionToday } from "./CollectionToday";
import { AttentionList } from "./AttentionList";
import { useKmc } from "@/context/KmcContext";
import meta from "@/data/shared/meta.json";

export function KmcDashboard() {
  const { user, call, totalTons, countStatus, vehicles, reports, selectWard, notifications } = useKmc();
  const router = useRouter();
  const active = vehicles.filter((x) => x.st === "Active").length;
  const maintenance = vehicles.filter((x) => x.st === "Maintenance").length;

  return (
    <>
      <PageHeader
        title="KMC Dashboard"
        subtitle={`Welcome, ${user.name.split(" ")[0]} · Citywide waste management overview across ${meta.wardCount} wards`}
      />
      <StatStrip
        items={[
          { label: "Waste collected", value: `${totalTons().toFixed(0)} tons`, hint: "Today, all wards", icon: <Trash2 size={20} /> },
          {
            label: "Collection coverage",
            value: `${Math.round((countStatus("Completed") / meta.wardCount) * 100)}%`,
            hint: `${countStatus("Completed")} of ${meta.wardCount} wards done`,
            icon: <Leaf size={20} />,
            tone: "G",
          },
          { label: "Active vehicles", value: `${active} / ${vehicles.length}`, hint: `${maintenance} in maintenance`, icon: <Truck size={20} />, tone: "B" },
          {
            label: "Open complaints",
            value: String(reports.filter((r) => r.s !== "Resolved").length),
            hint: `${reports.filter((r) => r.s === "Pending").length} pending`,
            icon: <AlertTriangle size={20} />,
            tone: "R",
          },
        ]}
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Box title={`Kathmandu Wards (${meta.wardCount})`} icon={<MapIcon size={18} />}>
          <p className="-mt-2 mb-3 text-[13px] text-mut">Waste collected by ward (tons). Stylized layout; select a ward.</p>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div>
              <WardMap mode="tons" onPick={selectWard} />
              <div className="flex items-center gap-2 text-xs text-mut">
                Low
                <i className="h-2 w-[140px] rounded bg-[linear-gradient(90deg,color-mix(in_srgb,var(--ac)_8%,var(--s)),var(--ac))]" />
                High
              </div>
            </div>
            <div className="rounded-2xl border border-line p-3.5">
              <WardPanel />
            </div>
          </div>
        </Box>
        <AttentionList />
      </div>

      <LiveCollection
        call={call}
        ward={null}
        title="Citywide collection map"
        showCentres
        className="mt-5"
        listFilter={(r) => r.status !== "Completed"}
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <CollectionToday />
        <Box
          title="Recent activity"
          icon={<Clock size={18} />}
          action={
            <Button variant="link" size="sm" onClick={() => router.push("/kmc/updates")}>
              Updates
            </Button>
          }
        >
          {notifications.length === 0 && <p className="m-0 text-sm text-mut">Nothing yet.</p>}
          <ol className="m-0 list-none p-0">
            {notifications.slice(0, 7).map((n, i) => (
              <li key={`${n.text}-${i}`}>
                <button
                  type="button"
                  onClick={() => router.push(n.href)}
                  className="-mx-2 flex w-[calc(100%+16px)] items-start gap-3 rounded-xl px-2 py-2 text-left text-sm hover:bg-ac-faint"
                >
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ac" />
                  <span>{n.text}</span>
                </button>
              </li>
            ))}
          </ol>
        </Box>
      </div>
    </>
  );
}
