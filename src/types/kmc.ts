export interface WardStat {
  n: number;
  t: number;
  veh: number;
  comp: number;
}

export interface KmcRoute {
  w: number;
  n: number;
  v: string;
}

export interface WardSchedule {
  t: string;
  k: string;
}

export interface ScheduleSeed {
  ward: number;
  time: string;
  kind: string;
}

export interface KmcReport {
  id: number;
  ty: string;
  w: number;
  src: string;
  d: string;
  s: string;
  ds: string;
  c: string;
}

export interface NewProgramInput {
  name: string;
  ward: number;
  date: string;
  time: string;
  description: string;
  expected: number;
}

export interface NewUpdateInput {
  category: string;
  title: string;
  message: string;
  audience: string;
}

export interface DashboardAlert {
  id: string;
  text: string;
  status: string;
  href: string;
  collectionTab: string | null;
}

export interface HexCell {
  n: number;
  c: [number, number];
  p: [number, number][];
}
