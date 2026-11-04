import type { Metadata } from "next";
import { WardPortal } from "@/components/ward/WardPortal";

export const metadata: Metadata = { title: "Ward Waste Management – Ward 17" };

export default function WardLayout({ children }: { children: React.ReactNode }) {
  return <WardPortal>{children}</WardPortal>;
}
