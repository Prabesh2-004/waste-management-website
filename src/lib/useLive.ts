"use client";

import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "./api";
import type { LiveData } from "@/types/live";

type Call = <T = unknown>(path: string) => Promise<T>;

/** Poll the live map data (routes, stops, truck positions) every `everyMs` while the page is visible. */
export function useLive(call: Call, ward: number | null | undefined, everyMs = 5000) {
  const [data, setData] = useState<LiveData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const path = `/api/v1/live${ward ? `?ward=${ward}` : ""}`;

  const load = useCallback(() => {
    call<LiveData>(path)
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError(errorMessage(e)));
  }, [call, path]);

  useEffect(() => {
    load();
    const id = setInterval(() => {
      if (!document.hidden) load();
    }, everyMs);
    return () => clearInterval(id);
  }, [load, everyMs]);

  return { data, error, reload: load };
}
