"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Field";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";
import meta from "@/data/shared/meta.json";

export function GoToWard() {
  const [value, setValue] = useState("");
  const { selectWard } = useKmc();
  const { toast } = useUi();
  const router = useRouter();

  const go = () => {
    const n = parseInt(value.replace(/\D/g, ""), 10);
    if (n >= 1 && n <= meta.wardCount) {
      selectWard(n);
      router.push("/kmc/wards");
    } else {
      toast(`Enter a ward number from 1 to ${meta.wardCount}`);
    }
  };

  return (
    <div className="w-[190px] md:w-[150px] lg:w-60">
      <Input
        placeholder="Go to ward (e.g. 17)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") go();
        }}
      />
    </div>
  );
}
