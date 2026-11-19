import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-ink outline-none transition-colors placeholder:text-mut/70 focus:border-ac focus:ring-2 focus:ring-ac-soft";

export function Label({ className, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1 mt-3 block text-[13px] font-medium text-mut", className)} {...rest} />;
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "disabled:opacity-70", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, className)} {...rest} />;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function Select({ options, value, onChange, className, ...rest }: SelectProps) {
  return (
    <select className={cn(control, "pr-8", className)} value={value} onChange={(e) => onChange(e.target.value)} {...rest}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <>
      <Label>{label}</Label>
      {children}
    </>
  );
}

export function CheckboxLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 mt-3 flex items-center gap-2 text-[13px] text-ink">
      <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--ac)]" />
      {children}
    </label>
  );
}
