"use client";

import { Award, Megaphone, Newspaper, Plus, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatStrip } from "@/components/ui/StatStrip";
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
        subtitle="News, announcements and notices for wards, drivers and citizens"
        action={
          <Button onClick={() => openModal(<NewUpdateModal />)}>
            <Plus size={16} /> New update
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
      <UpdateFeed items={items} footer={(u) => `Published by KMC · Visible to: ${u.w} (Ward office, drivers, citizens)`} />
    </>
  );
}
