"use client";

import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chips } from "@/components/ui/Tabs";
import { UpdateFeed } from "@/components/shared/UpdateFeed";
import { NewUpdateModal } from "./NewUpdateModal";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";
import shared from "@/data/shared/options.json";

export function KmcUpdates() {
  const { updates, updateFilter, setUpdateFilter } = useKmc();
  const { openModal } = useUi();
  const items = updates.filter((u) => updateFilter === "All" || u.c === updateFilter);

  return (
    <>
      <PageHeader
        title="Updates & Information"
        subtitle="Messages sent to wards, drivers and citizens"
        action={<Button onClick={() => openModal(<NewUpdateModal />)}>New update</Button>}
      />
      <Chips items={shared.updateFilters} active={updateFilter} onChange={setUpdateFilter} />
      <UpdateFeed items={items} footer={(u) => `Published by KMC · Visible to: ${u.w} (Ward office, drivers, citizens)`} />
    </>
  );
}
