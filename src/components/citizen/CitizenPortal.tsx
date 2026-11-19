"use client";

import Link from "next/link";
import { ChevronDown, Home, MapPin, ScanLine, Truck, Users, FileText } from "lucide-react";
import { RedirectToLogin } from "@/components/auth/RedirectToLogin";
import { SessionError } from "@/components/auth/SessionError";
import { MobileShell } from "@/components/mobile/MobileShell";
import { LoadingScreen } from "@/components/kit/LoadingScreen";
import { CitizenProvider, useCitizen } from "@/context/CitizenContext";
import { OverlayHost, UiProvider } from "@/context/UiContext";
import { firstName, greeting } from "@/lib/schedule";

const NAV = [
  { href: "/citizen", label: "Home", icon: Home },
  { href: "/citizen/collection", label: "Collection", icon: Truck },
  { href: "/citizen/identify", label: "Waste Help", icon: ScanLine },
  { href: "/citizen/community", label: "Community", icon: Users },
  { href: "/citizen/reports", label: "Reports", icon: FileText },
];

function CitizenGate({ children }: { children: React.ReactNode }) {
  const { ready, loadError, user, state, unread, markSeen } = useCitizen();
  if (!ready) return <LoadingScreen />;
  if (loadError) return <SessionError message={loadError} />;
  if (!user || !state) return <RedirectToLogin portal="citizen" />;

  return (
    <MobileShell
      nav={NAV}
      notifications={state.notifications}
      unread={unread}
      onNotificationsOpen={markSeen}
      header={
        <>
          <span className="text-[15px] text-white/85">{greeting()},</span>
          <b className="block truncate text-[26px] leading-tight">{firstName(user.name)} 🌿</b>
          <Link
            href="/citizen/profile"
            className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-medium"
            aria-label="Change ward and profile"
          >
            <MapPin size={15} /> Ward {state.ward.n}, Kathmandu <ChevronDown size={15} />
          </Link>
        </>
      }
      headerAction={
        <Link
          href="/citizen/profile"
          aria-label="Profile"
          className="grid h-11 w-11 place-items-center rounded-full bg-white text-sm font-bold text-ac"
        >
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

export function CitizenPortal({ children }: { children: React.ReactNode }) {
  return (
    <UiProvider toastMs={3200}>
      <CitizenProvider>
        <CitizenGate>{children}</CitizenGate>
        {/* Inside the data provider, so drawers and modals can read its data. */}
        <OverlayHost />
      </CitizenProvider>
    </UiProvider>
  );
}
