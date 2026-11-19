"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, Bell, CalendarClock, ChevronRight, ClipboardList, FileWarning, Megaphone, Recycle, Truck, Users, Wrench,
} from "lucide-react";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Ring, SplitBar } from "@/components/ui/Bars";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatStrip, toneSoft } from "@/components/ui/StatStrip";
import { Pill } from "@/components/ui/Status";
import { LiveCollection } from "@/components/shared/admin/LiveCollection";
import { WardStatus } from "../WardStatus";
import { RouteDrawer } from "../collection/RouteDrawer";
import { ProgramDrawer } from "../awareness/ProgramDrawer";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import { programStatus, wardTones } from "@/lib/ward";
import { cn } from "@/lib/cn";
import options from "@/data/ward/options.json";
import shared from "@/data/shared/options.json";
import type { Tone } from "@/types";

interface Alert {
  text: string;
  detail: string;
  status: string;
  href: string;
  icon: typeof Truck;
  tab?: string;
}

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function WardDashboard() {
  const { wardName, user, call, routes, vehicles, reports, updates, programs, tons, completion, openComplaints, setCollectionTab } = useWard();
  const { openDrawer } = useUi();
  const router = useRouter();
  const [hello, setHello] = useState("Hello");
  const [today, setToday] = useState("");
  useEffect(() => {
    setHello(greeting());
    setToday(new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
  }, []);

  const total = tons();
  const organic = (total * options.organicShare.organic) / options.organicShare.total;
  const done = routes.filter((r) => r.s === "Completed").length;
  const troubled = routes.filter((r) => r.s === "Delayed" || r.s === "Incomplete");
  const pending = reports.filter((r) => r.s === "Pending").length;
  const activeVehicles = vehicles.filter((x) => x.st === "Active").length;

  const alerts: Alert[] = [];
  troubled.forEach((r) =>
    alerts.push({
      text: `${r.s === "Delayed" ? "Delayed" : "Incomplete"} collection`,
      detail: `Route ${r.n} · ${r.area} · ${r.v}`,
      status: r.s,
      href: "/ward/collection",
      tab: "Overview",
      icon: AlertTriangle,
    })
  );
  alerts.push({
    text: "Vehicle maintenance due",
    detail: "KMC-04 requires maintenance in 12 days",
    status: "Pending",
    href: "/ward/collection",
    tab: "Vehicles",
    icon: Wrench,
  });
  if (pending)
    alerts.push({
      text: `${pending} complaint${pending > 1 ? "s" : ""} waiting`,
      detail: "Citizens are waiting for a response",
      status: "Pending",
      href: "/ward/reports",
      icon: FileWarning,
    });
  if (updates[0]?.t.startsWith("Collection timing")) {
    alerts.push({
      text: "Collection schedule changed",
      detail: updates[0].t.replace("Collection timing changed for ", ""),
      status: "Upcoming",
      href: "/ward/updates",
      icon: CalendarClock,
    });
  }

  const upcoming = programs.filter((p) => p.s !== "Completed").slice(0, 4);
  const next = programs.find((p) => p.s === "Scheduled" && p.ap === "Approved");
  const participation = programs.reduce((a, p) => a + p.att, 0);
  const pct = routes.length ? Math.round((done / routes.length) * 100) : 0;

  return (
    <>
      <PageHeader title="Ward Dashboard" subtitle={`${hello}, ${user.name.split(" ")[0]}! · ${wardName}${today ? ` · ${today}` : ""}`} />
      <StatStrip
        items={[
          { label: "Collections", value: `${done} / ${routes.length}`, hint: "Routes completed today", icon: <Truck size={20} />, tone: "G" },
          { label: "Delayed / Missed", value: String(troubled.length), hint: "Need follow-up", icon: <AlertTriangle size={20} />, tone: "A" },
          { label: "Open complaints", value: String(openComplaints()), hint: `${pending} pending`, icon: <ClipboardList size={20} />, tone: "R" },
          { label: "Vehicles available", value: `${activeVehicles} / ${vehicles.length}`, hint: "Currently active", icon: <Truck size={20} />, tone: "B" },
        ]}
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <LiveCollection
          call={call}
          ward={user.ward}
          title="Collection activity"
          onOpenRoute={(r) => openDrawer(<RouteDrawer routeNumber={r.n} />)}
        />
        <div className="space-y-5">
          <Box title="Needs your attention" icon={<Bell size={18} />} action={<Pill tone="R">{alerts.length}</Pill>}>
            {alerts.map((a, i) => {
              const Icon = a.icon;
              const tone = (wardTones[a.status] ?? "") as Tone;
              return (
                <button
                  key={`${a.text}-${i}`}
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
                  <ChevronRight size={16} className="shrink-0 text-mut" />
                </button>
              );
            })}
          </Box>
          <Box
            title="Upcoming activities"
            icon={<CalendarClock size={18} />}
            action={
              <Button variant="link" size="sm" onClick={() => router.push("/ward/awareness")}>
                View all
              </Button>
            }
          >
            {upcoming.length === 0 && <p className="m-0 text-sm text-mut">Nothing scheduled.</p>}
            {upcoming.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => openDrawer(<ProgramDrawer programId={p.id} />)}
                className="-mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-xl border-b border-line px-2 py-2.5 text-left last:border-b-0 hover:bg-ac-faint"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-soft text-violet">
                  <Megaphone size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm">{p.n}</b>
                  <span className="block truncate text-xs text-mut">
                    {p.d} · {p.tm}
                  </span>
                </span>
                <WardStatus status={programStatus(p)} />
              </button>
            ))}
          </Box>
        </div>
      </div>

      <Box title="Ward progress snapshot" icon={<Recycle size={18} />} className="mt-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex items-center gap-3 rounded-2xl bg-ac-wash p-3.5">
            <Ring percent={pct} size={72} stroke={8}>
              <b className="text-sm">{pct}%</b>
            </Ring>
            <div className="text-sm">
              <b className="block">Routes completed</b>
              <span className="text-mut">
                {done} of {routes.length} · ward rate {completion()}%
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-ac-wash p-3.5">
            <span className="text-[13px] text-mut">Waste collected today</span>
            <b className="block text-2xl">{total.toFixed(2)} t</b>
            <SplitBar
              segments={[
                { percent: shared.organicRatio * 100, className: "bg-ok" },
                { percent: 100 - shared.organicRatio * 100, className: "bg-info" },
              ]}
            />
            <div className="text-xs text-mut">
              Organic {organic.toFixed(1)} t · Inorganic {(total - organic).toFixed(1)} t
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-ac-wash p-3.5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-ac-soft text-ac">
              <Users size={20} />
            </span>
            <div className="text-sm">
              <b className="block text-2xl">{participation}</b>
              <span className="text-mut">Awareness participation</span>
            </div>
          </div>
          <div className="rounded-2xl bg-ac-wash p-3.5">
            <span className="text-[13px] text-mut">Next awareness program</span>
            {next ? (
              <>
                <b className="block truncate">{next.n}</b>
                <span className="block text-xs text-mut">
                  {next.d} · {next.reg} registered
                </span>
                <Button variant="soft" size="sm" className="mt-2" onClick={() => openDrawer(<ProgramDrawer programId={next.id} />)}>
                  View Program
                </Button>
              </>
            ) : (
              <p className="m-0 text-sm text-mut">None scheduled.</p>
            )}
          </div>
        </div>
        <p className="mb-0 mt-3 text-xs text-mut">
          Truck positions come from the drivers&apos; phones (Driver section). Totals are shared with KMC.
        </p>
      </Box>
    </>
  );
}
