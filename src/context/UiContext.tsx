"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type OverlayKind = "drawer" | "modal";

interface OverlayState {
  kind: OverlayKind;
  node: ReactNode;
}

interface UiContextValue {
  toast: (message: string) => void;
  openDrawer: (node: ReactNode) => void;
  openModal: (node: ReactNode) => void;
  closeOverlay: () => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export function useUi(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used inside UiProvider");
  return ctx;
}

interface UiProviderProps {
  toastMs: number;
  children: ReactNode;
}

export function UiProvider({ toastMs, children }: UiProviderProps) {
  const [overlay, setOverlay] = useState<OverlayState | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback(
    (text: string) => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(text);
      timer.current = setTimeout(() => setMessage(null), toastMs);
    },
    [toastMs]
  );

  const openDrawer = useCallback((node: ReactNode) => setOverlay({ kind: "drawer", node }), []);
  const openModal = useCallback((node: ReactNode) => setOverlay({ kind: "modal", node }), []);
  const closeOverlay = useCallback(() => setOverlay(null), []);

  useEffect(() => {
    if (!overlay) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOverlay(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlay]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const value = useMemo(() => ({ toast, openDrawer, openModal, closeOverlay }), [toast, openDrawer, openModal, closeOverlay]);

  return (
    <UiContext.Provider value={value}>
      {children}
      {overlay && (
        <div
          className={cn("fixed inset-0 z-[9] flex bg-[#0007]", overlay.kind === "drawer" ? "justify-end" : "items-center justify-center p-4")}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOverlay(null);
          }}
        >
          <div
            className={cn(
              "w-[400px] max-w-full overflow-auto bg-surface p-6",
              overlay.kind === "drawer" ? "h-full" : "max-h-[90vh] rounded-xl"
            )}
          >
            {overlay.node}
          </div>
        </div>
      )}
      {message && (
        <div className="fixed bottom-6 left-1/2 z-[20] max-w-[90%] -translate-x-1/2 rounded-lg bg-ink px-[18px] py-2.5 text-canvas">{message}</div>
      )}
    </UiContext.Provider>
  );
}
