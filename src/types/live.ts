export interface LatLng {
  lat: number;
  lng: number;
}

export interface Stop extends LatLng {
  id: number;
  seq: number;
  name: string;
  status: "Pending" | "Collected" | "Skipped";
  at: string | null;
}

export interface RouteDetail {
  id: number;
  ward: number;
  n: number;
  vehicle: string;
  area: string;
  /** Upcoming | In Progress | Completed | Delayed | Incomplete */
  status: string;
  kg: number;
  /** "07:00" */
  time: string;
  waste: string;
  started_at: string | null;
  completed_at: string | null;
  stops: Stop[];
}

export interface VehicleLocation extends LatLng {
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  at: string | null;
}

export interface LiveVehicle {
  id: string;
  drv: string;
  cap: number;
  st: string;
  note: string;
  ward: number | null;
  location: VehicleLocation | null;
}

export interface LiveData {
  now: string;
  liveSeconds: number;
  centres: Record<string, [number, number]>;
  routes: RouteDetail[];
  vehicles: LiveVehicle[];
}
