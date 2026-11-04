"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { ToastProvider } from "@/context/ToastContext";
import { TODAY_LABEL } from "@/data/shared";
import type { NavItem, PortalUser } from "@/lib/types";

interface PortalShellProps {
  portal: "kmc" | "ward";
  /** Short name shown in the mobile top bar. */
  name: string;
  brand: React.ReactNode;
  badge?: React.ReactNode;
  nav: NavItem[];
  user: PortalUser;
  /** Extra content at the right end of the page header (e.g. artwork). */
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}

export function PortalShell({ portal, name, brand, badge, nav, user, headerExtra, children }: PortalShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const page = nav.find((n) => n.href === pathname) ?? nav[0];

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <ToastProvider>
      <div data-portal={portal} className="min-h-dvh bg-canvas text-ink lg:grid lg:h-dvh lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-3 lg:p-3">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-surface px-4 py-2 lg:hidden">
          <button type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)} className="rounded-md p-1 hover:bg-hover">
            <Menu className="size-6" />
          </button>
          <b className="truncate">{name}</b>
        </div>

        {menuOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} />}
        <Sidebar brand={brand} badge={badge} nav={nav} user={user} open={menuOpen} onNavigate={() => setMenuOpen(false)} />

        <main className="flex min-w-0 flex-col gap-3 p-4 lg:min-h-0 lg:overflow-y-auto lg:p-0 lg:pr-1">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-[26px] leading-tight font-bold">{page.title}</h1>
              <p className="mt-0.5 text-muted">{page.subtitle}</p>
              {page.note && <p className="text-muted">{page.note}</p>}
            </div>
            <div className="flex items-center gap-4 text-muted">
              <span className="relative" aria-label="Notifications">
                <Bell className="size-5" />
                <i className="absolute -top-0.5 right-0 size-2 rounded-full bg-danger" />
              </span>
              <span className="flex items-center gap-1.5 text-[13px]">
                <CalendarDays className="size-4" />
                {TODAY_LABEL}
              </span>
              {headerExtra}
            </div>
          </header>
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
