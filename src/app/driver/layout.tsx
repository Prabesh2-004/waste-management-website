import type { Metadata } from "next";
import { DriverPortal } from "@/components/driver/DriverPortal";

export const metadata: Metadata = {
  title: "Driver · Clean Kathmandu",
};

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return <DriverPortal>{children}</DriverPortal>;
}
