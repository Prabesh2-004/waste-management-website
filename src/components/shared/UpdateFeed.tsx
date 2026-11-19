import { Award, BookOpen, CalendarDays, Megaphone, Newspaper, Truck } from "lucide-react";
import { Pill } from "@/components/ui/Status";
import { cn } from "@/lib/cn";
import type { Tone, UpdateItem } from "@/types";

interface UpdateFeedProps {
  items: UpdateItem[];
  footer: (item: UpdateItem) => string;
}

const CATEGORY: Record<string, { icon: typeof Truck; tone: Tone; tint: string }> = {
  Collection: { icon: Truck, tone: "G", tint: "bg-ok-soft text-ok" },
  Awareness: { icon: Megaphone, tone: "P", tint: "bg-violet-soft text-violet" },
  Guidance: { icon: BookOpen, tone: "B", tint: "bg-info-soft text-info" },
  Announcements: { icon: Newspaper, tone: "A", tint: "bg-warn-soft text-warn" },
  Milestones: { icon: Award, tone: "G", tint: "bg-ac-soft text-ac" },
};

export function UpdateFeed({ items, footer }: UpdateFeedProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((u) => {
        const c = CATEGORY[u.c] ?? { icon: Newspaper, tone: "" as Tone, tint: "bg-ac-soft text-ac" };
        const Icon = c.icon;
        return (
          <article key={u.id} className="flex gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
            <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", c.tint)}>
              <Icon size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={c.tone}>{u.c}</Pill>
                <span className="flex items-center gap-1 text-xs text-mut">
                  <CalendarDays size={12} /> {u.d}
                </span>
              </div>
              <b className="mt-1.5 block leading-snug">{u.t}</b>
              {u.b && <p className="my-1 text-sm text-mut">{u.b}</p>}
              <div className="text-xs text-mut">{footer(u)}</div>
            </div>
          </article>
        );
      })}
      {items.length === 0 && <p className="text-mut">No updates in this category.</p>}
    </div>
  );
}
