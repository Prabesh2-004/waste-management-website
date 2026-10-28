"use client";

import { SmsCenter } from "@/components/shared/SmsCenter";
import { useKmc } from "@/context/KmcContext";
import meta from "@/data/shared/meta.json";

export function KmcSms() {
  const { call } = useKmc();
  return <SmsCenter call={call} wardCount={meta.wardCount} subtitle="Text collection alerts to residents of any ward" />;
}
