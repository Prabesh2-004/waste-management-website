import { Leaf } from "lucide-react";
import { cn } from "@/lib/cn";

/** Leaf logo tile used in headers and the sidebar. */
export function Logo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-2xl bg-ac text-white shadow-sm", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Leaf size={size * 0.55} strokeWidth={2.2} />
    </span>
  );
}

/** Kathmandu skyline (temples, a stupa and hills), drawn in the current text colour. */
export function Skyline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 90" preserveAspectRatio="xMaxYMax meet" className={cn("pointer-events-none", className)} aria-hidden>
      <path d="M0 90 Q60 40 130 62 T260 50 T400 58 V90Z" fill="currentColor" opacity="0.35" />
      <g fill="currentColor">
        {/* pagoda */}
        <path d="M228 90V70h-8l14-9h-10l14-9h-8l10-9 10 9h-8l14 9h-10l14 9h-8v20z" />
        <rect x="243" y="34" width="2" height="9" />
        {/* stupa */}
        <path d="M300 90a26 26 0 0 1 52 0z" />
        <path d="M321 64h10v-6h-10z" />
        <path d="M323 58l3-16 3 16z" />
        {/* small temple */}
        <path d="M150 90V76h-6l12-8h-8l10-7 10 7h-8l12 8h-6v14z" />
        {/* trees */}
        <circle cx="372" cy="76" r="8" />
        <rect x="371" y="78" width="2" height="12" />
        <circle cx="120" cy="80" r="6" />
      </g>
    </svg>
  );
}
