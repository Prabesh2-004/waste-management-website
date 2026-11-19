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

interface HostState {
  overlay: OverlayState | null;
  message: string | null;
  setOverlay: (o: OverlayState | null) => void;
}

const HostContext = createContext<HostState | null>(null);

/**
 * Draws the open drawer/modal and the toast. Place it inside the section's data
 * provider (KmcProvider, WardProvider, …): overlay content is rendered here, so it can
 * use that provider's hooks.
 */
export function OverlayHost() {
  const host = useContext(HostContext);
  if (!host) return null;
  const { overlay, message, setOverlay } = host;
  return (
    <>
      {overlay && (
        <div
          className={cn(
            "fixed inset-0 z-[9] flex bg-[#0b1f1880] backdrop-blur-[2px]",
            overlay.kind === "drawer" ? "items-end justify-end md:items-stretch" : "items-end justify-center sm:items-center sm:p-4"
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOverlay(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className={cn(
              "w-full overflow-auto bg-surface p-5 pb-[max(20px,env(safe-area-inset-bottom))] shadow-2xl sm:p-6",
              overlay.kind === "drawer"
                ? "max-h-[92dvh] rounded-t-3xl md:h-full md:max-h-none md:w-[440px] md:rounded-none md:rounded-l-3xl"
                : "max-h-[92dvh] rounded-t-3xl sm:w-[440px] sm:rounded-3xl"
            )}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line md:hidden" aria-hidden />
            {overlay.node}
          </div>
        </div>
      )}
      {message && (
        <div
          role="status"
          className="fixed bottom-[calc(84px+env(safe-area-inset-bottom))] left-1/2 z-[20] w-max max-w-[92%] -translate-x-1/2 rounded-2xl bg-ink px-[18px] py-3 text-sm text-canvas shadow-xl md:bottom-6"
        >
          {message}
        </div>
      )}
    </>
  );
}

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
  const host = useMemo(() => ({ overlay, message, setOverlay }), [overlay, message]);

  return (
    <UiContext.Provider value={value}>
      <HostContext.Provider value={host}>{children}</HostContext.Provider>
    </UiContext.Provider>
  );
}
