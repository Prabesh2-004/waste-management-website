"use client";

import { IdentifyWaste } from "@/components/shared/IdentifyWaste";
import { PortalApiPage } from "@/components/shared/PortalApiPage";
import meta from "@/data/shared/meta.json";

export function KmcIdentify() {
  return (
    <PortalApiPage portal="kmc">
      {(call) => <IdentifyWaste call={call} wardCount={meta.wardCount} subtitle="Sort waste photos from any ward with the waste classifier" embedded />}
    </PortalApiPage>
  );
}
