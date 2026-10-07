"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { SettingsForm } from "@/components/shared/SettingsForm";
import { useKmc } from "@/context/KmcContext";
import options from "@/data/kmc/options.json";

export function KmcSettings() {
  const { user, saveProfile, changePassword } = useKmc();

  return (
    <>
      <PageHeader title="Profile / Settings" subtitle="Your KMC account" />
      <SettingsForm user={user} nameLabel="Name" notifyPreferences={options.notifyPreferences} onSave={saveProfile} onChangePassword={changePassword} />
    </>
  );
}
