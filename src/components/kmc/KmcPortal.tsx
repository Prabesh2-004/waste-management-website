"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RedirectToLogin } from "@/components/auth/RedirectToLogin";
import { SessionError } from "@/components/auth/SessionError";
import { GoToWard } from "./GoToWard";
import { KmcProvider, useKmc } from "@/context/KmcContext";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { OverlayHost, UiProvider } from "@/context/UiContext";
import navigation from "@/data/kmc/navigation.json";

function KmcGate({ children }: { children: React.ReactNode }) {
  const { ready, loadError, authed, user, notifications, seen, markSeen } = useKmc();

  if (!ready) return <LoadingScreen />;
  if (loadError) return <SessionError message={loadError} />;
  if (!authed) return <RedirectToLogin portal="kmc" />;

  return (
    <AppShell
      title="Kathmandu Metropolitan City"
      subtitle="KMC Administrative Portal"
      navigation={navigation}
      topbarLeft={<GoToWard />}
      notifications={notifications}
      seen={seen}
      onNotificationsOpen={markSeen}
      userName={user.name}
      userRole={user.role}
      pageWidthClass="max-w-[1320px]"
    >
      {children}
    </AppShell>
  );
}

export function KmcPortal({ children }: { children: React.ReactNode }) {
  return (
    <UiProvider toastMs={3200}>
      <KmcProvider>
        <KmcGate>{children}</KmcGate>
        {/* Inside the data provider, so drawers and modals can read its data. */}
        <OverlayHost />
      </KmcProvider>
    </UiProvider>
  );
}
