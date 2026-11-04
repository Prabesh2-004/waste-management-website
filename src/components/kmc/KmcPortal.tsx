"use client";

import { Landmark } from "lucide-react";
import { Brand } from "@/components/layout/Sidebar";
import { PortalShell } from "@/components/layout/PortalShell";
import { KmcProvider } from "@/context/KmcContext";
import { CITY_NAME } from "@/data/shared";
import { KMC_NAV, KMC_USER } from "@/data/kmc";

export function KmcPortal({ children }: { children: React.ReactNode }) {
  return (
    <KmcProvider>
      <PortalShell portal="kmc" name="KMC Waste Management" nav={KMC_NAV} user={KMC_USER} brand={<Brand icon={<Landmark />} title="KMC" subtitle={CITY_NAME} />}>
        {children}
      </PortalShell>
    </KmcProvider>
  );
}
