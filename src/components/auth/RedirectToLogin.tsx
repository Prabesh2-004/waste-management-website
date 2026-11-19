"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import type { Portal } from "@/lib/api";

/** Sections have no login form of their own: send people to the shared login page. */
export function RedirectToLogin({ portal }: { portal: Portal }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/?role=${portal}`);
  }, [router, portal]);
  return <LoadingScreen />;
}
