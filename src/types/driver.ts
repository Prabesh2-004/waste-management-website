import type { LiveVehicle, RouteDetail } from "@/types/live";
import type { WardReport } from "@/types/ward";

export interface DriverState {
  vehicles: LiveVehicle[];
  routes: RouteDetail[];
  issues: WardReport[];
  notifications: { id: number; text: string; href: string }[];
}
