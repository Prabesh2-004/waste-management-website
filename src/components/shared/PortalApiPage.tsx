"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { OverlayHost, UiProvider } from "@/context/UiContext";
import { loadToken, request } from "@/lib/api";
import type { Portal } from "@/lib/api";

type Call = <T = unknown>(path: string, opts?: { method?: string; body?: unknown; form?: FormData }) => Promise<T>;

/**
 * Hosts an API-backed page (Identify Waste, SMS Alerts) inside the KMC or ward portal.
 * The portals themselves run on demo data; these pages use the session saved by the
 * login page for that portal, and ask the user to sign in when there is none.
 */
export function PortalApiPage({ portal, children }: { portal: Extract<Portal, "kmc" | "ward">; children: (call: Call) => React.ReactNode }) {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  useEffect(() => setToken(loadToken(portal)), [portal]);
  const call: Call = useCallback((path, opts) => request(path, { ...opts, token }), [token]);

  if (token === undefined) return null;
  if (!token) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-line bg-surface p-5">
        <p className="text-muted">This page uses the live backend. Sign in as {portal === "kmc" ? "KMC" : "ward"} staff to use it.</p>
        <Link href={`/?role=${portal}`} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-white hover:brightness-95">
          <LogIn className="size-4" />
          Sign in
        </Link>
      </div>
    );
  }
  return (
    <UiProvider toastMs={3200}>
      <div data-app-kit>{children(call)}</div>
      <OverlayHost />
    </UiProvider>
  );
}
