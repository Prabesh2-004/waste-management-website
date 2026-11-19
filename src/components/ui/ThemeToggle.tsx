"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { currentTheme, setTheme, subscribeTheme } from "@/lib/theme";

/**
 * One tap switches between light and dark. `onAccent` is for the green headers;
 * `plain` matches the icon buttons in the desktop top bar.
 */
export function ThemeToggle({ variant = "plain", className }: { variant?: "plain" | "onAccent"; className?: string }) {
  // The server can't know the theme, so it renders a neutral button and the icon appears once hydrated.
  const theme = useSyncExternalStore(subscribeTheme, currentTheme, () => null);
  const next = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
      className={cn(
        "grid shrink-0 cursor-pointer place-items-center transition active:scale-95",
        variant === "onAccent" ? "h-11 w-11 rounded-full bg-white/15 text-white hover:bg-white/25" : "h-10 w-10 rounded-xl text-ink hover:bg-ac-faint",
        className
      )}
    >
      {theme && <Icon size={variant === "onAccent" ? 20 : 19} />}
    </button>
  );
}
