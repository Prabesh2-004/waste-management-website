"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/kit/Button";
import { clearTokens } from "@/lib/api";

/** Shown when a saved session could not be checked because the server was unreachable. */
export function SessionError({ message }: { message: string }) {
  return (
    <div className="grid min-h-dvh place-items-center p-5">
      <div className="w-[380px] max-w-full rounded-3xl border border-line bg-surface p-6 text-center shadow-card">
        <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-warn-soft text-warn">
          <WifiOff size={26} />
        </span>
        <h2 className="mb-1">Can&apos;t load your account</h2>
        <p className="mt-0 text-sm text-mut">{message}</p>
        <Button block onClick={() => window.location.reload()}>
          Try again
        </Button>
        <Button
          block
          variant="link"
          className="mt-2"
          onClick={() => {
            clearTokens();
            window.location.href = "/";
          }}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
