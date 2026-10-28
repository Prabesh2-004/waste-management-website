"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Camera as CameraIcon, ImageUp, RefreshCw, SwitchCamera } from "lucide-react";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/Bars";
import { Label, Select } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { Row } from "@/components/ui/Row";
import { StatStrip } from "@/components/ui/StatStrip";
import { Dot } from "@/components/ui/Status";
import { Tabs } from "@/components/ui/Tabs";
import { useUi } from "@/context/UiContext";
import { errorMessage } from "@/lib/api";
import { grabFrame, shrinkImage, useCamera } from "@/lib/camera";
import { cn } from "@/lib/cn";
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
const PHOTO = "Camera";
const LIVE = "Live video";
const UPLOAD = "Upload";
/** Minimum time between live frames sent to the classifier. */
const LIVE_INTERVAL_MS = 700;
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

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const icon = "mr-1.5 inline align-[-3px]";

/** Label over the camera view, e.g. "● Biodegradable · 94%". */
function ResultChip({ result }: { result: Identification }) {
  const category = CATEGORY[result.category];
  return (
    <span className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1.5 text-sm font-semibold text-white">
      <Dot tone={category.tone} />
      {category.name} · {pct(result.confidence)}
    </span>
  );
}

function ResultView({ result, live }: { result: Identification | null; live: boolean }) {
  if (!result) {
    return (
      <p className="text-mut">
        {live
          ? "Point the camera at one item. The result updates about once a second."
          : "Take a photo or upload one. The model sorts it into biodegradable or non-biodegradable waste."}
      </p>
    );
  }
  const category = CATEGORY[result.category];
  return (
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
        <p className="text-[13px] text-mut">Low confidence: move closer, use good light and keep one item in view.</p>
      )}
    </>
  );
}

export function IdentifyWaste({ call, subtitle, ward, wardCount }: IdentifyWasteProps) {
  const { toast } = useUi();
  const [mode, setMode] = useState(PHOTO);
  const [shot, setShot] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Identification | null>(null);
  const [live, setLive] = useState<{ result: Identification; ms: number } | null>(null);
  const [history, setHistory] = useState<IdentificationList | null>(null);
  const [wardChoice, setWardChoice] = useState(ALL_WARDS);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const phoneCameraInput = useRef<HTMLInputElement>(null);
  const selectedWard = ward ?? (wardChoice === ALL_WARDS ? undefined : parseWard(wardChoice));
  const cam = useCamera(mode !== UPLOAD);
  const camReady = cam.status === "live";

  const loadHistory = useCallback(() => {
    const q = selectedWard ? `?ward=${selectedWard}` : "";
    call<IdentificationList>(`/api/v1/identifications${q}`)
      .then(setHistory)
      .catch((e) => toast(errorMessage(e)));
  }, [call, selectedWard, toast]);

  useEffect(loadHistory, [loadHistory]);

  // Free the previous photo's object URL.
  useEffect(() => () => void (shot && URL.revokeObjectURL(shot)), [shot]);

  const classify = useCallback(
    (image: Blob, name: string, save: boolean) => {
      const form = new FormData();
      form.append("image", image, name);
      if (selectedWard) form.append("ward", String(selectedWard));
      if (!save) form.append("save", "false");
      return call<Identification>("/api/v1/identify", { method: "POST", form });
    },
    [call, selectedWard]
  );

  /** Show the photo and classify it right away: one tap from camera to result. */
  const identify = async (image: Blob, name: string) => {
    setShot(URL.createObjectURL(image));
    setResult(null);
    setBusy(true);
    try {
      setResult(await classify(image, name, true));
      loadHistory();
    } catch (e) {
      toast(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const takePhoto = async () => {
    const video = cam.videoRef.current;
    if (!video || !camReady || busy) return;
    identify(await grabFrame(video), `camera-${Date.now()}.jpg`);
  };

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) return toast("Choose an image file");
    identify(await shrinkImage(file), file.name);
  };

  const onFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    pickFile(e.target.files?.[0]);
    e.target.value = ""; // so choosing the same file again still fires
  };

  const retake = () => {
    setShot(null);
    setResult(null);
  };

  const switchMode = (m: string) => {
    setMode(m);
    setLive(null);
    retake();
  };

  // Live video: classify a frame, show it, wait, repeat. One request at a time,
  // and frames are not saved (save=false) so history only holds what staff keep.
  useEffect(() => {
    if (mode !== LIVE || !camReady) return;
    let stopped = false;
    (async () => {
      while (!stopped) {
        const started = performance.now();
        const video = cam.videoRef.current;
        if (video?.videoWidth && !document.hidden) {
          try {
            const r = await classify(await grabFrame(video, 512), "live-frame.jpg", false);
            if (!stopped) setLive({ result: r, ms: Math.round(performance.now() - started) });
          } catch (e) {
            if (!stopped) toast(errorMessage(e));
            await wait(2000);
          }
        }
        await wait(Math.max(0, LIVE_INTERVAL_MS - (performance.now() - started)));
      }
    })();
    return () => {
      stopped = true;
    };
  }, [mode, camReady, cam.videoRef, classify, toast]);

  const saveLive = async () => {
    const video = cam.videoRef.current;
    if (!video || !camReady) return;
    setBusy(true);
    try {
      const r = await classify(await grabFrame(video), `live-${Date.now()}.jpg`, true);
      setResult(r);
      loadHistory();
      toast(`Saved: ${CATEGORY[r.category].name} (${pct(r.confidence)})`);
    } catch (e) {
      toast(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  // Space or Enter takes the photo on a laptop.
  useEffect(() => {
    if (mode !== PHOTO || shot) return;
    const onKey = (e: KeyboardEvent) => {
      const focused = e.target instanceof HTMLElement && e.target.closest("input, textarea, select, button, a");
      if (!focused && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        takePhoto();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const s = history?.summary;
  const showShot = shot !== null && mode === PHOTO;
  const shown = mode === LIVE ? (live?.result ?? null) : result;

  /** Native camera app / file picker. `onDark`: drawn over the black camera area or a photo. */
  const fileButtons = (onDark: boolean) => (
    <div className="flex flex-wrap justify-center gap-2">
      <Button onClick={() => phoneCameraInput.current?.click()}>
        <CameraIcon size={16} className={icon} />
        Open phone camera
      </Button>
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        className={cn("rounded-lg border px-3.5 py-2", onDark ? "border-white/70 bg-black/40 text-white" : "border-line bg-surface text-ink")}
      >
        <ImageUp size={16} className={icon} />
        Choose image
      </button>
    </div>
  );

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
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={onFileInput} />
      <input ref={phoneCameraInput} type="file" accept="image/*" capture="environment" hidden onChange={onFileInput} />
      <div className="grid gap-[18px] lg:grid-cols-2">
        <Box>
          <Tabs items={[PHOTO, LIVE, UPLOAD]} active={mode} onChange={switchMode} />
          {wardCount && (
            <div className="mb-3">
              <Label className="mt-0">Ward</Label>
              <Select options={[ALL_WARDS, ...wardOptions(wardCount)]} value={wardChoice} onChange={setWardChoice} />
            </div>
          )}

          {mode === UPLOAD ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pickFile(e.dataTransfer.files[0]);
              }}
              className={cn(
                "relative flex aspect-[4/3] flex-col items-center justify-center gap-3 overflow-hidden rounded-lg border-2 border-dashed p-4 text-center",
                dragging ? "border-ac bg-ac-soft" : "border-line bg-ac-wash"
              )}
            >
              {shot ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shot} alt="Selected waste" className="absolute inset-0 h-full w-full bg-black object-contain" />
                  {result && <ResultChip result={result} />}
                  <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/60 to-transparent pb-4 pt-8">
                    {fileButtons(true)}
                  </div>
                </>
              ) : (
                <>
                  <ImageUp size={36} className="text-mut" />
                  <span className="text-mut">Drop a photo here, or</span>
                  {fileButtons(false)}
                </>
              )}
              {busy && <span className="absolute inset-x-0 top-0 bg-black/65 py-2 text-white">Identifying…</span>}
            </div>
          ) : (
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-black text-white sm:aspect-[4/3]">
              <video
                ref={cam.videoRef}
                autoPlay
                muted
                playsInline
                aria-label="Camera preview"
                className={cn("h-full w-full object-cover", cam.facing === "user" && "-scale-x-100", showShot && "invisible")}
              />
              {showShot && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shot} alt="Captured waste" className="absolute inset-0 h-full w-full object-contain" />
              )}

              {cam.status === "starting" && <p className="absolute inset-0 m-0 grid place-items-center">Starting camera…</p>}
              {cam.status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <p className="m-0 max-w-sm text-[14px]">{cam.error}</p>
                  {fileButtons(true)}
                </div>
              )}

              {mode === LIVE && camReady && (
                <>
                  {live ? <ResultChip result={live.result} /> : <span className="absolute left-3 top-3 text-sm">Analysing…</span>}
                  <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-bad px-2.5 py-1 text-xs font-bold">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    LIVE
                  </span>
                </>
              )}
              {showShot && result && <ResultChip result={result} />}
              {busy && <span className="absolute inset-x-0 top-0 bg-black/65 py-2 text-center">Identifying…</span>}

              {camReady && (
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-8 bg-gradient-to-t from-black/60 to-transparent pb-4 pt-8">
                  <span className="w-11" />
                  {mode === PHOTO && !shot && (
                    <button
                      type="button"
                      aria-label="Take photo"
                      title="Take photo (Space)"
                      onClick={takePhoto}
                      className="grid h-[68px] w-[68px] place-items-center rounded-full border-4 border-white active:scale-95"
                    >
                      <span className="h-[52px] w-[52px] rounded-full bg-white" />
                    </button>
                  )}
                  {mode === PHOTO && shot && (
                    <button type="button" onClick={retake} disabled={busy} className="rounded-lg bg-white px-3.5 py-2 text-black">
                      <RefreshCw size={16} className={icon} />
                      Retake
                    </button>
                  )}
                  {mode === LIVE && (
                    <Button onClick={saveLive} disabled={busy || !live}>
                      Save this result
                    </Button>
                  )}
                  {cam.canSwitch ? (
                    <button
                      type="button"
                      aria-label="Switch camera"
                      onClick={cam.switchCamera}
                      className="grid h-11 w-11 place-items-center rounded-full bg-black/50"
                    >
                      <SwitchCamera size={20} />
                    </button>
                  ) : (
                    <span className="w-11" />
                  )}
                </div>
              )}
            </div>
          )}
          <p className="mb-0 text-[13px] text-mut">
            {mode === PHOTO &&
              (shot ? "Press Retake to identify another item." : "Tap the shutter (or press Space) to take a photo. It is identified straight away.")}
            {mode === LIVE &&
              (live
                ? `Updating live · ${live.ms} ms per frame · frames are only saved when you press “Save this result”.`
                : "Hold one item in front of the camera.")}
            {mode === UPLOAD && "JPEG, PNG, WebP or HEIC. Large photos are shrunk before upload."}
          </p>
        </Box>
        <Box>
          <h3>
            Result
            {mode === LIVE && live && <span className="ml-2 text-[13px] font-normal text-bad">● live</span>}
          </h3>
          <ResultView result={shown} live={mode === LIVE} />
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
