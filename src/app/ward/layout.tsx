import type { Metadata } from "next";
import { WardPortal } from "@/components/ward/WardPortal";

export const metadata: Metadata = {
  title: "Ward · Kathmandu Waste Management",
};

export default function WardLayout({ children }: { children: React.ReactNode }) {
  return <WardPortal>{children}</WardPortal>;
}
