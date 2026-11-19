"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClipboardList, MapPin, Plus, Scale, Wrench } from "lucide-react";
import { TapCard } from "@/components/mobile/MobileShell";
import { Button } from "@/components/kit/Button";
import { Label, Select, Textarea } from "@/components/kit/Field";
import { Pill } from "@/components/kit/Status";
import { Segmented } from "@/components/kit/Tabs";
import { useDriver } from "@/context/DriverContext";
import { useUi } from "@/context/UiContext";
import { errorMessage } from "@/lib/api";

const ISSUE_TYPES = ["Engine problem", "Brake problem", "Tyre puncture", "Hydraulic / compactor fault", "Electrical fault", "Accident", "Road blocked", "Other"];
const STATUS_TONE: Record<string, "A" | "B" | "G"> = { Pending: "A", "In Progress": "B", Resolved: "G" };

function IssueSheet() {
  const { state, reportIssue, current } = useDriver();
  const { closeOverlay, toast } = useUi();
  const vehicles = state?.vehicles.map((v) => v.id) ?? [];
  const [vehicle, setVehicle] = useState(current?.vehicle ?? vehicles[0] ?? "");
  const [type, setType] = useState(ISSUE_TYPES[0]);
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await reportIssue(type, description.trim(), vehicle);
      closeOverlay();
    } catch (e) {
      toast(errorMessage(e));
      setBusy(false);
    }
  };
  return (
    <>
      <h2>Report a vehicle issue</h2>
      {vehicles.length > 1 && (
        <>
          <Label htmlFor="iv" className="mt-0">
            Vehicle
          </Label>
          <Select id="iv" options={vehicles} value={vehicle} onChange={setVehicle} />
        </>
      )}
      <Label htmlFor="it">What is wrong?</Label>
      <Select id="it" options={ISSUE_TYPES} value={type} onChange={setType} />
      <Label htmlFor="id">Details</Label>
      <Textarea id="id" rows={3} placeholder="Where are you, is the truck safe to drive?" value={description} onChange={(e) => setDescription(e.target.value)} />
      <p className="mb-0 mt-2 text-xs text-mut">If the truck is unsafe to drive, stop and call your supervisor too.</p>
      <Button block size="lg" className="mt-4" onClick={submit} disabled={busy || !vehicle}>
        {busy ? "Sending…" : "Send report"}
      </Button>
      <Button block variant="link" className="mt-2" onClick={closeOverlay}>
        Cancel
      </Button>
    </>
  );
}

function RecordsInner() {
  const { state } = useDriver();
  const { openDrawer } = useUi();
  const params = useSearchParams();
  const [tab, setTab] = useState(params.get("issue") ? "Maintenance" : "Collection");
  const wantsIssue = !!params.get("issue");
  useEffect(() => {
    if (wantsIssue) openDrawer(<IssueSheet />);
  }, [wantsIssue, openDrawer]);
  if (!state) return null;
  const trips = state.routes.filter((r) => r.status === "Completed");
  const total = trips.reduce((a, r) => a + r.kg, 0);

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ac-soft text-ac">
          <ClipboardList size={26} />
        </span>
        <div>
          <h1 className="m-0 text-2xl">Records</h1>
          <span className="text-sm text-mut">Your collection records and vehicle reports.</span>
        </div>
      </div>
      <Segmented items={["Collection", "Maintenance"]} active={tab} onChange={setTab} />
      {tab === "Collection" ? (
        <>
          <div className="flex items-center gap-4 rounded-3xl bg-ac-soft p-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ac text-white">
              <Scale size={24} />
            </span>
            <div className="flex-1">
              <span className="text-sm text-mut">Total collected</span>
              <b className="block text-2xl">{total.toLocaleString()} kg</b>
            </div>
            <div className="text-right">
              <span className="text-sm text-mut">Trips</span>
              <b className="block text-xl">
                {trips.length}/{state.routes.length}
              </b>
            </div>
          </div>
          <h2 className="mb-2.5 mt-6 text-[17px]">Completed trips</h2>
          {trips.length === 0 && <p className="text-sm text-mut">No completed trips yet.</p>}
          <div className="space-y-2.5">
            {trips.map((r) => (
              <TapCard
                key={r.id}
                icon={<MapPin size={20} />}
                title={`Route ${r.n} – ${r.area}`}
                subtitle={`Ward ${r.ward} · ${r.vehicle} · ${r.kg} kg${r.completed_at ? ` · ${new Date(r.completed_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : ""}`}
                right={<Pill tone="G">Completed</Pill>}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="rounded-3xl bg-ac-soft p-4">
            <div className="flex gap-3">
              <Wrench size={26} className="shrink-0 text-ac" />
              <div>
                <b className="block">Report a vehicle issue</b>
                <span className="text-sm">Keep your truck safe and get maintenance support quickly.</span>
              </div>
            </div>
            <Button block className="mt-3" onClick={() => openDrawer(<IssueSheet />)}>
              <Plus size={17} /> Report issue
            </Button>
          </div>
          <h2 className="mb-2.5 mt-6 text-[17px]">My reports</h2>
          {state.issues.length === 0 && <p className="text-sm text-mut">No reports yet.</p>}
          <div className="space-y-2.5">
            {state.issues.map((r) => (
              <TapCard
                key={r.id}
                icon={<Wrench size={20} />}
                tone={r.s === "Resolved" ? "" : "warn"}
                title={r.ty}
                subtitle={`${r.ref ?? ""} · ${r.d}${r.ds ? ` · ${r.ds}` : ""}`}
                right={<Pill tone={STATUS_TONE[r.s] ?? "A"}>{r.s === "Pending" ? "Under review" : r.s}</Pill>}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

export function DriverRecords() {
  return (
    <Suspense>
      <RecordsInner />
    </Suspense>
  );
}
