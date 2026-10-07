"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { Navigation } from "@/types";

interface SidebarProps {
  subtitle: string;
  navigation: Navigation;
  wardBadge?: string;
  open: boolean;
  onNavigate: () => void;
}

function NavItem({ href, label, active, onClick }: { href: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("block cursor-pointer rounded-lg px-3 py-[9px]", active ? "bg-ac-soft font-semibold text-ac" : "text-mut")}
    >
      {label}
    </Link>
  );
}

export function Sidebar({ subtitle, navigation, wardBadge, open, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-[8] flex w-56 flex-col overflow-y-auto border-r border-line bg-surface px-3 py-5 transition-transform md:w-[180px] md:translate-x-0 lg:w-56",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="px-2.5 pb-[18px] font-bold text-ac">
        Kathmandu Waste Management
        <span className="block text-xs font-normal text-mut">{subtitle}</span>
      </div>
      {wardBadge && <div className="mb-4 rounded-lg bg-ac-soft px-3 py-2 font-semibold text-ac">{wardBadge}</div>}
      <nav className="flex-1">
        {navigation.main.map((n) => (
          <NavItem key={n.href} href={n.href} label={n.label} active={pathname === n.href} onClick={onNavigate} />
        ))}
      </nav>
      <nav>
        <NavItem
          href={navigation.secondary.href}
          label={navigation.secondary.label}
          active={pathname === navigation.secondary.href}
          onClick={onNavigate}
        />
      </nav>
    </aside>
  );
}
