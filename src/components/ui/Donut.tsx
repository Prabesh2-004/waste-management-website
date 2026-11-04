export interface DonutSegment {
  /** Share of the ring in percent. */
  value: number;
  color: string;
}

interface DonutProps {
  segments: DonutSegment[];
  size?: number;
  /** Ring width in pixels. */
  thickness?: number;
  children?: React.ReactNode;
}

export function Donut({ segments, size = 96, thickness = 14, children }: DonutProps) {
  let start = 0;
  const stops = segments
    .map((s) => {
      const stop = `${s.color} ${start}% ${start + s.value}%`;
      start += s.value;
      return stop;
    })
    .join(", ");

  return (
    <div className="grid flex-none place-items-center rounded-full" style={{ width: size, height: size, background: `conic-gradient(${stops})` }}>
      <div
        className="grid place-items-center rounded-full bg-surface text-center leading-tight"
        style={{ width: size - thickness * 2, height: size - thickness * 2 }}
      >
        <div>{children}</div>
      </div>
    </div>
  );
}

/** Legend row used beside donuts. */
export function LegendRow({ color, label, value }: { color?: string; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[13px]">
      <span className="flex items-center gap-1.5 text-muted">
        {color && <i className="inline-block size-2 rounded-full" style={{ background: color }} />}
        {label}
      </span>
      <b>{value}</b>
    </div>
  );
}
