"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useUi } from "@/context/UiContext";
import { ApiError, errorMessage, loadToken, request, saveToken } from "@/lib/api";
import type { ApiUser } from "@/lib/api";
import type { CitizenProgram, CitizenReport, CitizenState } from "@/types/citizen";

type Call = <T = unknown>(path: string, opts?: { method?: string; body?: unknown; form?: FormData }) => Promise<T>;

interface CitizenContextValue {
  ready: boolean;
  loadError: string | null;
  user: ApiUser | null;
  state: CitizenState | null;
  call: Call;
  reload: () => Promise<void>;
  unread: number;
  markSeen: () => void;
  submitReport: (form: FormData) => Promise<CitizenReport>;
  setRegistered: (program: CitizenProgram, on: boolean) => Promise<void>;
  setReminder: (enabled: boolean, phone?: string) => Promise<void>;
  saveProfile: (patch: { name?: string; ward?: number; phone?: string }) => Promise<void>;
}

const CitizenContext = createContext<CitizenContextValue | null>(null);

export function useCitizen(): CitizenContextValue {
  const ctx = useContext(CitizenContext);
  if (!ctx) throw new Error("useCitizen must be used inside CitizenProvider");
  return ctx;
}

const SEEN_KEY = "kwm-citizen-seen";

export function CitizenProvider({ children }: { children: ReactNode }) {
  const { toast } = useUi();
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [state, setState] = useState<CitizenState | null>(null);
  const [seenId, setSeenId] = useState(0);
  const tokenRef = useRef<string | null>(null);

  const call: Call = useCallback((path, opts) => request(path, { ...opts, token: tokenRef.current }), []);

  const reload = useCallback(async () => {
    setState(await call<CitizenState>("/api/v1/citizen/state"));
  }, [call]);

  useEffect(() => {
    try {
      setSeenId(Number(localStorage.getItem(SEEN_KEY) ?? 0));
    } catch {
      // storage blocked: every notification counts as new
    }
    const saved = loadToken("citizen");
    if (!saved) {
      setReady(true);
      return;
    }
    tokenRef.current = saved;
    request<ApiUser>("/api/v1/me", { token: saved })
      .then(async (u) => {
        if (u.portal !== "citizen") throw new ApiError(403, "Not a citizen account");
        setUser(u);
        setToken(saved);
        setState(await request<CitizenState>("/api/v1/citizen/state", { token: saved }));
      })
      .catch((e) => {
        if (e instanceof ApiError && [401, 403, 404].includes(e.status)) {
          saveToken("citizen", null);
          tokenRef.current = null;
        } else setLoadError(errorMessage(e));
      })
      .finally(() => setReady(true));
  }, []);

  // Refresh every 30 s for schedule changes, report updates and notifications.
  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => {
      if (!document.hidden) reload().catch(() => undefined);
    }, 30000);
    return () => clearInterval(id);
  }, [token, reload]);

  const unread = (state?.notifications ?? []).filter((n) => n.id > seenId).length;
  const markSeen = useCallback(() => {
    const top = state?.notifications[0]?.id ?? 0;
    setSeenId(top);
    try {
      localStorage.setItem(SEEN_KEY, String(top));
    } catch {
      // ignore
    }
  }, [state]);

  const submitReport = useCallback(
    async (form: FormData) => {
      const report = await call<CitizenReport>("/api/v1/citizen/reports", { method: "POST", form });
      await reload().catch(() => undefined);
      return report;
    },
    [call, reload]
  );

  const setRegistered = useCallback(
    async (program: CitizenProgram, on: boolean) => {
      try {
        await call(`/api/v1/citizen/programs/${program.id}/register`, { method: on ? "POST" : "DELETE" });
        toast(on ? `Registered for ${program.n}` : `Registration for ${program.n} cancelled`);
      } catch (e) {
        toast(errorMessage(e));
      }
      await reload().catch(() => undefined);
    },
    [call, reload, toast]
  );

  const setReminder = useCallback(
    async (enabled: boolean, phone?: string) => {
      const r = await call<{ enabled: boolean; phone: string | null }>("/api/v1/citizen/reminder", {
        method: "PUT",
        body: { enabled, phone: phone || undefined },
      });
      setUser((u) => (u ? { ...u, phone: r.phone } : u));
      setState((s) => (s ? { ...s, reminder: r.enabled } : s));
      toast(r.enabled ? `Reminders on: SMS to ${r.phone}` : "Collection reminders turned off");
    },
    [call, toast]
  );

  const saveProfile = useCallback(
    async (patch: { name?: string; ward?: number; phone?: string }) => {
      const u = await call<ApiUser>("/api/v1/me", { method: "PATCH", body: patch });
      setUser(u);
      await reload();
    },
    [call, reload]
  );

  const value = useMemo(
    () => ({ ready, loadError, user, state, call, reload, unread, markSeen, submitReport, setRegistered, setReminder, saveProfile }),
    [ready, loadError, user, state, call, reload, unread, markSeen, submitReport, setRegistered, setReminder, saveProfile]
  );

  return <CitizenContext.Provider value={value}>{children}</CitizenContext.Provider>;
}
