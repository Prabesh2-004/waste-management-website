import type { AwarenessProgram, UpdateItem } from "@/types";
import type { LiveData } from "@/types/live";

export interface HistoryEntry {
  status: string;
  at: string | null;
  note: string | null;
}

export interface CitizenReport {
  id: number;
  ref: string;
  type: string;
  ward: number;
  date: string;
  /** Pending | In Progress | Resolved */
  status: string;
  route: number | null;
  description: string;
  category: string;
  location: string;
  photo: string | null;
  history: HistoryEntry[];
  at: string | null;
}

export interface CitizenProgram extends AwarenessProgram {
  w: number;
  mine: boolean;
}

export interface CitizenState {
  ward: { n: number; status: string; time: string; kind: string };
  live: LiveData;
  updates: UpdateItem[];
  programs: CitizenProgram[];
  reports: CitizenReport[];
  notifications: { id: number; text: string; href: string }[];
  reminder: boolean;
}
