"use client";

import { useState } from "react";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { CheckboxLabel, Input, Label } from "@/components/ui/Field";
import { PasswordModal } from "./PasswordModal";
import { LogoutModal } from "./LogoutModal";
import { useUi } from "@/context/UiContext";
import type { UserProfile } from "@/types";

interface SettingsFormProps {
  user: UserProfile;
  wardLabel?: string;
  nameLabel: string;
  notifyPreferences: string[];
  onSave: (profile: UserProfile) => void;
}

export function SettingsForm({ user, wardLabel, nameLabel, notifyPreferences, onSave }: SettingsFormProps) {
  const { openModal, toast } = useUi();
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [email, setEmail] = useState(user.email);

  return (
    <Box className="max-w-[520px]">
      {wardLabel && (
        <>
          <Label>Ward</Label>
          <Input value={wardLabel} disabled readOnly />
        </>
      )}
      <Label>{nameLabel}</Label>
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <Label>Role</Label>
      <Input value={role} onChange={(e) => setRole(e.target.value)} />
      <Label>Email</Label>
      <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      <p className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            onSave({ name, role, email });
            toast("Profile saved.");
          }}
        >
          Save
        </Button>
        <Button variant="outline" onClick={() => openModal(<PasswordModal />)}>
          Change password
        </Button>
      </p>
      <h3 className="mt-[22px]">Notify me about</h3>
      {notifyPreferences.map((x) => (
        <CheckboxLabel key={x}>{x}</CheckboxLabel>
      ))}
      <p className="mt-[22px]">
        <Button variant="outline" onClick={() => openModal(<LogoutModal />)}>
          Log out
        </Button>
      </p>
    </Box>
  );
}
