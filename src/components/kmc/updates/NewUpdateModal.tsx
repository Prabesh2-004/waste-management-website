"use client";

import { useState } from "react";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { ModalContent } from "@/components/ui/Overlays";
import { useKmc } from "@/context/KmcContext";
import { useUi } from "@/context/UiContext";
import { wardOptions } from "@/lib/format";
import meta from "@/data/shared/meta.json";
import shared from "@/data/shared/options.json";

const audiences = ["All wards", ...wardOptions(meta.wardCount)];

export function NewUpdateModal() {
  const { addUpdate } = useKmc();
  const { closeOverlay, toast } = useUi();
  const [category, setCategory] = useState(shared.updateCategories[0]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState(audiences[0]);

  const submit = () => {
    if (!title) return toast("Add a title");
    addUpdate({ category, title, message, audience });
    closeOverlay();
    toast("Update published.");
  };

  return (
    <ModalContent title="New update" okLabel="Publish" onSubmit={submit}>
      <Label>Category</Label>
      <Select options={shared.updateCategories} value={category} onChange={setCategory} />
      <Label>Title</Label>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      <Label>Message</Label>
      <Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
      <Label>Audience</Label>
      <Select options={audiences} value={audience} onChange={setAudience} />
    </ModalContent>
  );
}
