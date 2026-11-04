import { STATUS_COLORS } from "@/lib/status";

const G = STATUS_COLORS.Completed;
const B = STATUS_COLORS["In progress"];
const A = STATUS_COLORS.Delayed;
const R = STATUS_COLORS.Missed;

export const MAP_LEGEND = [
  { color: G, label: "Completed" },
  { color: B, label: "In progress" },
  { color: A, label: "Delayed" },
  { color: R, label: "Missed" },
];

/** Schematic map of Ward 17's collection routes (demo artwork from the prototype). */
export function RouteMap({ legend = false }: { legend?: boolean }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1.5">
      <div className="relative min-h-[220px] flex-1 overflow-hidden rounded-[10px] bg-[#e9efe9]">
        <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" role="img" aria-label="Ward 17 route map">
          <rect width="400" height="260" fill="#eaf0ea" />
          <path d="M0 190C90 150 150 230 260 190S380 170 400 150" stroke="#cfe0ee" strokeWidth="16" fill="none" />
          <path d="M0 60H400M0 130H400M90 0V260M230 0V260M330 0V260" stroke="#fff" strokeWidth="5" fill="none" />
          <g fontSize="10" fill="#889">
            <text x="150" y="30">Tengal</text>
            <text x="12" y="150">Thamel</text>
            <text x="250" y="20">Chhetrapati</text>
            <text x="130" y="240">Kalanki</text>
          </g>
          <g fill="none" strokeWidth="3">
            <path d="M50 60L90 40 140 70 120 110 70 100Z" stroke={G} />
            <path d="M150 100L190 60 240 70 270 100" stroke={B} />
            <path d="M120 110L170 150 230 140 290 110" stroke={A} />
            <path d="M290 110L330 160 280 210 200 200" stroke={R} />
          </g>
          <circle cx="270" cy="100" r="9" fill={B} />
          <circle cx="290" cy="110" r="9" fill={R} />
          <circle cx="90" cy="40" r="9" fill={G} />
          <rect x="150" y="125" width="52" height="18" rx="9" fill="#fff" />
          <text x="160" y="138" fontSize="10" fontWeight="700" fill="#0d3b2e">
            Ward 17
          </text>
        </svg>
      </div>
      {legend && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {MAP_LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <i className="inline-block size-2 rounded-full" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
