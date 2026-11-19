"use client";

import { Camera, CheckCircle2, Circle, Clock, Truck, User, Users } from "lucide-react";
import { Pill } from "@/components/ui/Status";
import { apiUrl } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { ReportExtra } from "@/types/ward";

const SOURCE: Record<string, { icon: typeof User; tone: "B" | "P" | "" }> = {
  Citizen: { icon: Users, tone: "B" },
  Driver: { icon: Truck, tone: "P" },
};

export function SourceBadge({ source }: { source: string }) {
  const s = SOURCE[source] ?? { icon: User, tone: "" as const };
  const Icon = s.icon;
  return (
    <Pill tone={s.tone}>
      <Icon size={12} className="mr-1" />
      {source}
    </Pill>
  );
}

function when(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/** Photo evidence and the status timeline of a report. */
export function ReportEvidence({ report }: { report: ReportExtra }) {
  const history = report.history ?? [];
  return (
    <>
      <h3 className="mt-4 flex items-center gap-1.5">
        <Camera size={14} /> Photo evidence
      </h3>
      {report.photo ? (
        <a href={apiUrl(report.photo)} target="_blank" rel="noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={apiUrl(report.photo)}
            alt="Photo attached to the report"
            className="max-h-56 w-full rounded-xl border border-line bg-ac-wash object-cover"
          />
        </a>
      ) : (
        <p className="m-0 text-[13px] text-mut">No photo attached.</p>
      )}
      <h3 className="mt-4 flex items-center gap-1.5">
        <Clock size={14} /> Status timeline
      </h3>
      {history.length === 0 ? (
        <p className="m-0 text-[13px] text-mut">No history recorded.</p>
      ) : (
        <ol className="m-0 list-none p-0">
          {history.map((h, i) => {
            const last = i === history.length - 1;
            const Icon = h.status === "Resolved" ? CheckCircle2 : Circle;
            return (
              <li key={i} className="relative flex gap-3 pb-3">
                {!last && <span className="absolute left-[9px] top-5 h-[calc(100%-12px)] w-0.5 bg-line" aria-hidden />}
                <Icon size={20} className={cn("relative shrink-0", last ? "text-ac" : "text-mut")} fill={last ? "currentColor" : "none"} fillOpacity={0.15} />
                <div className="min-w-0 text-[13px]">
                  <b className="text-ink">{h.status === "Pending" && i === 0 ? "Submitted" : h.status}</b>
                  {h.at && <span className="text-mut"> · {when(h.at)}</span>}
                  {h.note && <div className="text-mut">{h.note}</div>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
