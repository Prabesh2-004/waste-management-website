"use client";

import { SmsCenter } from "@/components/shared/SmsCenter";
import { PortalApiPage } from "@/components/shared/PortalApiPage";
import meta from "@/data/shared/meta.json";

export function KmcSms() {
  return (
    <PortalApiPage portal="kmc">
      {(call) => <SmsCenter call={call} wardCount={meta.wardCount} subtitle="Text collection alerts to residents of any ward" embedded />}
    </PortalApiPage>
  );
}
