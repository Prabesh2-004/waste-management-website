"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Skyline } from "@/components/brand/Brand";
import { useUi } from "@/context/UiContext";
import { cn } from "@/lib/cn";
import type { NotificationItem } from "@/types";
import { ThemeToggle } from "@/components/kit/ThemeToggle";

export interface MobileNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface MobileShellProps {
  /** Content of the green header (greeting, title, ward…). */
  header: React.ReactNode;
  nav: MobileNavItem[];
  notifications: NotificationItem[];
  unread: number;
  onNotificationsOpen: () => void;
  /** Extra button(s) next to the bell. */
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

function NotificationSheet({ items }: { items: NotificationItem[] }) {
  const { closeOverlay } = useUi();
  return (
    <>
      <h2>Notifications</h2>
      {items.length === 0 && <p className="text-mut">Nothing new.</p>}
      {items.map((n, i) => (
        <Link key={`${n.text}-${i}`} href={n.href} onClick={closeOverlay} className="block border-b border-line py-3 text-sm last:border-b-0">
          {n.text}
        </Link>
      ))}
    </>
  );
}

/** Phone layout shared by the citizen and driver sections. On a desktop it is shown as a phone-width column. */
export function MobileShell({ header, nav, notifications, unread, onNotificationsOpen, headerAction, children }: MobileShellProps) {
  const pathname = usePathname();
  const { openDrawer } = useUi();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const active = (href: string) => (href.split("/").length <= 2 ? pathname === href : pathname.startsWith(href));

  return (
    <div className="min-h-dvh bg-canvas md:bg-[radial-gradient(circle_at_20%_10%,var(--color-ac-soft),transparent_45%),var(--bg)] md:py-6">
      <p className="mx-auto mb-3 hidden max-w-[480px] items-center justify-center gap-2 text-[13px] text-mut md:flex">
        <Smartphone size={15} /> Made for phones · open this page on your phone for GPS and camera
      </p>
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-canvas md:min-h-[calc(100dvh-84px)] md:overflow-hidden md:rounded-[32px] md:border md:border-line md:shadow-2xl">
        <header className="relative overflow-hidden bg-ac px-5 pb-10 pt-[max(18px,env(safe-area-inset-top))] text-white">
          <Skyline className="absolute bottom-0 right-0 h-20 w-72 text-white/15" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">{header}</div>
            <div className="flex shrink-0 items-center gap-2">
              {headerAction}
              <ThemeToggle variant="onAccent" />
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  onNotificationsOpen();
                  openDrawer(<NotificationSheet items={notifications} />);
                }}
                className="relative grid h-11 w-11 place-items-center rounded-full bg-white/15 active:scale-95"
              >
                <Bell size={21} />
                {unread > 0 && (
                  <b className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#f97316] px-1 text-[10px]">{unread}</b>
                )}
              </button>
            </div>
          </div>
        </header>
        <main className="relative -mt-6 flex-1 rounded-t-[28px] bg-canvas px-4 pb-[calc(96px+env(safe-area-inset-bottom))] pt-5">{children}</main>
        <nav
          aria-label="Sections"
          className="fixed bottom-0 left-1/2 z-[6] grid w-full max-w-[480px] -translate-x-1/2 border-t border-line bg-surface/95 px-1 pb-[max(8px,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur md:absolute md:rounded-b-[32px]"
          style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}
        >
          {nav.map((n) => {
            const Icon = n.icon;
            const on = active(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={on ? "page" : undefined}
                className={cn("flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium", on ? "text-ac" : "text-mut")}
              >
                <Icon size={22} strokeWidth={on ? 2.4 : 1.8} />
                {n.label}
                <span className={cn("mt-0.5 h-[3px] w-6 rounded-full", on ? "bg-ac" : "bg-transparent")} />
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

/** Large tappable card row used across the mobile sections. */
export function TapCard({
  icon,
  title,
  subtitle,
  right,
  onClick,
  href,
  tone = "",
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  tone?: "" | "warn" | "bad";
  className?: string;
}) {
  const body = (
    <>
      {icon && (
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-2xl",
            tone === "warn" ? "bg-warn-soft text-warn" : tone === "bad" ? "bg-bad-soft text-bad" : "bg-ac-soft text-ac"
          )}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <b className="block truncate">{title}</b>
        {subtitle && <span className="block text-[13px] text-mut">{subtitle}</span>}
      </span>
      {right}
    </>
  );
  const cls = cn(
    "flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 text-left shadow-card transition-colors",
    (onClick || href) && "hover:border-ac active:scale-[0.99]",
    className
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {body}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {body}
      </button>
    );
  }
  return <div className={cls}>{body}</div>;
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-2.5 mt-6 flex items-center justify-between">
      <h2 className="m-0 text-[17px]">{children}</h2>
      {action}
    </div>
  );
}
