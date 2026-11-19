"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { KeyValueGrid } from "@/components/ui/KeyValueGrid";
import { KmcStatus } from "../KmcStatus";
import { useKmc } from "@/context/KmcContext";
import { completionPercent } from "@/lib/kmc";
import options from "@/data/shared/options.json";

export function WardPanel() {
  const { wards, selectedWard, wardStatus, openComplaints } = useKmc();
  const router = useRouter();
  const ward = wards[selectedWard - 1];
  const organic = ward.t * options.organicRatio;

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <b className="flex items-center gap-1.5 text-lg">
          <MapPin size={18} className="text-ac" /> Ward {selectedWard}
        </b>
        <KmcStatus status={wardStatus[selectedWard]} />
      </div>
      <KeyValueGrid
        items={[
          { label: "Collected today", value: `${ward.t.toFixed(1)} t`, compact: true },
          { label: "Collection", value: `${completionPercent(ward, wardStatus[selectedWard])}%`, compact: true },
          { label: "Organic", value: `${organic.toFixed(1)} t`, compact: true },
          { label: "Inorganic", value: `${(ward.t - organic).toFixed(1)} t`, compact: true },
          { label: "Active vehicles", value: ward.veh, compact: true },
          { label: "Open complaints", value: openComplaints(selectedWard), compact: true },
        ]}
      />
      <Button block onClick={() => router.push("/kmc/wards")}>
        View Ward Details <ArrowRight size={16} />
      </Button>
    </>
  );
}
