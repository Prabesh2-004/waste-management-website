"use client";

import { Button } from "./Button";
import { useUi } from "@/context/UiContext";

interface DrawerContentProps {
  children: React.ReactNode;
}

export function DrawerContent({ children }: DrawerContentProps) {
  const { closeOverlay } = useUi();
  return (
    <>
      {children}
      <p>
        <Button variant="outline" onClick={closeOverlay}>
          Close
        </Button>
      </p>
    </>
  );
}

interface ModalContentProps {
  title: string;
  okLabel: string;
  onSubmit: () => void;
  children: React.ReactNode;
}

export function ModalContent({ title, okLabel, onSubmit, children }: ModalContentProps) {
  const { closeOverlay } = useUi();
  return (
    <>
      <h2>{title}</h2>
      {children}
      <p className="mt-[18px] flex gap-2">
        <Button onClick={onSubmit}>{okLabel}</Button>
        <Button variant="outline" onClick={closeOverlay}>
          Cancel
        </Button>
      </p>
    </>
  );
}
