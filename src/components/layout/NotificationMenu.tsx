"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import type { NotificationItem } from "@/types";

interface NotificationMenuProps {
  notifications: NotificationItem[];
  seen: boolean;
  onOpen: () => void;
}

export function NotificationMenu({ notifications, seen, onOpen }: NotificationMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const count = seen ? 0 : notifications.length;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const toggle = () => {
    onOpen();
    setOpen((o) => !o);
  };

  return (
    <div ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-xl text-ink hover:bg-ac-faint"
        aria-expanded={open}
      >
        <Bell size={20} aria-hidden />
        {count > 0 && (
          <b className="absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-bad px-1 text-[10px] text-white">{count}</b>
        )}
      </button>
      {open && (
        <div className="absolute right-3 top-[58px] z-[5] max-h-[70dvh] w-[min(360px,calc(100vw-24px))] overflow-auto rounded-2xl border border-line bg-surface p-3 shadow-xl md:right-8">
          <h3>Notifications</h3>
          {notifications.length === 0 && <p className="m-0 px-1 py-2 text-sm text-mut">Nothing new.</p>}
          {notifications.map((n, i) => (
            <Link
              key={`${n.text}-${i}`}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block cursor-pointer rounded-lg border-b border-line px-2 py-2.5 text-[13px] last:border-b-0 hover:bg-ac-faint"
            >
              {n.text}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
