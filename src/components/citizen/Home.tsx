"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarDays, ChevronRight, FileText, Lightbulb, MapPin, MessageCircle, ScanLine, Trash2, Truck } from "lucide-react";
import { SectionTitle, TapCard } from "@/components/mobile/MobileShell";
import { Pill } from "@/components/ui/Status";
import { useCitizen } from "@/context/CitizenContext";
import { ago, clock, estimateRoute, formatMinutes, isLive } from "@/lib/eta";
import { formatTime } from "@/lib/format";
import { dayLabel, nextCollection } from "@/lib/schedule";

const TIPS = [
  "Clean and dry recyclables are easier to process and can be turned into new products.",
  "Kitchen waste makes good compost: peels, tea leaves and vegetable scraps.",
  "Keep batteries and old phones out of the bin. Take them to your ward office.",
  "Rinse plastic bottles and crush them: they take less space in the truck.",
];

export const WARD_STATUS_TONE: Record<string, "G" | "B" | "A" | "R"> = {
  Completed: "G",
  "In Progress": "B",
  Delayed: "A",
  Incomplete: "R",
};

export function statusText(status: string): string {
  return status === "In Progress" ? "Collection under way" : status === "Completed" ? "Collected today" : status;
}

export function CitizenHome() {
  const { state } = useCitizen();
  if (!state) return null;
  const { ward, live, updates, programs } = state;
  const next = nextCollection(ward.time, ward.status);
  const activeRoute = live.routes.find((r) => r.status === "In Progress") ?? live.routes.find((r) => r.status === "Delayed");
  const truck = activeRoute ? live.vehicles.find((v) => v.id === activeRoute.vehicle) : undefined;
  const eta = activeRoute && truck?.location ? estimateRoute(activeRoute.stops, truck.location, truck.location.speed) : null;
  const alert = updates.find((u) => /delay|chang|closure|clos/i.test(`${u.t} ${u.b}`));
  const program = programs.find((p) => p.w === ward.n && p.s !== "Completed") ?? programs.find((p) => p.s !== "Completed");
  const tip = TIPS[new Date().getDate() % TIPS.length];

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-4 shadow-card">
        <div className="flex gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ac-soft text-ac">
            <Trash2 size={24} />
          </span>
          <div className="min-w-0">
            <span className="text-sm text-mut">Next collection</span>
            <b className="block text-[22px] leading-tight">
              {dayLabel(next)}, {formatTime(ward.time)}
            </b>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Pill tone={WARD_STATUS_TONE[ward.status] ?? "B"}>● {statusText(ward.status)}</Pill>
              <Pill tone="">{ward.kind}</Pill>
            </div>
          </div>
        </div>
        <p className="mb-3 mt-3 text-sm text-mut">
          {activeRoute
            ? eta && eta.legs.length
              ? `The truck on Route ${activeRoute.n} (${activeRoute.area}) has ${eta.legs.length} stops left, finishing around ${clock(eta.finishAt)}.`
              : `Route ${activeRoute.n} (${activeRoute.area}) is on its way.`
            : "Please keep your waste segregated and ready before the truck arrives."}
        </p>
        <Link
          href="/citizen/collection"
          className="flex items-center justify-between rounded-2xl bg-ac px-4 py-3.5 font-semibold text-white active:scale-[0.99]"
        >
          <span className="flex items-center gap-2.5">
            <MapPin size={19} /> Track collection
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-white/85">
            {truck?.location ? (isLive(truck.location.at, live.liveSeconds) ? "Live now" : `seen ${ago(truck.location.at)}`) : ""}
            <ChevronRight size={18} />
          </span>
        </Link>
        {eta && eta.legs.length > 0 && (
          <p className="mb-0 mt-2.5 text-center text-xs text-mut">
            Next stop {eta.legs[0].stop.name} in about {formatMinutes(eta.legs[0].arriveMin)}
          </p>
        )}
      </div>

      {alert && (
        <Link href="/citizen/community?tab=news" className="mt-4 flex gap-3 rounded-3xl border border-warn/30 bg-warn-soft p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-warn/20 text-warn">
            <AlertTriangle size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <b className="block text-warn">Important update</b>
            <span className="block text-sm">{alert.t}</span>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-ac">
              View details <ArrowRight size={14} />
            </span>
          </span>
        </Link>
      )}

      <SectionTitle>Quick actions</SectionTitle>
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { href: "/citizen/identify", icon: ScanLine, title: "Identify Waste", sub: "Live scan" },
          { href: "/citizen/reports?new=1", icon: FileText, title: "Report Issue", sub: "Help us improve" },
          { href: "/citizen/identify?tab=ask", icon: MessageCircle, title: "Ask", sub: "Waste questions" },
        ].map(({ href, icon: Icon, title, sub }) => (
          <Link key={title} href={href} className="flex flex-col items-center rounded-3xl border border-line bg-surface px-2 py-4 text-center shadow-card active:scale-[0.98]">
            <span className="mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-ac-soft text-ac">
              <Icon size={24} />
            </span>
            <b className="text-[13px] leading-tight">{title}</b>
            <span className="text-[11px] text-mut">{sub}</span>
          </Link>
        ))}
      </div>

      {program && (
        <>
          <SectionTitle
            action={
              <Link href="/citizen/community" className="text-sm font-semibold text-ac">
                See all
              </Link>
            }
          >
            Community
          </SectionTitle>
          <TapCard
            href="/citizen/community"
            icon={<CalendarDays size={22} />}
            title={program.n}
            subtitle={`${program.d} · ${program.tm}${program.w === ward.n ? " · Your ward" : ` · Ward ${program.w}`}`}
            right={<ChevronRight size={18} className="text-mut" />}
          />
        </>
      )}

      {updates[0] && (
        <TapCard
          className="mt-2.5"
          href="/citizen/community?tab=news"
          icon={<Truck size={22} />}
          title={updates[0].t}
          subtitle={`${updates[0].c} · ${updates[0].d}`}
          right={<ChevronRight size={18} className="text-mut" />}
        />
      )}

      <div className="mt-6 flex gap-3 rounded-3xl bg-ac-soft p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ac text-white">
          <Lightbulb size={20} />
        </span>
        <div>
          <b className="block">Did you know?</b>
          <span className="text-sm text-ink/80">{tip}</span>
        </div>
      </div>
    </>
  );
}
