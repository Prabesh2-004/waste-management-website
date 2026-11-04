import { ChevronRight, FileText } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { IconBubble } from "@/components/ui/IconBubble";
import { cn } from "@/lib/cn";

/** Ward page layout: main column plus a right rail on wide screens. */
export function WardPage({ rail, children }: { rail: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid flex-1 gap-3 xl:grid-cols-[minmax(0,1fr)_19rem] 2xl:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="flex min-w-0 flex-col gap-3">{children}</div>
      <div className="flex min-w-0 flex-col gap-3">{rail}</div>
    </div>
  );
}

export interface QuickAction {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <Card>
      <CardHeader title="Quick actions" />
      <div className="flex flex-col gap-2">
        {actions.map((a) => (
          <button
            key={a.title}
            type="button"
            onClick={a.onClick}
            className="flex items-center gap-2.5 rounded-[10px] border border-line bg-surface px-2.5 py-2 text-left transition-colors hover:bg-hover"
          >
            <IconBubble square>{a.icon ?? <FileText />}</IconBubble>
            <span className="min-w-0 flex-1">
              <b className="block text-[13px]">{a.title}</b>
              <small className="text-xs text-muted">{a.description}</small>
            </span>
            <ChevronRight className="size-4 flex-none text-muted" />
          </button>
        ))}
      </div>
    </Card>
  );
}

export function HelpBox({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl bg-tint p-3 text-xs text-[#3f6354]", className)}>
      <b className="block text-[13px] text-ink">{title}</b>
      {children}
    </div>
  );
}
