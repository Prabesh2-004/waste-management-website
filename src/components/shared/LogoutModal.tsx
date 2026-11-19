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
        window.location.href = "/";
      }}
    >
      <p className="text-mut">You will return to the login page.</p>
    </ModalContent>
  );
}
