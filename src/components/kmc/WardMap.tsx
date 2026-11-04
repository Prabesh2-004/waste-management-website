"use client";

import { useEffect, useRef } from "react";
import { LocateFixed, Minus, Plus } from "lucide-react";
import { useKmc } from "@/context/KmcContext";
import { useToast } from "@/context/ToastContext";
import { WARD_CENTERS, wardMapState, type WardMapState } from "@/data/kmc";

/* Map geometry: a 470×350 window over the ward centre coordinates, drawn at 2× scale. */
const SCALE = 2;
const WIDTH = 470 * SCALE;
const HEIGHT = 350 * SCALE;
const ORIGIN_X = 300;
const ORIGIN_Y = 295;
/** Pixels further than this from every ward centre are left blank (outside the city). */
const MAX_DISTANCE = 50;
const WARDS = Object.keys(WARD_CENTERS).map(Number);

const FILL: Record<WardMapState, [number, number, number]> = {
  ok: [205, 233, 214],
  partial: [253, 240, 196],
  attention: [248, 201, 201],
};
const SELECTED: [number, number, number] = [27, 138, 74];
const BORDER: [number, number, number] = [255, 255, 255];

let ownerCache: Int8Array | null = null;

/** For every pixel, the ward whose centre is nearest (0 = outside the city). Computed once. */
function wardOwners(): Int8Array {
  if (ownerCache) return ownerCache;
  const owners = new Int8Array(WIDTH * HEIGHT);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const px = ORIGIN_X + x / SCALE;
      const py = ORIGIN_Y + y / SCALE;
      let best = 0;
      let bestDistance = Infinity;
      for (const ward of WARDS) {
        const [cx, cy] = WARD_CENTERS[ward];
        const d = Math.hypot(px - cx, py - cy);
        if (d < bestDistance) {
          bestDistance = d;
          best = ward;
        }
      }
      owners[y * WIDTH + x] = bestDistance < MAX_DISTANCE ? best : 0;
    }
  }
  ownerCache = owners;
  return owners;
}

function draw(canvas: HTMLCanvasElement, selected: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const owners = wardOwners();
  const image = ctx.createImageData(WIDTH, HEIGHT);

  for (let i = 0; i < owners.length; i++) {
    const ward = owners[i];
    if (!ward) continue;
    const x = i % WIDTH;
    const isBorder = (x < WIDTH - 1 && owners[i + 1] !== ward) || (i + WIDTH < owners.length && owners[i + WIDTH] !== ward);
    const color = isBorder ? BORDER : ward === selected ? SELECTED : FILL[wardMapState(ward)];
    image.data.set([...color, 255], i * 4);
  }
  ctx.putImageData(image, 0, 0);

  ctx.font = `600 ${12 * SCALE}px "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const ward of WARDS) {
    const [cx, cy] = WARD_CENTERS[ward];
    ctx.fillStyle = ward === selected ? "#fff" : "#0b3b2a";
    ctx.fillText(String(ward), (cx - ORIGIN_X) * SCALE, (cy - ORIGIN_Y) * SCALE);
  }
}

const LEGEND = [
  { color: "#cfeadb", label: "On schedule (26)" },
  { color: "#fbe9b7", label: "Partial (4)" },
  { color: "#f8c9c9", label: "Attention (2)" },
];

export function WardMap() {
  const { selectedWard, selectWard } = useKmc();
  const toast = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) draw(canvasRef.current, selectedWard);
  }, [selectedWard]);

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // The canvas uses object-fit: contain, so account for the letterbox offset.
    const s = Math.min(rect.width / WIDTH, rect.height / HEIGHT);
    const x = Math.floor((e.clientX - rect.left - (rect.width - WIDTH * s) / 2) / s);
    const y = Math.floor((e.clientY - rect.top - (rect.height - HEIGHT * s) / 2) / s);
    if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
    const ward = wardOwners()[y * WIDTH + x];
    if (ward) selectWard(ward);
  };

  const zoomButtons = [
    { icon: Plus, label: "Zoom in", message: "Zoom in" },
    { icon: Minus, label: "Zoom out", message: "Zoom out" },
    { icon: LocateFixed, label: "Center map", message: "Centered on Kathmandu" },
  ];

  return (
    <div className="flex min-w-0 flex-col">
      <div className="relative aspect-[47/35] max-h-[52vh] w-full">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onClick={onClick}
          aria-label="Map of Kathmandu's 32 wards. Click a ward to select it."
          className="absolute inset-0 size-full cursor-pointer object-contain"
        />
        <div className="absolute top-0 left-0 flex flex-col gap-1">
          {zoomButtons.map(({ icon: Icon, label, message }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={() => toast(message)}
              className="grid size-8 place-items-center rounded-lg border border-line bg-surface hover:bg-hover"
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5">
            <i className="inline-block size-3 rounded-sm" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
