import type { UserProfile } from "@/types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export type Portal = "kmc" | "ward";

export interface ApiUser extends UserProfile {
  id: number;
  portal: Portal;
  ward: number | null;
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

export function loadToken(portal: Portal): string | null {
  try {
    return sessionStorage.getItem(tokenKey(portal));
  } catch {
    return null;
  }
}

export function saveToken(portal: Portal, token: string | null) {
  try {
    if (token) sessionStorage.setItem(tokenKey(portal), token);
    else sessionStorage.removeItem(tokenKey(portal));
  } catch {
    // Storage unavailable (private mode); the session lasts until reload.
  }
}

export function clearTokens() {
  saveToken("kmc", null);
  saveToken("ward", null);
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  form?: FormData;
  token?: string | null;
}

export async function request<T = unknown>(path: string, { method = "GET", body, form, token }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new ApiError(0, `Cannot reach the server at ${API_URL}`);
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = data?.detail;
    const message = typeof detail === "string" ? detail : Array.isArray(detail) ? (detail[0]?.msg ?? "Invalid input") : res.statusText;
    throw new ApiError(res.status, message);
  }
  return data as T;
}

export function authenticate(portal: Portal, mode: "login" | "signup", profile: UserProfile, password: string) {
  const body = mode === "login" ? { email: profile.email, password, portal } : { ...profile, password, portal };
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
