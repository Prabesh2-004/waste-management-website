"use client";

import { Input, Label } from "@/components/ui/Field";
import { ModalContent } from "@/components/ui/Overlays";
import { useUi } from "@/context/UiContext";

export function PasswordModal() {
  const { closeOverlay, toast } = useUi();
  return (
    <ModalContent
      title="Change password"
      okLabel="Update"
      onSubmit={() => {
        closeOverlay();
        toast("Password updated.");
      }}
    >
      <Label>Current password</Label>
      <Input type="password" />
      <Label>New password</Label>
      <Input type="password" />
    </ModalContent>
  );
}
