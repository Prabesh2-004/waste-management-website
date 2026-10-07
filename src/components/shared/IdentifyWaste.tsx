"use client";

import { useCallback, useEffect, useState } from "react";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/Bars";
import { Label, Select } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { Row } from "@/components/ui/Row";
import { StatStrip } from "@/components/ui/StatStrip";
import { Dot } from "@/components/ui/Status";
import { useUi } from "@/context/UiContext";
import { errorMessage } from "@/lib/api";
import { parseWard, wardLabel, wardOptions } from "@/lib/format";
import type { Identification, IdentificationList } from "@/types/identify";

type Call = <T = unknown>(path: string, opts?: { method?: string; form?: FormData }) => Promise<T>;

interface IdentifyWasteProps {
  call: Call;
  subtitle: string;
  /** Fixed ward (ward portal). */
  ward?: number;
  /** Number of wards to choose from (KMC portal). */
  wardCount?: number;
}

const ALL_WARDS = "All wards";
const CATEGORY = {
  degradable: { name: "Biodegradable", bin: "Green bin: kitchen and garden waste, compostable.", tone: "G" as const },
  non_degradable: { name: "Non-biodegradable", bin: "Blue bin: dry waste and recyclables (plastic, metal, glass).", tone: "B" as const },
};

function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function IdentifyWaste({ call, subtitle, ward, wardCount }: IdentifyWasteProps) {
  const { toast } = useUi();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Identification | null>(null);
  const [history, setHistory] = useState<IdentificationList | null>(null);
  const [wardChoice, setWardChoice] = useState(ALL_WARDS);
  const selectedWard = ward ?? (wardChoice === ALL_WARDS ? undefined : parseWard(wardChoice));

  const loadHistory = useCallback(() => {
    const q = selectedWard ? `?ward=${selectedWard}` : "";
    call<IdentificationList>(`/api/v1/identifications${q}`)
      .then(setHistory)
      .catch((e) => toast(errorMessage(e)));
  }, [call, selectedWard, toast]);

  useEffect(loadHistory, [loadHistory]);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const identify = async () => {
    if (!file) return toast("Choose or take a photo first");
    const form = new FormData();
    form.append("image", file);
    if (selectedWard) form.append("ward", String(selectedWard));
    setBusy(true);
    try {
      setResult(await call<Identification>("/api/v1/identify", { method: "POST", form }));
      loadHistory();
    } catch (e) {
      toast(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const s = history?.summary;
  const category = result ? CATEGORY[result.category] : null;

  return (
    <>
      <PageHeader title="Identify Waste" subtitle={subtitle} />
      <StatStrip
        items={[
          { label: "Photos identified", value: String(s?.total ?? 0) },
          { label: "Biodegradable", value: String(s?.degradable ?? 0) },
          { label: "Non-biodegradable", value: String(s?.non_degradable ?? 0) },
          { label: "Biodegradable share", value: s?.total ? pct(s.degradable / s.total) : "–" },
        ]}
      />
      <div className="grid gap-[18px] lg:grid-cols-2">
        <Box>
          <h3>Photo</h3>
          {wardCount && (
            <>
              <Label>Ward</Label>
              <Select options={[ALL_WARDS, ...wardOptions(wardCount)]} value={wardChoice} onChange={setWardChoice} />
            </>
          )}
          <Label htmlFor="identify-photo">Take a photo or choose an image</Label>
          <input
            id="identify-photo"
            type="file"
            accept="image/*"
            capture="environment"
            className="w-full text-[13px]"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setResult(null);
            }}
          />
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Selected waste" className="mt-3 max-h-64 w-full rounded-lg border border-line object-contain" />
          )}
          <p>
            <Button onClick={identify} disabled={busy || !file}>
              {busy ? "Identifying…" : "Identify"}
            </Button>
          </p>
        </Box>
        <Box>
          <h3>Result</h3>
          {!result || !category ? (
            <p className="text-mut">The model sorts a photo into biodegradable or non-biodegradable waste.</p>
          ) : (
            <>
              <p className="text-xl">
                <Dot tone={category.tone} />
                <b>{category.name}</b> <span className="text-mut">· {pct(result.confidence)} confident</span>
              </p>
              <p className="text-[13px]">{category.bin}</p>
              {(["Bio", "Non_Bio"] as const).map((k) => (
                <div key={k} className="mt-2.5 text-[13px] text-mut">
                  {k === "Bio" ? "Biodegradable" : "Non-biodegradable"} · {pct(result.probabilities[k] ?? 0)}
                  <ProgressBar className="mt-1" percent={(result.probabilities[k] ?? 0) * 100} />
                </div>
              ))}
              {result.confidence < 0.7 && (
                <p className="text-[13px] text-mut">Low confidence: retake the photo closer, in good light, with one item in view.</p>
              )}
            </>
          )}
        </Box>
      </div>
      <Box className="mt-[18px]">
        <h3>Recent identifications</h3>
        {history?.items.length ? (
          history.items.map((i) => (
            <Row key={i.id}>
              <span>
                <Dot tone={CATEGORY[i.category].tone} />
                {CATEGORY[i.category].name} <span className="text-mut">· {pct(i.confidence)}</span>
              </span>
              <span className="text-[13px] text-mut">
                {ward ? "" : i.ward ? `${wardLabel(i.ward)} · ` : ""}
                {timeOf(i.created_at)}
              </span>
            </Row>
          ))
        ) : (
          <p className="text-mut">No photos identified yet.</p>
        )}
      </Box>
    </>
  );
}
