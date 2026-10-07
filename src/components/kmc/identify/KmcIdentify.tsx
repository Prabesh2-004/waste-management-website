"use client";

import { IdentifyWaste } from "@/components/shared/IdentifyWaste";
import { useKmc } from "@/context/KmcContext";
import meta from "@/data/shared/meta.json";

export function KmcIdentify() {
  const { call } = useKmc();
  return <IdentifyWaste call={call} wardCount={meta.wardCount} subtitle="Sort waste photos from any ward with the waste classifier" />;
}
