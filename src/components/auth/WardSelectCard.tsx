"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Field";
import { useUi } from "@/context/UiContext";
import { errorMessage } from "@/lib/api";
import { wardLabel, wardOptions } from "@/lib/format";

interface WardSelectCardProps {
  wardCount: number;
  defaultWard: number;
  onContinue: (ward: number) => Promise<void>;
}

export function WardSelectCard({ wardCount, defaultWard, onContinue }: WardSelectCardProps) {
  const { toast } = useUi();
  const [value, setValue] = useState(wardLabel(defaultWard));
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await onContinue(Number(value.slice(5)));
    } catch (e) {
      toast(errorMessage(e));
      setBusy(false);
    }
  };
  return (
    <div className="grid min-h-screen place-items-center p-5">
      <div className="w-[380px] max-w-full rounded-xl border border-line bg-surface p-7">
        <h1>Select your Ward</h1>
        <p className="text-[13px] text-mut">You will manage and see this ward only.</p>
        <Label>Ward</Label>
        <Select options={wardOptions(wardCount)} value={value} onChange={setValue} />
        <p>
          <Button block onClick={submit} disabled={busy}>
            Continue
          </Button>
        </p>
      </div>
    </div>
  );
}
