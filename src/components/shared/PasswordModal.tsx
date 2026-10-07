"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/Field";
import { ModalContent } from "@/components/ui/Overlays";
import { useUi } from "@/context/UiContext";
import { errorMessage } from "@/lib/api";

interface PasswordModalProps {
  onChangePassword: (current: string, next: string) => Promise<void>;
}

export function PasswordModal({ onChangePassword }: PasswordModalProps) {
  const { closeOverlay, toast } = useUi();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  return (
    <ModalContent
      title="Change password"
      okLabel="Update"
      onSubmit={async () => {
        if (next.length < 6) return toast("New password must be at least 6 characters");
        try {
          await onChangePassword(current, next);
          closeOverlay();
          toast("Password updated.");
        } catch (e) {
          toast(errorMessage(e));
        }
      }}
    >
      <Label>Current password</Label>
      <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      <Label>New password</Label>
      <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
    </ModalContent>
  );
}
