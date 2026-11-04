import { cn } from "@/lib/cn";

/** Base input/select/textarea style. Width and margins are set by the caller or by <Field>. */
export const inputClass =
  "rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[13px] font-normal text-ink outline-none focus:border-brand";

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("mb-2.5 flex flex-col gap-1 text-xs font-medium [&>*]:w-full", className)}>
      {label}
      {children}
    </label>
  );
}
