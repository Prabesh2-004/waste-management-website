"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoToWard } from "./GoToWard";
import { KmcProvider, useKmc } from "@/context/KmcContext";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { UiProvider } from "@/context/UiContext";
import navigation from "@/data/kmc/navigation.json";
import userData from "@/data/kmc/user.json";

function KmcGate({ children }: { children: React.ReactNode }) {
  const { ready, authed, signIn, user, notifications, seen, markSeen } = useKmc();
  const router = useRouter();

  if (!ready) return <LoadingScreen />;

  if (!authed) {
    return (
      <AuthCard
        portalLabel="KMC staff portal"
        rolePlaceholder="e.g. Solid Waste Officer"
        fallbackRole="KMC Staff"
        defaultEmail={userData.email}
        onAuthenticate={async (mode, profile, password) => {
          await signIn(mode, profile, password);
          router.push("/kmc/dashboard");
        }}
      />
    );
  }

  return (
    <AppShell
      subtitle="Kathmandu Metropolitan City"
      navigation={navigation}
      topbarLeft={<GoToWard />}
      notifications={notifications}
      seen={seen}
      onNotificationsOpen={markSeen}
      userName={user.name}
      pageWidthClass="max-w-[1180px]"
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
      </KmcProvider>
    </UiProvider>
  );
}
