"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Camera as CameraIcon, CheckCircle2, ImageUp, Leaf, Pause, Play, Recycle, RefreshCw, Save, ScanLine, SwitchCamera, Zap,
} from "lucide-react";
import { Box } from "@/components/kit/Box";
import { Button } from "@/components/kit/Button";
import { ProgressBar } from "@/components/kit/Bars";
import { Label, Select } from "@/components/kit/Field";
import { PageHeader } from "@/components/kit/PageHeader";
import { Row } from "@/components/kit/Row";
import { StatStrip } from "@/components/kit/StatStrip";
import { Pill } from "@/components/kit/Status";
import { Segmented } from "@/components/kit/Tabs";
import { useUi } from "@/context/UiContext";
import { errorMessage } from "@/lib/api";
import { grabFrame, shrinkImage, useCamera } from "@/lib/camera";
import { cn } from "@/lib/cn";
import { parseWard, wardLabel, wardOptions } from "@/lib/format";
import type { Identification, IdentificationList } from "@/types/identify";

type Call = <T = unknown>(path: string, opts?: { method?: string; form?: FormData }) => Promise<T>;
type Category = Identification["category"];

interface IdentifyWasteProps {
  call: Call;
  subtitle: string;
  /** Fixed ward (ward portal). */
  ward?: number;
  /** Number of wards to choose from (KMC portal). */
  wardCount?: number;
  /** Phone layout for the citizen section: no page header, stats or ward picker. */
  compact?: boolean;
  /** Inside a portal whose own header already shows the page title. */
  embedded?: boolean;
}

const ALL_WARDS = "All wards";
const LIVE = "Live scan";
const PHOTO = "Photo";
const UPLOAD = "Upload";
/** Target time between live frames; one request is in flight at a time. */
const LIVE_INTERVAL_MS = 320;
/** Live frames are small: the model looks at 224 px. */
const LIVE_FRAME_PX = 384;
/** Below this smoothed confidence the live view says "Checking…" instead of a verdict. */
const SURE = 0.6;

export const CATEGORY: Record<Category, { name: string; short: string; bin: string; tone: "G" | "B"; steps: string[]; tips: string[] }> = {
  degradable: {
    name: "Biodegradable",
    short: "Degradable",
    bin: "Green bin · organic waste",
    tone: "G",
    steps: ["Drain any liquid.", "Put it in the green (organic) bin, or compost it at home.", "Keep plastic bags out of organic waste."],
    tips: ["Food scraps, peels, leaves and flowers break down in weeks.", "Wrap wet waste in newspaper, not plastic."],
  },
  non_degradable: {
    name: "Non-biodegradable",
    short: "Non-degradable",
    bin: "Blue bin · dry waste and recyclables",
    tone: "B",
    steps: ["Empty and rinse it.", "Keep it dry and separate plastic, metal, glass and paper.", "Put it in the blue (dry) bin."],
    tips: ["Batteries and e-waste go to the ward office, not the bin.", "Crush bottles and cans to save space."],
  },
};

function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function bioProbability(r: Identification): number {
  const p = r.probabilities.Bio;
  if (typeof p === "number") return p;
  return r.category === "degradable" ? r.confidence : 1 - r.confidence;
}

interface LiveReading {
  category: Category;
  confidence: number;
  sure: boolean;
  ms: number;
  fps: number;
  raw: Identification;
}

function CategoryIcon({ category, size = 22 }: { category: Category; size?: number }) {
  return category === "degradable" ? <Leaf size={size} /> : <Recycle size={size} />;
}

/** The verdict card drawn over the camera image. */
function LiveVerdict({ reading }: { reading: LiveReading | null }) {
  if (!reading || !reading.sure) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-black/55 px-4 py-3 text-white backdrop-blur-md">
        <ScanLine size={22} className="animate-pulse" />
        <div>
          <b className="block">{reading ? "Checking…" : "Scanning…"}</b>
          <span className="text-xs text-white/80">Hold one item steady in the frame</span>
        </div>
      </div>
    );
  }
  const c = CATEGORY[reading.category];
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3 text-white shadow-lg backdrop-blur-md transition-colors",
        reading.category === "degradable" ? "bg-[#15824ce6]" : "bg-[#2563ebe6]"
      )}
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20">
          <CategoryIcon category={reading.category} size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <b className="block text-lg leading-tight">{c.name}</b>
          <span className="text-xs text-white/90">{c.bin}</span>
        </div>
        <b className="text-2xl tabular-nums">{pct(reading.confidence)}</b>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/25">
        <i className="block h-full rounded-full bg-white transition-[width] duration-300" style={{ width: pct(reading.confidence) }} />
      </div>
    </div>
  );
}

/** Corner brackets and a moving line, so it is obvious the camera is scanning. */
function ScanFrame({ active }: { active: boolean }) {
  const corner = "absolute h-9 w-9 border-white/90";
  return (
    <div className="pointer-events-none absolute inset-[9%_12%_30%]">
      <span className={cn(corner, "left-0 top-0 rounded-tl-2xl border-l-4 border-t-4")} />
      <span className={cn(corner, "right-0 top-0 rounded-tr-2xl border-r-4 border-t-4")} />
      <span className={cn(corner, "bottom-0 left-0 rounded-bl-2xl border-b-4 border-l-4")} />
      <span className={cn(corner, "bottom-0 right-0 rounded-br-2xl border-b-4 border-r-4")} />
      {active && <span className="scan-line absolute inset-x-2 h-0.5 rounded-full bg-white/80 shadow-[0_0_12px_white]" />}
    </div>
  );
}

function ResultDetails({ result }: { result: Identification }) {
  const c = CATEGORY[result.category];
  return (
    <>
      <div className="flex items-center gap-3">
        <span className={cn("grid h-12 w-12 place-items-center rounded-2xl", c.tone === "G" ? "bg-ok-soft text-ok" : "bg-info-soft text-info")}>
          <CategoryIcon category={result.category} size={26} />
        </span>
        <div>
          <b className="block text-xl">{c.name}</b>
          <Pill tone={c.tone}>{pct(result.confidence)} confident</Pill>
        </div>
      </div>
      {(["Bio", "Non_Bio"] as const).map((k) => (
        <div key={k} className="mt-3 text-[13px] text-mut">
          <div className="flex justify-between">
            <span>{k === "Bio" ? "Biodegradable" : "Non-biodegradable"}</span>
            <b className="text-ink">{pct(result.probabilities[k] ?? 0)}</b>
          </div>
          <ProgressBar className="mt-1" percent={(result.probabilities[k] ?? 0) * 100} barClassName={k === "Bio" ? "bg-ok" : "bg-info"} />
        </div>
      ))}
      <div className="mt-4 rounded-2xl bg-ac-wash p-3.5">
        <b className="mb-1.5 block text-sm">How to dispose</b>
        <ol className="m-0 list-none space-y-1.5 p-0 text-sm">
          {c.steps.map((s, i) => (
            <li key={s} className="flex gap-2">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ac text-[11px] font-bold text-white">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <ul className="mb-0 mt-2.5 space-y-1 pl-4 text-[13px] text-mut">
          {c.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      {result.confidence < 0.7 && (
        <p className="mb-0 text-[13px] text-mut">Not sure? Move closer, use good light and keep one item in view, then try again.</p>
      )}
    </>
  );
}

export function IdentifyWaste({ call, subtitle, ward, wardCount, compact, embedded }: IdentifyWasteProps) {
  const { toast } = useUi();
  const [mode, setMode] = useState(LIVE);
  const [paused, setPaused] = useState(false);
  const [shot, setShot] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Identification | null>(null);
  const [reading, setReading] = useState<LiveReading | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [history, setHistory] = useState<IdentificationList | null>(null);
  const [wardChoice, setWardChoice] = useState(ALL_WARDS);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const phoneCameraInput = useRef<HTMLInputElement>(null);
  const smoothed = useRef<{ bio: number; streak: number; last: Category | null } | null>(null);
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
    if (mode === LIVE) setMode(UPLOAD);
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
    setReading(null);
    smoothed.current = null;
    setPaused(false);
    retake();
  };

  // Live scan: grab a small frame, classify it, smooth the answer, repeat. One request
  // at a time; frames are not saved (save=false) unless someone presses Save.
  useEffect(() => {
    if (mode !== LIVE || !camReady || paused) return;
    let stopped = false;
    const times: number[] = [];
    (async () => {
      while (!stopped) {
        const started = performance.now();
        const video = cam.videoRef.current;
        if (video?.videoWidth && !document.hidden) {
          try {
            const r = await classify(await grabFrame(video, LIVE_FRAME_PX), "live-frame.jpg", false);
            if (stopped) break;
            const ms = Math.round(performance.now() - started);
            const bio = bioProbability(r);
            const prev = smoothed.current;
            const next = prev ? prev.bio * 0.4 + bio * 0.6 : bio;
            const category: Category = next >= 0.5 ? "degradable" : "non_degradable";
            const streak = prev?.last === category ? prev.streak + 1 : 1;
            smoothed.current = { bio: next, streak, last: category };
            const confidence = Math.max(next, 1 - next);
            times.push(performance.now());
            while (times.length > 6) times.shift();
            const fps = times.length > 1 ? ((times.length - 1) * 1000) / (times[times.length - 1] - times[0]) : 0;
            setReading({ category, confidence, sure: confidence >= SURE && streak >= 2, ms, fps, raw: r });
            setLiveError(null);
          } catch (e) {
            if (stopped) break;
            setLiveError(errorMessage(e));
            await wait(2000);
          }
        }
        await wait(Math.max(0, LIVE_INTERVAL_MS - (performance.now() - started)));
      }
    })();
    return () => {
      stopped = true;
    };
  }, [mode, camReady, paused, cam.videoRef, classify]);

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
  const detail = mode === LIVE ? (result ?? (reading?.sure ? reading.raw : null)) : result;

  /** Native camera app / file picker. `onDark`: drawn over the black camera area or a photo. */
  const fileButtons = (onDark: boolean) => (
    <div className="flex flex-wrap justify-center gap-2">
      <Button onClick={() => phoneCameraInput.current?.click()}>
        <CameraIcon size={16} />
        Open phone camera
      </Button>
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-semibold",
          onDark ? "border-white/70 bg-black/40 text-white" : "border-line bg-surface text-ink"
        )}
      >
        <ImageUp size={16} />
        Choose image
      </button>
    </div>
  );

  const roundButton = "grid h-12 w-12 place-items-center rounded-full bg-black/45 text-white backdrop-blur active:scale-95";

  const stage = (
    <>
      <Segmented items={[LIVE, PHOTO, UPLOAD]} active={mode} onChange={switchMode} />
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
            "relative flex aspect-[4/3] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed p-4 text-center",
            dragging ? "border-ac bg-ac-soft" : "border-line bg-ac-wash"
          )}
        >
          {shot ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shot} alt="Selected waste" className="absolute inset-0 h-full w-full bg-black object-contain" />
              {result && (
                <div className="absolute inset-x-3 top-3">
                  <LiveVerdict reading={{ category: result.category, confidence: result.confidence, sure: true, ms: 0, fps: 0, raw: result }} />
                </div>
              )}
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
        <div className={cn("relative overflow-hidden rounded-2xl bg-black text-white", compact ? "aspect-[3/4]" : "aspect-[3/4] sm:aspect-[4/3]")}>
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
              <ScanFrame active={!paused && !reading?.sure} />
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-bad px-2.5 py-1 text-xs font-bold">
                <span className={cn("h-2 w-2 rounded-full bg-white", !paused && "animate-pulse")} />
                {paused ? "PAUSED" : "LIVE"}
              </span>
              {reading && !paused && (
                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs" title="Classifier speed">
                  <Zap size={12} /> {reading.fps ? `${reading.fps.toFixed(1)}/s` : `${reading.ms} ms`}
                </span>
              )}
              <div className="absolute inset-x-3 bottom-[76px]">
                {liveError ? (
                  <div className="rounded-2xl bg-bad/90 px-4 py-3 text-sm">{liveError}</div>
                ) : (
                  <LiveVerdict reading={paused ? null : reading} />
                )}
              </div>
            </>
          )}
          {showShot && result && (
            <div className="absolute inset-x-3 top-3">
              <LiveVerdict reading={{ category: result.category, confidence: result.confidence, sure: true, ms: 0, fps: 0, raw: result }} />
            </div>
          )}
          {busy && <span className="absolute inset-x-0 top-0 bg-black/65 py-2 text-center">Identifying…</span>}

          {camReady && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-6 bg-gradient-to-t from-black/70 to-transparent pb-3.5 pt-8">
              {mode === LIVE && (
                <>
                  <button type="button" aria-label={paused ? "Resume live scan" : "Pause live scan"} onClick={() => setPaused((p) => !p)} className={roundButton}>
                    {paused ? <Play size={20} /> : <Pause size={20} />}
                  </button>
                  <Button onClick={saveLive} disabled={busy || !reading?.sure || paused} className="h-12 rounded-full px-5">
                    <Save size={17} /> Save result
                  </Button>
                </>
              )}
              {mode === PHOTO && !shot && (
                <>
                  <span className="w-12" />
                  <button
                    type="button"
                    aria-label="Take photo"
                    title="Take photo (Space)"
                    onClick={takePhoto}
                    className="grid h-[68px] w-[68px] place-items-center rounded-full border-4 border-white active:scale-95"
                  >
                    <span className="h-[52px] w-[52px] rounded-full bg-white" />
                  </button>
                </>
              )}
              {mode === PHOTO && shot && (
                <Button variant="outline" onClick={retake} disabled={busy} className="rounded-full">
                  <RefreshCw size={16} /> Retake
                </Button>
              )}
              {cam.canSwitch ? (
                <button type="button" aria-label="Switch camera" onClick={cam.switchCamera} className={roundButton}>
                  <SwitchCamera size={20} />
                </button>
              ) : (
                <span className="w-12" />
              )}
            </div>
          )}
        </div>
      )}
      <p className="mb-0 mt-3 text-[13px] text-mut">
        {mode === LIVE &&
          (reading
            ? "The answer updates live as you move the camera. Press Save result to keep one."
            : "Point the camera at one item. The answer appears on screen within a second.")}
        {mode === PHOTO &&
          (shot ? "Press Retake to identify another item." : "Tap the shutter (or press Space). The photo is identified straight away.")}
        {mode === UPLOAD && "JPEG, PNG, WebP or HEIC. Large photos are shrunk before upload."}
      </p>
    </>
  );

  const resultBox = (
    <Box title="Result" icon={<CheckCircle2 size={18} />} action={mode === LIVE && reading && !paused ? <Pill tone="R">● live</Pill> : undefined}>
      {detail ? (
        <ResultDetails result={detail} />
      ) : (
        <p className="m-0 text-mut">
          {mode === LIVE ? "Waiting for a steady reading from the camera…" : "Take a photo or upload one to see whether it is biodegradable."}
        </p>
      )}
    </Box>
  );

  const historyBox = (
    <Box title={compact ? "My recent scans" : "Recent identifications"} className={compact ? "" : "mt-[18px]"}>
      {history?.items.length ? (
        history.items.slice(0, compact ? 5 : 20).map((i) => (
          <Row key={i.id}>
            <span className="flex items-center gap-2.5">
              <span className={cn("grid h-8 w-8 place-items-center rounded-lg", i.category === "degradable" ? "bg-ok-soft text-ok" : "bg-info-soft text-info")}>
                <CategoryIcon category={i.category} size={16} />
              </span>
              <span>
                {CATEGORY[i.category].name} <span className="text-mut">· {pct(i.confidence)}</span>
              </span>
            </span>
            <span className="text-right text-[13px] text-mut">
              {ward || compact ? "" : i.ward ? `${wardLabel(i.ward)} · ` : ""}
              {timeOf(i.created_at)}
            </span>
          </Row>
        ))
      ) : (
        <p className="m-0 text-mut">Nothing saved yet.</p>
      )}
    </Box>
  );

  const inputs = (
    <>
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={onFileInput} />
      <input ref={phoneCameraInput} type="file" accept="image/*" capture="environment" hidden onChange={onFileInput} />
    </>
  );

  if (compact) {
    return (
      <div className="space-y-4">
        {inputs}
        <Box>{stage}</Box>
        {resultBox}
        {historyBox}
      </div>
    );
  }

  return (
    <>
      {!embedded && <PageHeader title="Identify Waste" subtitle={subtitle} />}
      <StatStrip
        items={[
          { label: "Photos identified", value: String(s?.total ?? 0), icon: <ScanLine size={20} /> },
          { label: "Biodegradable", value: String(s?.degradable ?? 0), icon: <Leaf size={20} />, tone: "G" },
          { label: "Non-biodegradable", value: String(s?.non_degradable ?? 0), icon: <Recycle size={20} />, tone: "B" },
          { label: "Biodegradable share", value: s?.total ? pct(s.degradable / s.total) : "–", icon: <CheckCircle2 size={20} />, tone: "A" },
        ]}
      />
      {inputs}
      <div className="grid gap-[18px] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Box>{stage}</Box>
        {resultBox}
      </div>
      {historyBox}
    </>
  );
}
