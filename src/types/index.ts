export type Tone = "G" | "A" | "R" | "B" | "";

export interface UserProfile {
  name: string;
  role: string;
  email: string;
}

export interface WardUserProfile extends UserProfile {
  ward: number;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Navigation {
  main: NavLink[];
  secondary: NavLink;
}

export interface NotificationItem {
  text: string;
  href: string;
}

export interface UpdateItem {
  id: number;
  c: string;
  t: string;
  b: string;
  d: string;
  w?: string;
}

export interface Vehicle {
  id: string;
  drv: string;
  cap: number;
  st: string;
  note: string;
}

export interface AwarenessProgram {
  id: number;
  n: string;
  d: string;
  tm: string;
  exp: number;
  reg: number;
  att: number;
  s: string;
  ds: string;
  w?: number;
  loc?: string;
  ap?: string;
}

export type ToneMap = Record<string, Tone>;
