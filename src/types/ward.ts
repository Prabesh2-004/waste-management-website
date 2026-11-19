export interface WardRoute {
  n: number;
  v: string;
  area: string;
  s: string;
  kg: number;
}

export interface ReportHistoryEntry {
  status: string;
  /** ISO time; null for entries recorded before history existed. */
  at: string | null;
  note: string | null;
}

/** Fields the API adds to every report (ward and KMC). */
export interface ReportExtra {
  /** Reference shown to citizens, e.g. "WR-00012". */
  ref?: string;
  /** API path of the photo evidence, or null. */
  photo?: string | null;
  history?: ReportHistoryEntry[];
  /** ISO time the report was filed. */
  at?: string | null;
}

export interface WardReport extends ReportExtra {
  id: number;
  ty: string;
  src: string;
  d: string;
  s: string;
  rt: number;
  ds: string;
  c: string;
  loc: string;
  notes: string[];
}

export interface WardProgramInput {
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  expected: number;
  needsCoordination: boolean;
}

export interface ScheduleRow {
  route: number;
  time: string;
}
