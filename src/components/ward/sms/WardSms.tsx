"use client";

import { SmsCenter } from "@/components/shared/SmsCenter";
import { PortalApiPage } from "@/components/shared/PortalApiPage";
import { WARD_NAME, WARD_NUMBER } from "@/data/ward";

export function WardSms() {
  return (
    <PortalApiPage portal="ward">
      {(call) => <SmsCenter call={call} ward={WARD_NUMBER} subtitle={`Text collection alerts to residents of ${WARD_NAME}`} embedded />}
    </PortalApiPage>
  );
}
