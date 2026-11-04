"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { NavItem, PortalUser } from "@/lib/types";

interface SidebarProps {
  brand: React.ReactNode;
  /** Optional block under the brand, e.g. the ward badge. */
  badge?: React.ReactNode;
  nav: NavItem[];
  user: PortalUser;
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ brand, badge, nav, user, open, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col gap-3 overflow-y-auto bg-surface px-3 py-4 transition-transform",
        "lg:static lg:z-auto lg:w-auto lg:translate-x-0 lg:rounded-2xl lg:border lg:border-line",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {brand}
      {badge}
      <nav className="flex flex-1 flex-col gap-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] transition-colors",
                active ? "bg-tint font-semibold text-brand-strong [&>svg]:text-brand" : "text-ink hover:bg-hover"
              )}
            >
              <Icon className="size-[18px] flex-none" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-2.5 rounded-xl border border-line p-2.5">
        <span className="grid size-9 flex-none place-items-center rounded-full bg-tint text-xs font-bold text-brand-strong">{user.initials}</span>
        <div className="min-w-0">
          <b className="block truncate text-[13px]">{user.name}</b>
          <small className="block text-xs text-muted">{user.role}</small>
        </div>
      </div>
    </aside>
  );
}

/** Logo block used at the top of the sidebar. */
export function Brand({ icon, title, subtitle }: { icon: React.ReactNode; title: React.ReactNode; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5 px-1.5 pb-2 font-bold leading-tight">
      <span className="grid size-10 flex-none place-items-center rounded-[10px] bg-brand text-white [&>svg]:size-[22px]">{icon}</span>
      <div className="min-w-0">
        {title}
        {subtitle && <small className="block text-xs font-normal text-muted">{subtitle}</small>}
      </div>
    </div>
  );
}
