"use client";

import { SmsCenter } from "@/components/shared/SmsCenter";
import { useWard } from "@/context/WardContext";

export function WardSms() {
  const { call, user, wardName } = useWard();
  return <SmsCenter call={call} ward={user.ward} subtitle={`Text collection alerts to residents of ${wardName}`} />;
}
