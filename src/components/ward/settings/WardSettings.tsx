"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { SettingsForm } from "@/components/shared/SettingsForm";
import { useWard } from "@/context/WardContext";
import meta from "@/data/shared/meta.json";
import options from "@/data/ward/options.json";

export function WardSettings() {
  const { user, wardName, saveProfile } = useWard();

  return (
    <>
      <PageHeader title="Profile / Settings" subtitle={`${wardName} · ${meta.cityName}`} />
      <SettingsForm
        user={user}
        wardLabel={wardName}
        nameLabel="Staff name"
        notifyPreferences={options.notifyPreferences}
        onSave={saveProfile}
      />
    </>
  );
}
