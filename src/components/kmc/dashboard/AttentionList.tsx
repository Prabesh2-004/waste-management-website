"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarClock, ChevronRight, FileWarning, Flag, Truck, Wrench } from "lucide-react";
import { Box } from "@/components/ui/Box";
import { Pill } from "@/components/ui/Status";
import { toneSoft } from "@/components/ui/StatStrip";
import { useKmc } from "@/context/KmcContext";
import { kmcTones } from "@/lib/kmc";
import { cn } from "@/lib/cn";
import alerts from "@/data/kmc/dashboardAlerts.json";
import type { Tone } from "@/types";

interface Item {
  id: string;
  text: string;
  detail: string;
  status: string;
  href: string;
  tab: string | null;
  icon: typeof Truck;
}

const STATIC_ICON: Record<string, typeof Truck> = { Delayed: AlertTriangle, Pending: Wrench };

export function AttentionList() {
  const { reports, programs, wardStatus, setCollectionTab } = useKmc();
  const router = useRouter();
  const pending = reports.filter((r) => r.s === "Pending").length;

  const items: Item[] = [];
  Object.entries(wardStatus)
    .filter(([, s]) => s === "Delayed" || s === "Incomplete")
    .forEach(([w, s]) =>
      items.push({
        id: `ward-${w}`,
        text: `Collection ${s.toLowerCase()} in Ward ${w}`,
        detail: "Check the route and the driver",
        status: s,
        href: "/kmc/collection",
        tab: "Overview",
        icon: Truck,
      })
    );
  programs
    .filter((p) => p.ap === "Pending KMC review")
    .forEach((p) =>
      items.push({
        id: `program-${p.id}`,
        text: `Program review: ${p.n}`,
        detail: `Ward ${p.w} · ${p.d}`,
        status: "Pending",
        href: "/kmc/awareness",
        tab: null,
        icon: CalendarClock,
      })
    );
  alerts
    .filter((a) => !(a.status === "Delayed" && items.some((i) => i.text === a.text)))
    .forEach((a) =>
      items.push({
        id: a.id,
        text: a.text.replace("{count}", String(pending)),
        detail: a.href === "/kmc/reports" ? "Wards are handling them" : a.collectionTab === "Vehicles" ? "Vehicle records" : "Collection overview",
        status: a.status,
        href: a.href,
        tab: a.collectionTab,
        icon: a.href === "/kmc/reports" ? FileWarning : (STATIC_ICON[a.status] ?? AlertTriangle),
      })
    );

  return (
    <Box title="Needs KMC attention" icon={<Flag size={18} />} action={<Pill tone="R">{items.length}</Pill>}>
      {items.map((a) => {
        const Icon = a.icon;
        const tone = (kmcTones[a.status] ?? "") as Tone;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => {
              if (a.tab) setCollectionTab(a.tab);
              router.push(a.href);
            }}
            className="-mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-xl border-b border-line px-2 py-2.5 text-left last:border-b-0 hover:bg-ac-faint"
          >
            <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", toneSoft[tone])}>
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block truncate text-sm">{a.text}</b>
              <span className="block truncate text-xs text-mut">{a.detail}</span>
            </span>
            <Pill tone={tone}>{a.status}</Pill>
            <ChevronRight size={16} className="shrink-0 text-mut" />
          </button>
        );
      })}
    </Box>
  );
}
