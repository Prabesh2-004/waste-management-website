"use client";

import { useState } from "react";
import { Bell, KeyRound, LogOut, UserRound } from "lucide-react";
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
  onChangePassword: (current: string, next: string) => Promise<void>;
}

export function SettingsForm({ user, wardLabel, nameLabel, notifyPreferences, onSave, onChangePassword }: SettingsFormProps) {
  const { openModal, toast } = useUi();
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [email, setEmail] = useState(user.email);

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

  return (
    <div className="grid max-w-[920px] gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Box title="Profile" icon={<UserRound size={18} />}>
        <div className="mb-2 flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-ac-soft text-lg font-bold text-ac">{initials || "?"}</span>
          <div className="min-w-0">
            <b className="block truncate">{user.name}</b>
            <span className="text-sm text-mut">
              {user.role}
              {wardLabel ? ` · ${wardLabel}` : ""}
            </span>
          </div>
        </div>
        {wardLabel && (
          <>
            <Label>Ward</Label>
            <Input value={wardLabel} disabled readOnly />
          </>
        )}
        <Label>{nameLabel}</Label>
        <Input value={name} autoComplete="name" onChange={(e) => setName(e.target.value)} />
        <Label>Role</Label>
        <Input value={role} onChange={(e) => setRole(e.target.value)} />
        <Label>Email</Label>
        <Input type="email" autoComplete="email" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button
          className="mt-5"
          onClick={() => {
            onSave({ name, role, email });
            toast("Profile saved.");
          }}
        >
          Save changes
        </Button>
      </Box>
      <div className="space-y-5">
        <Box title="Notify me about" icon={<Bell size={18} />}>
          {notifyPreferences.map((x) => (
            <CheckboxLabel key={x}>{x}</CheckboxLabel>
          ))}
        </Box>
        <Box title="Security" icon={<KeyRound size={18} />}>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => openModal(<PasswordModal onChangePassword={onChangePassword} />)}>
              <KeyRound size={16} /> Change password
            </Button>
            <Button variant="danger" onClick={() => openModal(<LogoutModal />)}>
              <LogOut size={16} /> Log out
            </Button>
          </div>
        </Box>
      </div>
    </div>
  );
}
