import type { Metadata } from "next";
import { KmcPortal } from "@/components/kmc/KmcPortal";

export const metadata: Metadata = { title: "KMC Waste Management Portal" };

export default function KmcLayout({ children }: { children: React.ReactNode }) {
  return <KmcPortal>{children}</KmcPortal>;
}
