"use client";

import { useState } from "react";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { ModalContent } from "@/components/ui/Overlays";
import { useWard } from "@/context/WardContext";
import { useUi } from "@/context/UiContext";
import shared from "@/data/shared/options.json";

export function NewUpdateModal() {
  const { addUpdate } = useWard();
  const { closeOverlay, toast } = useUi();
  const [category, setCategory] = useState(shared.updateCategories[0]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const submit = () => {
    if (!title) return toast("Add a title");
    addUpdate({ category, title, message });
    closeOverlay();
    toast("Update published successfully.");
  };

  return (
    <ModalContent title="New update" okLabel="Publish" onSubmit={submit}>
      <Label>Category</Label>
      <Select options={shared.updateCategories} value={category} onChange={setCategory} />
      <Label>Title</Label>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      <Label>Message</Label>
      <Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
    </ModalContent>
  );
}
