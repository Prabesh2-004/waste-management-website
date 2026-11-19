"use client";

import { Award, Megaphone, Newspaper, Plus, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatStrip } from "@/components/ui/StatStrip";
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
        subtitle={`Keep drivers, citizens and KMC informed about ${wardName}`}
        action={
          <Button onClick={() => openModal(<NewUpdateModal />)}>
            <Plus size={16} /> Create update
          </Button>
        }
      />
      <StatStrip
        items={[
          { label: "All updates", value: String(updates.length), icon: <Newspaper size={20} /> },
          { label: "Collection", value: String(updates.filter((u) => u.c === "Collection").length), icon: <Truck size={20} />, tone: "G" },
          { label: "Awareness", value: String(updates.filter((u) => u.c === "Awareness").length), icon: <Megaphone size={20} />, tone: "P" },
          {
            label: "Announcements",
            value: String(updates.filter((u) => u.c === "Announcements" || u.c === "Milestones").length),
            icon: <Award size={20} />,
            tone: "A",
          },
        ]}
      />
      <Chips items={shared.updateFilters} active={updateFilter} onChange={setUpdateFilter} />
      <UpdateFeed items={items} footer={() => `Published by ${wardName} · Seen by drivers and citizens · KMC can monitor`} />
    </>
  );
}
