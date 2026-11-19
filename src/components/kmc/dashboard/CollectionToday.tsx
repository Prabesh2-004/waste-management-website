"use client";

import { useRouter } from "next/navigation";
import { PieChart } from "lucide-react";
import { Box } from "@/components/ui/Box";
import { Ring } from "@/components/ui/Bars";
import { Dot } from "@/components/ui/Status";
import { useKmc } from "@/context/KmcContext";
import { kmcTones } from "@/lib/kmc";
import options from "@/data/kmc/options.json";
import meta from "@/data/shared/meta.json";

export function CollectionToday() {
  const { countStatus, setCollectionTab } = useKmc();
  const router = useRouter();
  const statuses = options.collectionStatuses;
  const pct = Math.round((countStatus("Completed") / meta.wardCount) * 100);

  return (
    <Box title="Ward performance today" icon={<PieChart size={18} />}>
      <div className="flex flex-wrap items-center gap-5">
        <Ring percent={pct} size={120} stroke={12}>
          <div>
            <b className="block text-2xl">{meta.wardCount}</b>
            <span className="text-xs text-mut">wards</span>
          </div>
        </Ring>
        <div className="min-w-[180px] flex-1">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setCollectionTab("Overview");
                router.push("/kmc/collection");
              }}
              className="-mx-2 flex w-[calc(100%+16px)] items-center justify-between rounded-xl px-2 py-2 text-sm hover:bg-ac-faint"
            >
              <span className="flex items-center">
                <Dot tone={kmcTones[s] ?? ""} />
                {s}
              </span>
              <span className="flex gap-3">
                <b>{countStatus(s)} wards</b>
                <span className="w-10 text-right text-mut">{Math.round((countStatus(s) / meta.wardCount) * 100)}%</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </Box>
  );
}
