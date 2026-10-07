"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { NotificationMenu } from "./NotificationMenu";
import type { Navigation, NotificationItem } from "@/types";

interface AppShellProps {
  subtitle: string;
  navigation: Navigation;
  wardBadge?: string;
  topbarLeft: React.ReactNode;
  notifications: NotificationItem[];
  seen: boolean;
  onNotificationsOpen: () => void;
  userName: string;
  pageWidthClass: string;
  children: React.ReactNode;
}

export function AppShell({
  subtitle,
  navigation,
  wardBadge,
  topbarLeft,
  notifications,
  seen,
  onNotificationsOpen,
  userName,
  pageWidthClass,
  children,
}: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      {menuOpen && <div className="fixed inset-0 z-[7] bg-[#0007] md:hidden" onClick={() => setMenuOpen(false)} />}
      <Sidebar subtitle={subtitle} navigation={navigation} wardBadge={wardBadge} open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <div className="relative md:ml-[180px] lg:ml-56">
        <div className="flex items-center justify-between gap-[18px] border-b border-line bg-surface px-4 py-2.5 md:px-8">
          <div className="flex min-w-0 items-center gap-3 md:gap-[18px]">
            <button
              type="button"
              className="cursor-pointer bg-transparent md:hidden"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
            {topbarLeft}
          </div>
          <div className="flex shrink-0 items-center gap-[18px]">
            <NotificationMenu notifications={notifications} seen={seen} onOpen={onNotificationsOpen} />
            <span className="max-w-[120px] truncate text-[13px] max-sm:hidden md:max-w-none">{userName}</span>
          </div>
        </div>
        <div className={`px-4 py-5 sm:p-5 lg:px-8 lg:py-7 ${pageWidthClass}`}>{children}</div>
      </div>
    </div>
  );
}
