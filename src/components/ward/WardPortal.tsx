"use client";

import { Landmark, Leaf } from "lucide-react";
import { Brand } from "@/components/layout/Sidebar";
import { PortalShell } from "@/components/layout/PortalShell";
import { WardProvider } from "@/context/WardContext";
import { CITY_NAME } from "@/data/shared";
import { WARD_NAME, WARD_NAV, WARD_USER } from "@/data/ward";
import { SkyArt } from "./SkyArt";
import { StopsModal } from "./StopsModal";

export function WardPortal({ children }: { children: React.ReactNode }) {
  return (
    <WardProvider>
      <PortalShell
        portal="ward"
        name={`${WARD_NAME} · Waste Management`}
        nav={WARD_NAV}
        user={WARD_USER}
        brand={
          <Brand
            icon={<Leaf />}
            title={
              <>
                Ward Waste
                <br />
                Management
              </>
            }
          />
        }
        badge={
          <div className="flex items-center gap-2 rounded-[10px] bg-tint p-2.5 font-semibold">
            <Landmark className="size-5 flex-none text-brand" />
            <span>
              {WARD_NAME}
              <small className="block text-xs font-normal text-muted">{CITY_NAME}</small>
            </span>
          </div>
        }
        headerExtra={<SkyArt />}
      >
        {children}
        <StopsModal />
      </PortalShell>
    </WardProvider>
  );
}
