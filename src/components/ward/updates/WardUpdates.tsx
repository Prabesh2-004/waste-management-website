"use client";

import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chips } from "@/components/ui/Tabs";
import { UpdateFeed } from "@/components/shared/UpdateFeed";
import { NewUpdateModal } from "./NewUpdateModal";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import shared from "@/data/shared/options.json";

export function WardUpdates() {
  const { updates, updateFilter, setUpdateFilter, wardName } = useWard();
  const { openModal } = useUi();
  const items = updates.filter((u) => updateFilter === "All" || u.c === updateFilter);

  return (
    <>
      <PageHeader
        title="Updates & Information"
        subtitle={`Messages to drivers and citizens of ${wardName}`}
        action={<Button onClick={() => openModal(<NewUpdateModal />)}>New update</Button>}
      />
      <Chips items={shared.updateFilters} active={updateFilter} onChange={setUpdateFilter} />
      <UpdateFeed items={items} footer={() => `Published by ${wardName} · Seen by drivers and citizens · KMC can monitor`} />
    </>
  );
}
