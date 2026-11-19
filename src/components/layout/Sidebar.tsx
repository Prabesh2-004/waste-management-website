"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, Bell, FileText, LayoutDashboard, LogOut, Map, Megaphone, MessageSquareText, Newspaper, ScanLine, Settings, Truck,
} from "lucide-react";
import { Logo, Skyline } from "@/components/brand/Brand";
import { useUi } from "@/context/UiContext";
import { LogoutModal } from "@/components/shared/LogoutModal";
import { cn } from "@/lib/cn";
import type { Navigation } from "@/types";

const ICONS: Record<string, typeof Truck> = {
  dashboard: LayoutDashboard,
  collection: Truck,
  awareness: Megaphone,
  updates: Newspaper,
  reports: FileText,
  identify: ScanLine,
  sms: MessageSquareText,
  wards: BarChart3,
  settings: Settings,
  map: Map,
};

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

interface SidebarProps {
  title: string;
  subtitle: string;
  navigation: Navigation;
  wardBadge?: React.ReactNode;
  userName: string;
  userRole: string;
  open: boolean;
  onNavigate: () => void;
}

function NavItem({ href, label, active, onClick }: { href: string; label: string; active: boolean; onClick: () => void }) {
  const Icon = ICONS[href.split("/").pop() ?? ""] ?? Bell;
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors",
        active ? "bg-ac-soft font-semibold text-ac" : "text-ink/80 hover:bg-ac-faint hover:text-ac"
      )}
    >
      <Icon size={19} strokeWidth={active ? 2.3 : 1.9} className="shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function Sidebar({ title, subtitle, navigation, wardBadge, userName, userRole, open, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { openModal } = useUi();
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-[8] flex w-[264px] flex-col overflow-y-auto border-r border-line bg-surface px-3.5 pb-4 pt-[max(20px,env(safe-area-inset-top))] transition-transform md:w-[232px] md:translate-x-0 lg:w-[264px]",
        open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}
    >
      <div className="mb-5 flex items-center gap-3 px-1.5">
        <Logo size={42} />
        <div className="min-w-0">
          <b className="block truncate leading-tight text-ac">{title}</b>
          <span className="block truncate text-xs text-mut">{subtitle}</span>
        </div>
      </div>
      {wardBadge && <div className="mb-4">{wardBadge}</div>}
      <nav className="flex flex-1 flex-col gap-0.5">
        {navigation.main.map((n) => (
          <NavItem key={n.href} href={n.href} label={n.label} active={pathname === n.href} onClick={onNavigate} />
        ))}
        <div className="my-2 border-t border-line" />
        <NavItem
          href={navigation.secondary.href}
          label={navigation.secondary.label}
          active={pathname === navigation.secondary.href}
          onClick={onNavigate}
        />
      </nav>
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-ac-wash p-3">
        <Skyline className="absolute bottom-0 right-0 h-10 w-40 text-ac/20" />
        <div className="relative flex items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ac-soft text-sm font-bold text-ac">{initials(userName)}</span>
          <div className="min-w-0 flex-1">
            <b className="block truncate text-sm">{userName}</b>
            <span className="block truncate text-xs text-mut">{userRole}</span>
          </div>
          <button
            type="button"
            aria-label="Log out"
            title="Log out"
            onClick={() => openModal(<LogoutModal />)}
            className="grid h-9 w-9 place-items-center rounded-xl text-mut hover:bg-surface hover:text-bad"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
