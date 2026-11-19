"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CalendarDays, Menu } from "lucide-react";
import { Sidebar, initials } from "./Sidebar";
import { NotificationMenu } from "./NotificationMenu";
import { Skyline } from "@/components/brand/Brand";
import type { Navigation, NotificationItem } from "@/types";

interface AppShellProps {
  title: string;
  subtitle: string;
  navigation: Navigation;
  wardBadge?: React.ReactNode;
  topbarLeft: React.ReactNode;
  notifications: NotificationItem[];
  seen: boolean;
  onNotificationsOpen: () => void;
  userName: string;
  userRole: string;
  pageWidthClass: string;
  children: React.ReactNode;
}

function today(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export function AppShell({
  title,
  subtitle,
  navigation,
  wardBadge,
  topbarLeft,
  notifications,
  seen,
  onNotificationsOpen,
  userName,
  userRole,
  pageWidthClass,
  children,
}: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [date, setDate] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    setDate(today());
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-dvh">
      {menuOpen && <div className="fixed inset-0 z-[7] bg-[#0b1f1880] md:hidden" onClick={() => setMenuOpen(false)} />}
      <Sidebar
        title={title}
        subtitle={subtitle}
        navigation={navigation}
        wardBadge={wardBadge}
        userName={userName}
        userRole={userRole}
        open={menuOpen}
        onNavigate={() => setMenuOpen(false)}
      />
      <div className="relative md:ml-[232px] lg:ml-[264px]">
        <header className="sticky top-0 z-[6] flex items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 pb-2.5 pt-[max(10px,env(safe-area-inset-top))] backdrop-blur md:px-8">
          <Skyline className="absolute bottom-0 right-40 hidden h-12 w-72 text-ac/10 xl:block" />
          <div className="relative flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-xl bg-ac-soft text-ac md:hidden"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            {topbarLeft}
          </div>
          <div className="relative flex shrink-0 items-center gap-2 sm:gap-3">
            {date && (
              <span className="hidden items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-[13px] text-mut lg:flex">
                <CalendarDays size={15} /> {date}
              </span>
            )}
            <NotificationMenu notifications={notifications} seen={seen} onOpen={onNotificationsOpen} />
            <span className="hidden items-center gap-2 sm:flex">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ac-soft text-[13px] font-bold text-ac">{initials(userName)}</span>
              <span className="hidden leading-tight xl:block">
                <b className="block text-sm">{userName}</b>
                <span className="text-xs text-mut">{userRole}</span>
              </span>
            </span>
          </div>
        </header>
        <main className={`px-4 py-5 sm:p-6 lg:px-8 lg:py-8 ${pageWidthClass}`}>{children}</main>
      </div>
    </div>
  );
}
