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
      <button type="button" onClick={toggle} className="flex cursor-pointer items-center gap-1 bg-transparent" aria-expanded={open}>
        <Bell size={16} className="sm:hidden" aria-hidden />
        <span className="max-sm:sr-only">Notifications</span>
        {count > 0 && <b className="ml-1 rounded-[9px] bg-bad px-1.5 text-[11px] text-white">{count}</b>}
      </button>
      {open && (
        <div className="absolute right-3 top-[54px] z-[5] w-[min(340px,calc(100vw-24px))] rounded-[10px] border border-line bg-surface p-3 md:right-8">
          <h3>Notifications</h3>
          {notifications.map((n, i) => (
            <Link
              key={`${n.text}-${i}`}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block cursor-pointer border-b border-line px-1 py-2 text-[13px]"
            >
              {n.text}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
