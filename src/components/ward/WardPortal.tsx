"use client";

import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { RedirectToLogin } from "@/components/auth/RedirectToLogin";
import { SessionError } from "@/components/auth/SessionError";
import { WardSelectCard } from "@/components/auth/WardSelectCard";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { OverlayHost, UiProvider } from "@/context/UiContext";
import { WardProvider, useWard } from "@/context/WardContext";
import navigation from "@/data/ward/navigation.json";
import meta from "@/data/shared/meta.json";

function WardGate({ children }: { children: React.ReactNode }) {
  const { ready, loadError, authed, needsWardSelection, enterWard, user, wardName, notifications, seen, markSeen } = useWard();
  const router = useRouter();

  if (!ready) return <LoadingScreen />;
  if (loadError) return <SessionError message={loadError} />;

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

  if (!authed) return <RedirectToLogin portal="ward" />;

  return (
    <AppShell
      title="Ward Waste Management"
      subtitle="Ward staff portal"
      navigation={navigation}
      wardBadge={
        <div className="flex items-center gap-3 rounded-2xl bg-ac-soft px-3 py-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-ac text-white">
            <Landmark size={20} />
          </span>
          <div className="min-w-0 leading-tight">
            <b className="block text-ac">{wardName}</b>
            <span className="text-xs text-mut">{meta.cityName}</span>
          </div>
        </div>
      }
      topbarLeft={
        <div className="min-w-0 leading-tight">
          <b className="block truncate">{wardName}</b>
          <span className="block truncate text-xs text-mut">{meta.cityName}</span>
        </div>
      }
      notifications={notifications}
      seen={seen}
      onNotificationsOpen={markSeen}
      userName={user.name}
      userRole={user.role}
      pageWidthClass="max-w-[1240px]"
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
        {/* Inside the data provider, so drawers and modals can read its data. */}
        <OverlayHost />
      </WardProvider>
    </UiProvider>
  );
}
