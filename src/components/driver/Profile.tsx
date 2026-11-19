"use client";

import { KeyRound, LogOut, MapPinned, Truck, UserRound } from "lucide-react";
import { Button } from "@/components/kit/Button";
import { LogoutModal } from "@/components/shared/LogoutModal";
import { PasswordModal } from "@/components/shared/PasswordModal";
import { useDriver } from "@/context/DriverContext";
import { useUi } from "@/context/UiContext";
import { cn } from "@/lib/cn";
import { GpsChip } from "./DriverPortal";

export function DriverProfile() {
  const { user, state, call, sharing, setSharing } = useDriver();
  const { openModal } = useUi();
  if (!user || !state) return null;
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
      <div className="rounded-3xl border border-line bg-surface p-4 shadow-card">
        <h3>My vehicles</h3>
        {state.vehicles.length === 0 && <p className="m-0 text-sm text-mut">None assigned. Ward staff assign vehicles to drivers by name.</p>}
        {state.vehicles.map((v) => (
          <div key={v.id} className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0">
            <Truck size={20} className="text-ac" />
            <span className="flex-1">
              <b>{v.id}</b> <span className="text-sm text-mut">· {v.cap} t · {v.st}</span>
            </span>
            <span className="text-xs text-mut">{v.ward ? `Ward ${v.ward}` : ""}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-3xl border border-line bg-surface p-4 shadow-card">
        <div className="flex items-center gap-3">
          <MapPinned size={22} className="shrink-0 text-ac" />
          <div className="min-w-0 flex-1">
            <b className="block">Share live location</b>
            <span className="text-[13px] text-mut">Your ward office, KMC and residents of the ward see your truck on the map.</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={sharing}
            aria-label="Share live location"
            onClick={() => setSharing(!sharing)}
            className={cn("relative h-8 w-14 shrink-0 rounded-full transition-colors", sharing ? "bg-ac" : "bg-line")}
          >
            <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-[left]", sharing ? "left-7" : "left-1")} />
          </button>
        </div>
        <div className="mt-2">
          <GpsChip />
        </div>
      </div>
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
