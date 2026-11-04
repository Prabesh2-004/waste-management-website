import { Leaf } from "lucide-react";

/** Decorative "Cleaner Ward, Greener Kathmandu" banner from the ward prototype header. */
export function SkyArt() {
  return (
    <div className="relative hidden h-[62px] w-60 items-center justify-end overflow-hidden rounded-[10px] bg-gradient-to-b from-[#e3f3ea] to-[#f4faf7] pr-3.5 text-[11px] font-semibold text-brand-strong xl:flex">
      <svg className="absolute inset-0 size-full" viewBox="0 0 240 62" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 62C40 40 70 50 110 42s80-8 130 20z" fill="#d2eadf" />
        <g fill="#a8d8bf">
          <path d="M40 62V38h26v24zM34 40l19-10 19 10zM40 31l13-8 13 8zM47 24l6-8 6 8z" />
          <path d="M95 62V44h18v18zM91 46l13-7 13 7z" />
          <path d="M130 62V34l8-12 8 12v28z" />
        </g>
      </svg>
      <span className="relative leading-snug">
        <Leaf className="inline size-4 align-[-3px]" /> <b>Cleaner Ward</b>
        <br />
        Greener Kathmandu
      </span>
    </div>
  );
}
