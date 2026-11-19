"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Bot, Leaf, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { IdentifyWaste } from "@/components/shared/IdentifyWaste";
import { Segmented } from "@/components/kit/Tabs";
import { useCitizen } from "@/context/CitizenContext";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/format";
import { dayLabel, nextCollection } from "@/lib/schedule";
import { SUGGESTED, answer } from "@/lib/wasteFaq";

interface Message {
  from: "me" | "bot";
  lines: string[];
  at: string;
}

const now = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

function Ask() {
  const { state } = useCitizen();
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", lines: ["Namaste! 👋", "I can help with common waste questions. What would you like to know?"], at: now() },
  ]);
  const [text, setText] = useState("");
  const [rated, setRated] = useState<Record<number, boolean>>({});
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const ask = (q: string) => {
    const question = q.trim();
    if (!question) return;
    const ward = state?.ward;
    const line = ward
      ? `Ward ${ward.n}'s next collection is ${dayLabel(nextCollection(ward.time, ward.status)).toLowerCase()} at ${formatTime(ward.time)} (${ward.kind}).`
      : undefined;
    setMessages((m) => [...m, { from: "me", lines: [question], at: now() }, { from: "bot", lines: answer(question, line), at: now() }]);
    setText("");
  };

  return (
    <div className="flex flex-col">
      <div className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-2.5", m.from === "me" && "justify-end")}>
            {m.from === "bot" && (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ac-soft text-ac">
                <Bot size={18} />
              </span>
            )}
            <div className="max-w-[82%]">
              <div className={cn("rounded-3xl px-4 py-3 text-[15px]", m.from === "me" ? "rounded-br-md bg-ac text-white" : "rounded-tl-md bg-surface shadow-card")}>
                {m.lines.map((l, j) => (
                  <p key={j} className="my-0.5">
                    {l}
                  </p>
                ))}
              </div>
              <div className={cn("mt-1 flex items-center gap-2 text-[11px] text-mut", m.from === "me" && "justify-end")}>
                {m.at}
                {m.from === "bot" && i > 0 && (
                  <>
                    <button type="button" aria-label="Helpful" onClick={() => setRated((r) => ({ ...r, [i]: true }))} className={cn(rated[i] === true && "text-ac")}>
                      <ThumbsUp size={14} />
                    </button>
                    <button type="button" aria-label="Not helpful" onClick={() => setRated((r) => ({ ...r, [i]: false }))} className={cn(rated[i] === false && "text-bad")}>
                      <ThumbsDown size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {messages.length < 3 && (
          <div className="pl-11">
            <h3 className="mt-2">You can ask</h3>
            <div className="space-y-2">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => ask(q)}
                  className="flex w-full items-center justify-between gap-2 rounded-2xl bg-ac-soft px-4 py-3 text-left text-sm font-medium text-ac"
                >
                  {q} <ArrowRight size={16} className="shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={end} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(text);
        }}
        className="sticky bottom-[calc(84px+env(safe-area-inset-bottom))] mt-4 flex gap-2 rounded-full border border-line bg-surface p-1.5 shadow-card"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask anything about waste…"
          aria-label="Your question"
          className="min-w-0 flex-1 bg-transparent px-3 outline-none"
        />
        <button type="submit" aria-label="Send" className="grid h-11 w-11 place-items-center rounded-full bg-ac text-white disabled:opacity-50" disabled={!text.trim()}>
          <Send size={18} />
        </button>
      </form>
      <p className="mb-0 mt-2 text-center text-[11px] text-mut">Answers come from KMC&apos;s waste guide, not a live person.</p>
    </div>
  );
}

function IdentifyInner() {
  const { call } = useCitizen();
  const params = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") === "ask" ? "Ask" : "Identify");
  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ac-soft text-ac">
          <Leaf size={26} />
        </span>
        <div>
          <h1 className="m-0 text-2xl">Waste Help</h1>
          <span className="text-sm text-mut">Scan an item live, or ask a question.</span>
        </div>
      </div>
      <Segmented items={["Identify", "Ask"]} active={tab} onChange={setTab} />
      {tab === "Identify" ? <IdentifyWaste call={call} subtitle="" compact /> : <Ask />}
    </>
  );
}

export function CitizenIdentify() {
  return (
    <Suspense>
      <IdentifyInner />
    </Suspense>
  );
}
