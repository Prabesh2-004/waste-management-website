import type { Metadata } from "next";
import { CitizenPortal } from "@/components/citizen/CitizenPortal";

export const metadata: Metadata = {
  title: "Citizen · Clean Kathmandu",
};

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return <CitizenPortal>{children}</CitizenPortal>;
}
