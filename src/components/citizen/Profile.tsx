"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { KeyRound, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/kit/Button";
import { Input, Label, Select } from "@/components/kit/Field";
import { LogoutModal } from "@/components/shared/LogoutModal";
import { PasswordModal } from "@/components/shared/PasswordModal";
import { useCitizen } from "@/context/CitizenContext";
import { useUi } from "@/context/UiContext";
import { errorMessage } from "@/lib/api";
import { wardLabel, wardOptions } from "@/lib/format";
import meta from "@/data/shared/meta.json";

export function CitizenProfile() {
  const { user, state, saveProfile, call } = useCitizen();
  const { toast, openModal } = useUi();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone?.replace(/^\+977/, "") ?? "");
  const [ward, setWard] = useState(wardLabel(state?.ward.n ?? 1));
  const [busy, setBusy] = useState(false);
  if (!user || !state) return null;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast("Enter your name");
    setBusy(true);
    try {
      await saveProfile({ name: name.trim(), phone: phone.trim(), ward: Number(ward.slice(5)) });
      toast("Profile saved");
    } catch (err) {
      toast(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ac-soft text-ac">
          <UserRound size={26} />
        </span>
        <div className="min-w-0">
          <h1 className="m-0 truncate text-2xl">{user.name}</h1>
          <span className="text-sm text-mut">{user.email}</span>
        </div>
      </div>
      <form onSubmit={save} className="rounded-3xl border border-line bg-surface p-4 shadow-card">
        <Label htmlFor="p-name" className="mt-0">
          Name
        </Label>
        <Input id="p-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        <Label htmlFor="p-ward">My ward</Label>
        <Select id="p-ward" options={wardOptions(meta.wardCount)} value={ward} onChange={setWard} />
        <p className="mb-0 mt-1 text-xs text-mut">Your collection times, truck tracking and programs follow this ward.</p>
        <Label htmlFor="p-phone">Mobile number (for SMS reminders)</Label>
        <Input id="p-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button type="submit" block className="mt-5" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </form>
      <div className="mt-4 space-y-2.5">
        <Button
          block
          variant="outline"
          onClick={() =>
            openModal(
              <PasswordModal
                onChangePassword={(current, next) =>
                  call("/api/v1/me/password", { method: "POST", body: { current_password: current, new_password: next } }).then(() => undefined)
                }
              />
            )
          }
        >
          <KeyRound size={17} /> Change password
        </Button>
        <Button block variant="danger" onClick={() => openModal(<LogoutModal />)}>
          <LogOut size={17} /> Log out
        </Button>
      </div>
    </>
  );
}
