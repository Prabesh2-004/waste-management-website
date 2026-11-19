"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, CheckCircle2, ChevronRight, Clock, MapPin, Megaphone, Newspaper, Sprout, Users } from "lucide-react";
import { SectionTitle, TapCard } from "@/components/mobile/MobileShell";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/Bars";
import { Pill } from "@/components/ui/Status";
import { Segmented } from "@/components/ui/Tabs";
import { useCitizen } from "@/context/CitizenContext";
import { useUi } from "@/context/UiContext";
import type { CitizenProgram } from "@/types/citizen";

function programStatus(p: CitizenProgram): { label: string; tone: "G" | "B" | "A" | "" } {
  if (p.mine) return { label: "Registered", tone: "G" };
  if (p.s === "Running") return { label: "Happening now", tone: "A" };
  if (p.exp && p.reg >= p.exp) return { label: "Full", tone: "" };
  return { label: "Registration open", tone: "B" };
}

function ProgramSheet({ id }: { id: number }) {
  const { state, setRegistered } = useCitizen();
  const { closeOverlay } = useUi();
  const [busy, setBusy] = useState(false);
  const p = state?.programs.find((x) => x.id === id);
  if (!p) return <p className="text-mut">This program is no longer listed.</p>;
  const full = !!p.exp && p.reg >= p.exp && !p.mine;
  const status = programStatus(p);
  const toggle = async () => {
    setBusy(true);
    await setRegistered(p, !p.mine);
    setBusy(false);
  };
  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <Pill tone={p.w === state?.ward.n ? "G" : "B"}>{p.w === state?.ward.n ? "Your ward" : `Ward ${p.w}`}</Pill>
        <Pill tone={status.tone}>{status.label}</Pill>
      </div>
      <h2 className="text-xl">{p.n}</h2>
      <div className="space-y-1.5 text-sm text-mut">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} /> {p.d}
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} /> {p.tm}
        </div>
        {p.loc && (
          <div className="flex items-center gap-2">
            <MapPin size={16} /> {p.loc}
          </div>
        )}
      </div>
      <p className="text-[15px]">{p.ds || "A community waste-awareness program."}</p>
      {!!p.exp && (
        <div className="mb-4 text-[13px] text-mut">
          <div className="mb-1 flex justify-between">
            <span>
              <Users size={14} className="mr-1 inline" />
              {p.reg} registered
            </span>
            <span>{p.exp} places</span>
          </div>
          <ProgressBar percent={(p.reg / p.exp) * 100} />
        </div>
      )}
      {p.s === "Completed" ? (
        <p className="text-mut">This program has taken place ({p.att} attended).</p>
      ) : (
        <Button block size="lg" variant={p.mine ? "outline" : "primary"} disabled={busy || full} onClick={toggle}>
          {busy ? "Please wait…" : p.mine ? "Cancel my registration" : full ? "Program is full" : "Register now"}
        </Button>
      )}
      <Button block variant="link" className="mt-2" onClick={closeOverlay}>
        Close
      </Button>
    </>
  );
}

function CommunityInner() {
  const { state } = useCitizen();
  const { openDrawer } = useUi();
  const params = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") === "news" ? "News & Progress" : "Programs");
  if (!state) return null;
  const upcoming = state.programs.filter((p) => p.s !== "Completed");
  const mineWard = upcoming.filter((p) => p.w === state.ward.n);
  const featured = mineWard[0];
  const city = upcoming.filter((p) => p.w !== state.ward.n);
  const mine = state.programs.filter((p) => p.mine);
  const open = (p: CitizenProgram) => openDrawer(<ProgramSheet id={p.id} />);

  const row = (p: CitizenProgram) => {
    const st = programStatus(p);
    return (
      <TapCard
        key={p.id}
        className="mb-2.5"
        onClick={() => open(p)}
        icon={<Sprout size={22} />}
        title={p.n}
        subtitle={
          <>
            {p.d} · {p.tm}
            {p.loc ? ` · ${p.loc}` : p.w !== state.ward.n ? ` · Ward ${p.w}` : ""}
            <span className="mt-1 block">
              <Pill tone={st.tone}>{st.label}</Pill>
            </span>
          </>
        }
        right={<ChevronRight size={18} className="text-mut" />}
      />
    );
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ac-soft text-ac">
          <Users size={26} />
        </span>
        <div>
          <h1 className="m-0 text-2xl">Community</h1>
          <span className="text-sm text-mut">Programs near you and waste-management news.</span>
        </div>
      </div>
      <Segmented items={["Programs", "News & Progress"]} active={tab} onChange={setTab} />

      {tab === "Programs" ? (
        <>
          {featured ? (
            <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
              <div className="relative h-28 bg-[linear-gradient(135deg,var(--ac),#0e6a3c)]">
                <Sprout size={80} className="absolute -bottom-3 right-4 text-white/20" />
                <span className="absolute left-3 top-3">
                  <Pill tone="G" className="bg-white text-ac">
                    Your ward
                  </Pill>
                </span>
              </div>
              <div className="p-4">
                <b className="block text-lg">{featured.n}</b>
                <div className="mt-1 text-sm text-mut">
                  {featured.d} · {featured.tm}
                  {featured.loc && (
                    <span className="block">
                      <MapPin size={13} className="mr-1 inline" />
                      {featured.loc}
                    </span>
                  )}
                </div>
                {featured.ds && <p className="mb-3 mt-2 line-clamp-2 text-sm">{featured.ds}</p>}
                <Button block onClick={() => open(featured)}>
                  {featured.mine ? (
                    <>
                      <CheckCircle2 size={17} /> You&apos;re registered · details
                    </>
                  ) : (
                    "View program details →"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-mut">No upcoming programs in your ward right now.</p>
          )}
          {mineWard.length > 1 && (
            <>
              <SectionTitle>More in your ward</SectionTitle>
              {mineWard.slice(1).map(row)}
            </>
          )}
          {city.length > 0 && (
            <>
              <SectionTitle>Kathmandu-wide programs</SectionTitle>
              {city.slice(0, 8).map(row)}
            </>
          )}
          <SectionTitle>My registrations</SectionTitle>
          {mine.length ? mine.map(row) : <p className="m-0 text-sm text-mut">You haven&apos;t registered for any program yet.</p>}
        </>
      ) : (
        <>
          <SectionTitle>Latest updates</SectionTitle>
          {state.updates.length === 0 && <p className="text-mut">No updates yet.</p>}
          <div className="space-y-2.5">
            {state.updates.map((u) => (
              <div key={u.id} className="flex gap-3 rounded-3xl border border-line bg-surface p-4 shadow-card">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ac-soft text-ac">
                  {u.c === "Awareness" ? <Megaphone size={20} /> : <Newspaper size={20} />}
                </span>
                <div className="min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-wide text-mut">
                    {u.c} · {u.w ?? "Kathmandu"}
                  </span>
                  <b className="block">{u.t}</b>
                  {u.b && <p className="mb-1 mt-1 text-sm text-ink/80">{u.b}</p>}
                  <span className="text-xs text-mut">{u.d}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

export function CitizenCommunity() {
  return (
    <Suspense>
      <CommunityInner />
    </Suspense>
  );
}
