"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { KeyValueGrid } from "@/components/ui/KeyValueGrid";
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
      <h3>Ward {selectedWard}</h3>
      <KeyValueGrid
        items={[
          { label: "Collected today", value: `${ward.t.toFixed(1)} t` },
          { label: "Collection", value: `${completionPercent(ward, wardStatus[selectedWard])}%` },
          { label: "Organic", value: `${organic.toFixed(1)} t` },
          { label: "Inorganic", value: `${(ward.t - organic).toFixed(1)} t` },
          { label: "Active vehicles", value: ward.veh },
          { label: "Open complaints", value: openComplaints(selectedWard) },
        ]}
      />
      <Button onClick={() => router.push("/kmc/wards")}>View Ward Details</Button>
    </>
  );
}
