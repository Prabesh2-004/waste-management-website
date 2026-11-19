import type { UserProfile } from "@/types";

/** "kmc" and "ward" are the staff portals; "citizen" and "driver" are the mobile sections. */
export type Portal = "kmc" | "ward" | "citizen" | "driver";

const CONFIGURED_API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const LOOPBACK = /^(localhost|127\.\d+\.\d+\.\d+|\[?::1\]?)$/;

/**
 * Where API calls go. An empty string means this site's own /api/v1, which Next.js
 * forwards to the backend (next.config.mjs). That is the default, and it is also used
 * when NEXT_PUBLIC_API_URL points at localhost but the page was opened from another
 * device: on a phone, "localhost" is the phone itself, so a direct call could never
 * reach the backend (and an https page may not call an http API at all).
 */
export function apiBase(): string {
  if (!CONFIGURED_API) return "";
  if (typeof window === "undefined") return CONFIGURED_API;
  try {
    const api = new URL(CONFIGURED_API);
    const page = window.location;
    if (LOOPBACK.test(api.hostname) && !LOOPBACK.test(page.hostname)) return "";
    if (page.protocol === "https:" && api.protocol === "http:") return "";
  } catch {
    return "";
  }
  return CONFIGURED_API;
}

/** Absolute URL for an API path (e.g. report photos in <img>). */
export function apiUrl(path: string): string {
  return `${apiBase()}${path}`;
}

export interface ApiUser extends UserProfile {
  id: number;
  portal: Portal;
  ward: number | null;
  phone: string | null;
}

export interface AuthResponse {
  access_token: string;
  user: ApiUser;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const tokenKey = (portal: Portal) => `kwm-token-${portal}`;
// Fallback when storage is blocked (some private browsing modes).
const memoryTokens: Partial<Record<Portal, string>> = {};

/** Tokens live in localStorage so a phone that unloads the tab in the background stays logged in. */
export function loadToken(portal: Portal): string | null {
  try {
    const saved = localStorage.getItem(tokenKey(portal)) ?? sessionStorage.getItem(tokenKey(portal));
    return saved ?? memoryTokens[portal] ?? null;
  } catch {
    return memoryTokens[portal] ?? null;
  }
}

export function saveToken(portal: Portal, token: string | null) {
  if (token) memoryTokens[portal] = token;
  else delete memoryTokens[portal];
  try {
    sessionStorage.removeItem(tokenKey(portal)); // older versions kept it here
    if (token) localStorage.setItem(tokenKey(portal), token);
    else localStorage.removeItem(tokenKey(portal));
  } catch {
    // Storage unavailable; the in-memory copy lasts until reload.
  }
}

export function clearTokens() {
  (["kmc", "ward", "citizen", "driver"] as Portal[]).forEach((p) => saveToken(p, null));
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  form?: FormData;
  token?: string | null;
  signal?: AbortSignal;
}

const RETRYABLE = new Set([0, 500, 502, 503, 504]);

/**
 * Call the API. Reads (GET) are retried once after a dropped connection or a gateway
 * error: phones lose connections often, and the dev proxy can hit a closed keep-alive socket.
 */
export async function request<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  try {
    return await send<T>(path, opts);
  } catch (e) {
    if ((opts.method ?? "GET") !== "GET" || !(e instanceof ApiError) || !RETRYABLE.has(e.status) || opts.signal?.aborted) throw e;
    await new Promise((r) => setTimeout(r, 400));
    return send<T>(path, opts);
  }
}

async function send<T>(path: string, { method = "GET", body, form, token, signal }: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.");
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? String(detail[0]?.msg ?? "Invalid input").replace(/^Value error, /, "")
          : res.status >= 500
            ? "The server is not available right now. Try again in a moment."
            : res.statusText || "Request failed";
    throw new ApiError(res.status, message);
  }
  return data as T;
}

export interface SignupExtra {
  ward?: number;
  phone?: string;
}

export function authenticate(portal: Portal, mode: "login" | "signup", profile: UserProfile, password: string, extra: SignupExtra = {}) {
  const email = profile.email.trim();
  const body = mode === "login" ? { email, password, portal } : { ...profile, email, password, portal, ...extra };
  return request<AuthResponse>(`/api/v1/auth/${mode}`, { method: "POST", body });
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong";
}

/** Same as meta.todayShort, but for the real date. */
export function todayShort(): string {
  const d = new Date();
  return `${d.toLocaleString("en-US", { month: "short" })} ${d.getDate()}`;
}
