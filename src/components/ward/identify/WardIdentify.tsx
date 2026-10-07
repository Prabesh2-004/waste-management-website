"use client";

import { IdentifyWaste } from "@/components/shared/IdentifyWaste";
import { useWard } from "@/context/WardContext";

export function WardIdentify() {
  const { call, user, wardName } = useWard();
  return <IdentifyWaste call={call} ward={user.ward} subtitle={`Sort waste photos from ${wardName} with the waste classifier`} />;
}
