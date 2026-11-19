"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, Ban, Camera, CheckCircle2, ChevronRight, CircleDot, ClipboardCheck, Clock, Copy, FileText, HelpCircle, LocateFixed,
  MapPin, Recycle, Send, Trash2, Truck, X,
} from "lucide-react";
import { TapCard } from "@/components/mobile/MobileShell";
import { Button } from "@/components/kit/Button";
import { Input, Label, Select, Textarea } from "@/components/kit/Field";
import { Pill } from "@/components/kit/Status";
import { Chips, Segmented } from "@/components/kit/Tabs";
import { useCitizen } from "@/context/CitizenContext";
import { useUi } from "@/context/UiContext";
import { apiUrl, errorMessage } from "@/lib/api";
import { shrinkImage } from "@/lib/camera";
import { cn } from "@/lib/cn";
import { distanceKm } from "@/lib/eta";
import { useGeolocation } from "@/lib/useGeolocation";
import type { CitizenReport } from "@/types/citizen";

const ISSUES = [
  { type: "Missed waste collection", category: "Collection", hint: "Waste not collected on the scheduled day", icon: Truck },
  { type: "Overflowing waste or litter", category: "Waste", hint: "Bins full or waste on the street", icon: Trash2 },
  { type: "Illegal dumping", category: "Dumping", hint: "Waste dumped where it should not be", icon: Ban },
  { type: "Mixed or wrongly sorted waste", category: "Waste", hint: "Wrong waste types mixed together", icon: Recycle },
  { type: "Blocked collection point", category: "Collection", hint: "The truck cannot reach the location", icon: MapPin },
  { type: "Collection time or route problem", category: "Schedule", hint: "Wrong time, route or schedule", icon: Clock },
  { type: "Other waste issue", category: "Other", hint: "Something not listed above", icon: HelpCircle },
];

const STATUS_TONE: Record<string, "A" | "B" | "G"> = { Pending: "A", "In Progress": "B", Resolved: "G" };
const STATUS_LABEL: Record<string, string> = { Pending: "Under review", "In Progress": "In progress", Resolved: "Resolved" };
const NO_ROUTE = "Not sure / no route";

function when(iso: string | null, fallback: string): string {
  if (!iso) return fallback;
  return new Date(iso).toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function Steps({ step }: { step: number }) {
  return (
    <div className="mb-5 flex items-center gap-2">
      {["Category", "Details", "Review"].map((s, i) => (
        <div key={s} className="flex flex-1 items-center gap-1.5">
          <span
            className={cn(
              "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
              i < step ? "bg-ok text-white" : i === step ? "bg-ac text-white" : "bg-line text-mut"
            )}
          >
            {i < step ? "✓" : i + 1}
          </span>
          <span className={cn("truncate text-[13px]", i === step ? "font-semibold text-ac" : "text-mut")}>{s}</span>
        </div>
      ))}
    </div>
  );
}

function Wizard({ onDone, onCancel }: { onDone: (r: CitizenReport) => void; onCancel: () => void }) {
  const { state, submitReport } = useCitizen();
  const { toast } = useUi();
  const [step, setStep] = useState(0);
  const [issue, setIssue] = useState<(typeof ISSUES)[number] | null>(null);
  const routes = state?.live.routes ?? [];
  const routeOptions = [NO_ROUTE, ...routes.map((r) => `Route ${r.n} – ${r.area}`)];
  const [route, setRoute] = useState(NO_ROUTE);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<{ blob: Blob; url: string; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [locate, setLocate] = useState(false);
  const gps = useGeolocation(locate);
  const file = useRef<HTMLInputElement>(null);

  // "Use my location": fill in the nearest collection stop and its route.
  useEffect(() => {
    // Wait for a precise fix: the first one is usually a rough Wi-Fi/cell estimate.
    if (!locate || !gps.fix || !gps.settled) return;
    const near = routes.flatMap((r) => r.stops.map((s) => ({ r, s, km: distanceKm(gps.fix!, s) }))).sort((a, b) => a.km - b.km)[0];
    if (near && near.km < 3) {
      setLocation(`Near ${near.s.name}`);
      setRoute(`Route ${near.r.n} – ${near.r.area}`);
    } else {
      setLocation(`GPS ${gps.fix.lat.toFixed(5)}, ${gps.fix.lng.toFixed(5)}`);
    }
    setLocate(false);
  }, [locate, gps.fix, gps.settled, routes]);

  useEffect(() => () => void (photo && URL.revokeObjectURL(photo.url)), [photo]);

  const pickPhoto = async (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast("Choose a photo");
    const blob = await shrinkImage(f);
    setPhoto({ blob, url: URL.createObjectURL(blob), name: f.name.replace(/\.\w+$/, ".jpg") });
  };

  const submit = async () => {
    if (!issue) return;
    setBusy(true);
    const form = new FormData();
    form.append("type", issue.type);
    form.append("category", issue.category);
    form.append("description", description.trim());
    form.append("location", location.trim());
    const r = routes.find((x) => route.startsWith(`Route ${x.n} `));
    if (r) form.append("route", String(r.n));
    if (photo) form.append("photo", photo.blob, photo.name);
    try {
      onDone(await submitReport(form));
    } catch (e) {
      toast(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <div>
      <button type="button" onClick={step === 0 ? onCancel : () => setStep(step - 1)} className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ac">
        <ArrowLeft size={17} /> {step === 0 ? "Back to reports" : "Back"}
      </button>
      <h2 className="mb-1 text-xl">Report an issue</h2>
      <p className="mb-4 mt-0 text-sm text-mut">Your report goes to the Ward {state?.ward.n} office.</p>
      <Steps step={step} />

      {step === 0 && (
        <div role="radiogroup" aria-label="Issue type" className="space-y-2.5">
          {ISSUES.map((it) => {
            const Icon = it.icon;
            const on = issue?.type === it.type;
            return (
              <button
                key={it.type}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setIssue(it)}
                className={cn("flex w-full items-center gap-3 rounded-2xl border bg-surface p-3.5 text-left", on ? "border-ac bg-ac-soft" : "border-line")}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ac-soft text-ac">
                  <Icon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block text-sm">{it.type}</b>
                  <span className="text-xs text-mut">{it.hint}</span>
                </span>
                <span className={cn("h-5 w-5 rounded-full border-2", on ? "border-[6px] border-ac" : "border-line")} />
              </button>
            );
          })}
          <Button block size="lg" className="mt-3" disabled={!issue} onClick={() => setStep(1)}>
            Next
          </Button>
        </div>
      )}

      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!description.trim()) return toast("Describe what happened");
            setStep(2);
          }}
        >
          <Label htmlFor="route">Route</Label>
          <Select id="route" options={routeOptions} value={route} onChange={setRoute} />
          <Label htmlFor="loc">Specific location</Label>
          <div className="flex gap-2">
            <Input id="loc" placeholder="e.g. near Buddhanagar chowk" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Button variant="soft" aria-label="Use my location" onClick={() => (gps.error ? gps.retry() : setLocate(true))} disabled={locate}>
              <LocateFixed size={18} />
            </Button>
          </div>
          {locate && <p className="mb-0 mt-1 text-xs text-mut">Finding your location…</p>}
          {gps.error && locate && <p className="mb-0 mt-1 text-xs text-bad">{gps.error}</p>}
          <Label htmlFor="desc">Describe the issue *</Label>
          <Textarea id="desc" rows={4} maxLength={2000} placeholder="Tell us what happened and when…" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="text-right text-xs text-mut">{description.length}/2000</div>
          <Label>Photo (optional)</Label>
          <input ref={file} type="file" accept="image/*" capture="environment" hidden onChange={(e) => pickPhoto(e.target.files?.[0])} />
          {photo ? (
            <div className="relative w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="Your photo" className="h-32 rounded-2xl object-cover" />
              <button type="button" aria-label="Remove photo" onClick={() => setPhoto(null)} className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-ink text-canvas">
                <X size={15} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => file.current?.click()} className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-line bg-ac-wash p-4 text-left">
              <Camera size={22} className="text-ac" />
              <span>
                <b className="block text-sm">Add a photo</b>
                <span className="text-xs text-mut">Take one or choose from the gallery</span>
              </span>
            </button>
          )}
          <Button type="submit" block size="lg" className="mt-5">
            Next
          </Button>
        </form>
      )}

      {step === 2 && issue && (
        <>
          <div className="rounded-3xl border border-line bg-surface p-4 shadow-card">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-ac-soft text-ac">
                <issue.icon size={20} />
              </span>
              <b>{issue.type}</b>
            </div>
            <dl className="m-0 grid grid-cols-[96px_1fr] gap-y-2 text-sm">
              <dt className="text-mut">Ward</dt>
              <dd className="m-0">Ward {state?.ward.n}</dd>
              <dt className="text-mut">Route</dt>
              <dd className="m-0">{route}</dd>
              <dt className="text-mut">Location</dt>
              <dd className="m-0">{location || "–"}</dd>
              <dt className="text-mut">Description</dt>
              <dd className="m-0 whitespace-pre-wrap">{description}</dd>
              {photo && (
                <>
                  <dt className="text-mut">Photo</dt>
                  <dd className="m-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="Your photo" className="h-20 rounded-xl object-cover" />
                  </dd>
                </>
              )}
            </dl>
          </div>
          <div className="mt-3 flex gap-3 rounded-2xl bg-ac-soft p-3.5 text-sm">
            <Send size={18} className="mt-0.5 shrink-0 text-ac" />
            Your report goes to the ward office. You will get a reference number and updates as it progresses.
          </div>
          <Button block size="lg" className="mt-5" onClick={submit} disabled={busy}>
            {busy ? "Sending…" : "Submit report"}
          </Button>
        </>
      )}
    </div>
  );
}

function Submitted({ report, onView, onBack }: { report: CitizenReport; onView: () => void; onBack: () => void }) {
  const { toast } = useUi();
  return (
    <div className="pt-4 text-center">
      <span className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-ac-soft text-ac">
        <ClipboardCheck size={46} />
      </span>
      <h2 className="text-2xl text-ac">Report submitted!</h2>
      <p className="mt-0 text-mut">The ward office has received it. We&apos;ll keep you updated.</p>
      <div className="mx-auto my-5 max-w-xs rounded-3xl bg-ac-soft p-4 text-left">
        <span className="text-sm text-mut">Reference number</span>
        <div className="flex items-center justify-between">
          <b className="text-2xl tracking-wide">{report.ref}</b>
          <button
            type="button"
            aria-label="Copy reference number"
            onClick={() =>
              navigator.clipboard?.writeText(report.ref).then(
                () => toast("Reference number copied"),
                () => toast(report.ref)
              )
            }
            className="grid h-9 w-9 place-items-center rounded-xl bg-surface text-ac"
          >
            <Copy size={16} />
          </button>
        </div>
        <span className="text-xs text-mut">Submitted {when(report.at, report.date)}</span>
      </div>
      <Button block size="lg" onClick={onView}>
        View my report
      </Button>
      <Button block variant="outline" className="mt-2.5" onClick={onBack}>
        Back to reports
      </Button>
    </div>
  );
}

function Detail({ report, onBack }: { report: CitizenReport; onBack: () => void }) {
  const steps = ["Pending", "In Progress", "Resolved"];
  const reached = steps.indexOf(report.status);
  return (
    <div>
      <button type="button" onClick={onBack} className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ac">
        <ArrowLeft size={17} /> My reports
      </button>
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-card">
        <div className="flex items-start justify-between gap-2">
          <div>
            <b className="block text-lg">{report.ref}</b>
            <span className="font-semibold">{report.type}</span>
          </div>
          <Pill tone={STATUS_TONE[report.status] ?? "A"}>{STATUS_LABEL[report.status] ?? report.status}</Pill>
        </div>
        <div className="mt-3 space-y-1.5 text-sm text-mut">
          <div className="flex gap-2">
            <MapPin size={16} className="shrink-0" /> Ward {report.ward}
            {report.location ? `, ${report.location}` : ""}
            {report.route ? ` · Route ${report.route}` : ""}
          </div>
          <div className="flex gap-2">
            <Clock size={16} className="shrink-0" /> Submitted {when(report.at, report.date)}
          </div>
        </div>
        <p className="mb-0 whitespace-pre-wrap text-[15px]">{report.description}</p>
        {report.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={apiUrl(report.photo)} alt="Photo evidence" className="mt-3 max-h-60 w-full rounded-2xl object-cover" />
        )}
      </div>

      <h2 className="mt-6 text-[17px]">Status history</h2>
      <ol className="m-0 list-none p-0">
        {steps.map((s, i) => {
          const entry = [...report.history].reverse().find((h) => h.status === s);
          const done = i <= reached;
          return (
            <li key={s} className="relative flex gap-3 pb-5 last:pb-0">
              {i < steps.length - 1 && <span className={cn("absolute left-[13px] top-7 h-[calc(100%-24px)] w-0.5", i < reached ? "bg-ok" : "bg-line")} />}
              <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full", done ? "bg-ok text-white" : "border-2 border-line bg-surface text-mut")}>
                {done ? <CheckCircle2 size={16} /> : <CircleDot size={14} />}
              </span>
              <div>
                <b className={cn("block text-sm", !done && "text-mut")}>{STATUS_LABEL[s]}</b>
                <span className="text-xs text-mut">
                  {entry ? when(entry.at, "") : done ? "" : s === "Resolved" ? "Will update once the issue is fixed" : "Waiting for the ward team"}
                </span>
                {entry?.note && <span className="mt-0.5 block text-[13px]">{entry.note}</span>}
              </div>
            </li>
          );
        })}
      </ol>
      {report.status !== "Resolved" && (
        <div className="mt-5 flex gap-3 rounded-2xl bg-ac-soft p-3.5 text-sm">
          <Truck size={18} className="mt-0.5 shrink-0 text-ac" />
          {report.status === "In Progress" ? "The collection team has been notified and is working on it." : "The ward office will review your report soon."}
        </div>
      )}
    </div>
  );
}

function ReportsInner() {
  const { state } = useCitizen();
  const params = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState(params.get("new") ? "Report an issue" : params.get("id") ? "My reports" : "Report an issue");
  const [filter, setFilter] = useState("All");
  const [wizard, setWizard] = useState(!!params.get("new"));
  const [submitted, setSubmitted] = useState<CitizenReport | null>(null);
  const selectedId = Number(params.get("id")) || null;

  if (!state) return null;
  const select = (id: number | null) => router.replace(id ? `/citizen/reports?id=${id}` : "/citizen/reports", { scroll: true });
  const selected = state.reports.find((r) => r.id === selectedId);

  if (selected) {
    return (
      <Detail
        report={selected}
        onBack={() => {
          setTab("My reports");
          select(null);
        }}
      />
    );
  }
  if (submitted) {
    return (
      <Submitted
        report={submitted}
        onView={() => {
          setSubmitted(null);
          select(submitted.id);
        }}
        onBack={() => {
          setSubmitted(null);
          setTab("My reports");
        }}
      />
    );
  }
  if (wizard) {
    return (
      <Wizard
        onCancel={() => {
          setWizard(false);
          router.replace("/citizen/reports");
        }}
        onDone={(r) => {
          setWizard(false);
          setSubmitted(r);
          router.replace("/citizen/reports");
        }}
      />
    );
  }

  const shown = state.reports.filter((r) => filter === "All" || (filter === "Open" ? r.status !== "Resolved" : r.status === "Resolved"));

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ac-soft text-ac">
          <FileText size={26} />
        </span>
        <div>
          <h1 className="m-0 text-2xl">Reports</h1>
          <span className="text-sm text-mut">Report a waste issue and follow its progress.</span>
        </div>
      </div>
      <Segmented items={["Report an issue", "My reports"]} active={tab} onChange={setTab} />
      {tab === "Report an issue" ? (
        <>
          <div className="relative overflow-hidden rounded-3xl bg-ac-soft p-5">
            <Truck size={72} className="absolute -right-2 bottom-1 text-ac/20" />
            <b className="block text-lg text-ac">See something wrong in your area?</b>
            <p className="mb-4 mt-1 max-w-[75%] text-sm">Report it and help us keep Ward {state.ward.n} clean.</p>
            <Button block size="lg" onClick={() => setWizard(true)}>
              Report an issue
            </Button>
          </div>
          <div className="mb-2.5 mt-6 flex items-center justify-between">
            <h2 className="m-0 text-[17px]">Recent reports</h2>
            <button type="button" onClick={() => setTab("My reports")} className="text-sm font-semibold text-ac">
              View all
            </button>
          </div>
          {state.reports.length === 0 && <p className="text-sm text-mut">You haven&apos;t sent any reports yet.</p>}
          <div className="space-y-2.5">
            {state.reports.slice(0, 3).map((r) => (
              <ReportRow key={r.id} r={r} onOpen={() => select(r.id)} />
            ))}
          </div>
        </>
      ) : (
        <>
          <Chips items={["All", "Open", "Resolved"]} active={filter} onChange={setFilter} />
          {shown.length === 0 && <p className="text-sm text-mut">No reports here.</p>}
          <div className="space-y-2.5">
            {shown.map((r) => (
              <ReportRow key={r.id} r={r} onOpen={() => select(r.id)} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function ReportRow({ r, onOpen }: { r: CitizenReport; onOpen: () => void }) {
  return (
    <TapCard
      onClick={onOpen}
      icon={<FileText size={20} />}
      tone={r.status === "Resolved" ? "" : r.status === "Pending" ? "warn" : ""}
      title={r.type}
      subtitle={
        <>
          {r.ref} · {r.date}
          {r.location ? ` · ${r.location}` : ""}
          <span className="mt-1 block">
            <Pill tone={STATUS_TONE[r.status] ?? "A"}>{STATUS_LABEL[r.status] ?? r.status}</Pill>
          </span>
        </>
      }
      right={<ChevronRight size={18} className="text-mut" />}
    />
  );
}

export function CitizenReports() {
  return (
    <Suspense>
      <ReportsInner />
    </Suspense>
  );
}
