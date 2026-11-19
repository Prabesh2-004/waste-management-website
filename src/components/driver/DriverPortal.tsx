"use client";

import Link from "next/link";
import { ClipboardList, Home, Map, Route as RouteIcon } from "lucide-react";
import { RedirectToLogin } from "@/components/auth/RedirectToLogin";
import { SessionError } from "@/components/auth/SessionError";
import { MobileShell } from "@/components/mobile/MobileShell";
import { LoadingScreen } from "@/components/kit/LoadingScreen";
import { DriverProvider, useDriver } from "@/context/DriverContext";
import { OverlayHost, UiProvider } from "@/context/UiContext";
import { cn } from "@/lib/cn";
import { firstName, greeting } from "@/lib/schedule";

const NAV = [
  { href: "/driver", label: "Home", icon: Home },
  { href: "/driver/route", label: "Route", icon: Map },
  { href: "/driver/schedule", label: "Schedule", icon: RouteIcon },
  { href: "/driver/records", label: "Records", icon: ClipboardList },
];

export function GpsChip({ light }: { light?: boolean }) {
  const { sharing, gpsStatus } = useDriver();
  const on = sharing && (gpsStatus === "tracking" || gpsStatus === "simulating");
  const label = !sharing ? "GPS off" : gpsStatus === "tracking" ? "GPS live" : gpsStatus === "simulating" ? "Simulated" : gpsStatus === "requesting" ? "Finding GPS…" : "GPS problem";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        light ? "bg-white/15 text-white" : on ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", on ? "animate-pulse bg-[#4ade80]" : "bg-[#fbbf24]")} />
      {label}
    </span>
  );
}

function DriverGate({ children }: { children: React.ReactNode }) {
  const { ready, loadError, user, state, current, unread, markSeen } = useDriver();
  if (!ready) return <LoadingScreen />;
  if (loadError) return <SessionError message={loadError} />;
  if (!user || !state) return <RedirectToLogin portal="driver" />;

  return (
    <MobileShell
      nav={NAV}
      notifications={state.notifications}
      unread={unread}
      onNotificationsOpen={markSeen}
      header={
        <>
          <span className="text-[15px] text-white/85">{greeting()},</span>
          <b className="block truncate text-[26px] leading-tight">{firstName(user.name)}</b>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-white/85">
            <span>Driver{current ? ` · Ward ${current.ward} · ${current.vehicle}` : ""}</span>
            <GpsChip light />
          </div>
        </>
      }
      headerAction={
        <Link href="/driver/profile" aria-label="Profile" className="grid h-11 w-11 place-items-center rounded-full bg-white text-sm font-bold text-ac">
          {user.name
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0])
            .join("")
            .toUpperCase()}
        </Link>
      }
    >
      {children}
    </MobileShell>
  );
}

export function DriverPortal({ children }: { children: React.ReactNode }) {
  return (
    <UiProvider toastMs={3200}>
      <DriverProvider>
        <DriverGate>{children}</DriverGate>
        {/* Inside the data provider, so drawers and modals can read its data. */}
        <OverlayHost />
      </DriverProvider>
    </UiProvider>
  );
}
