export interface WardRoute {
  n: number;
  v: string;
  area: string;
  s: string;
  kg: number;
}

export interface WardReport {
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
