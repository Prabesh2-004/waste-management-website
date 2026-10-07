"use client";

import { ModalContent } from "@/components/ui/Overlays";
import { clearTokens } from "@/lib/api";

export function LogoutModal() {
  return (
    <ModalContent
      title="Log out?"
      okLabel="Log out"
      onSubmit={() => {
        clearTokens();
        window.location.reload();
      }}
    >
      <p>You will return to the login screen.</p>
    </ModalContent>
  );
}
