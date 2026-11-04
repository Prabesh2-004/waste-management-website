"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Toast = (message: string) => void;

const ToastContext = createContext<Toast | null>(null);

export function useToast(): Toast {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast must be used inside ToastProvider");
  return toast;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback<Toast>((text) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(text);
    timer.current = setTimeout(() => setMessage(null), 1800);
  }, []);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-5 left-1/2 z-[60] max-w-[90%] -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-[13px] text-white transition-opacity ${message ? "opacity-100" : "opacity-0"}`}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}
