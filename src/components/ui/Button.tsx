import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "soft" | "danger" | "light";

const VARIANTS: Record<Variant, string> = {
  primary: "border-brand bg-brand text-white hover:brightness-95",
  outline: "border-brand bg-surface text-brand hover:bg-hover",
  soft: "border-transparent bg-tint text-brand-strong hover:brightness-[0.97]",
  danger: "border-[#f8c9c9] bg-[#fde4e4] text-danger hover:brightness-[0.97]",
  light: "border-white bg-white text-brand hover:bg-white/90",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
}

export function Button({ variant = "primary", size = "md", className, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg border font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        size === "md" ? "px-3.5 py-2 text-[13px]" : "px-2.5 py-1 text-xs",
        VARIANTS[variant],
        className
      )}
      {...rest}
    />
  );
}

/** Row of equal-width buttons pinned to the bottom of a card. */
export function ButtonRow({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mt-auto flex gap-2 pt-3 [&>*]:flex-1", className)}>{children}</div>;
}

interface TextLinkProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

/** Small green "View all →" style link; renders a Link when given href. */
export function TextLink({ href, onClick, children }: TextLinkProps) {
  const classes = "flex-none text-xs font-medium text-brand hover:underline";
  return href ? (
    <Link href={href} className={classes}>
      {children}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
