"use client";

import { ModalContent } from "@/components/ui/Overlays";

export function LogoutModal() {
  return (
    <ModalContent title="Log out?" okLabel="Log out" onSubmit={() => window.location.reload()}>
      <p>You will return to the login screen.</p>
    </ModalContent>
  );
}
