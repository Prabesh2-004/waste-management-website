"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { AuthCard } from "@/components/auth/AuthCard";
import { WardSelectCard } from "@/components/auth/WardSelectCard";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { UiProvider } from "@/context/UiContext";
import { WardProvider, useWard } from "@/context/WardContext";
import navigation from "@/data/ward/navigation.json";
import userData from "@/data/ward/user.json";
import meta from "@/data/shared/meta.json";

function WardGate({ children }: { children: React.ReactNode }) {
  const { ready, authed, needsWardSelection, signIn, enterWard, user, wardName, notifications, seen, markSeen } = useWard();
  const router = useRouter();

  if (!ready) return <LoadingScreen />;

  if (!authed && needsWardSelection) {
    return (
      <WardSelectCard
        wardCount={meta.wardCount}
        defaultWard={user.ward}
        onContinue={async (ward) => {
          await enterWard(ward);
          router.push("/ward/dashboard");
        }}
      />
    );
  }

  if (!authed) {
    return (
      <AuthCard
        portalLabel="Ward staff portal"
        rolePlaceholder="e.g. Ward Secretary"
        fallbackRole="Ward Staff"
        defaultEmail={userData.email}
        onAuthenticate={signIn}
      />
    );
  }

  return (
    <AppShell
      subtitle="Ward portal"
      navigation={navigation}
      wardBadge={wardName}
      topbarLeft={
        <div className="flex min-w-0 flex-wrap items-center gap-x-[18px]">
          <b>{wardName}</b>
          <span className="truncate text-[13px] text-mut max-sm:hidden">
            {meta.cityName} · {meta.todayLabel}
          </span>
        </div>
      }
      notifications={notifications}
      seen={seen}
      onNotificationsOpen={markSeen}
      userName={user.name}
      pageWidthClass="max-w-[1100px]"
    >
      {children}
    </AppShell>
  );
}

export function WardPortal({ children }: { children: React.ReactNode }) {
  return (
    <UiProvider toastMs={3600}>
      <WardProvider>
        <WardGate>{children}</WardGate>
      </WardProvider>
    </UiProvider>
  );
}
