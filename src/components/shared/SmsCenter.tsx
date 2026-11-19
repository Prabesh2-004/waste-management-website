"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Inbox, MessageSquareText, Radio, Send, Users } from "lucide-react";
import { Box } from "@/components/kit/Box";
import { Button } from "@/components/kit/Button";
import { Input, Label, Select, Textarea } from "@/components/kit/Field";
import { PageHeader } from "@/components/kit/PageHeader";
import { Row } from "@/components/kit/Row";
import { StatStrip } from "@/components/kit/StatStrip";
import { Dot, Pill } from "@/components/kit/Status";
import { Chips } from "@/components/kit/Tabs";
import { useUi } from "@/context/UiContext";
import { errorMessage } from "@/lib/api";
import { parseWard, wardLabel, wardOptions } from "@/lib/format";
import type { SmsKind, SmsOverview, SmsSendResult, Subscriber } from "@/types/sms";

type Call = <T = unknown>(path: string, opts?: { method?: string; body?: unknown }) => Promise<T>;

interface SmsCenterProps {
  call: Call;
  subtitle: string;
  /** Fixed ward (ward portal). */
  ward?: number;
  /** Number of wards to choose from (KMC portal). */
  wardCount?: number;
  /** Inside a portal whose own header already shows the page title. */
  embedded?: boolean;
}

const ALL_WARDS = "All wards";
const KIND: Record<SmsKind, string> = {
  manual: "Broadcast",
  test: "Test",
  schedule: "Schedule change",
  delay: "Delay alert",
  program: "Awareness program",
};
const AUTOMATIC: SmsKind[] = ["schedule", "delay", "program"];
const OUTBOX_FILTERS = ["All", "Automatic", "Broadcast", "Failed"];

function templates(place: string): Record<string, string> {
  return {
    "Collection delayed": `KMC Waste: Collection in ${place} is delayed today. We will text you when the truck is on its way.`,
    "Time change": `KMC Waste: From tomorrow, waste collection in ${place} starts at 7:00 AM. Please keep bins out by then.`,
    "Segregation reminder": `KMC Waste: Please keep biodegradable waste (green bin) and dry/recyclable waste (blue bin) separate.`,
    "Awareness program": `KMC Waste: Join the waste segregation awareness program in ${place} this Saturday, 10 AM, at the ward office.`,
  };
}

/** Same rule as backend app/sms.py: 160 GSM characters per SMS, 70 for Nepali (Unicode) text. */
function smsParts(text: string): { limit: number; parts: number } {
  // eslint-disable-next-line no-control-regex
  const [single, multi] = /^[\x00-\x7f]*$/.test(text) ? [160, 153] : [70, 67];
  return { limit: single, parts: text.length <= single ? 1 : Math.ceil(text.length / multi) };
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/** +9779841234567 -> 984-1234567 */
function localPhone(phone: string): string {
  const d = phone.replace(/^\+977/, "");
  return `${d.slice(0, 3)}-${d.slice(3)}`;
}

export function SmsCenter({ call, subtitle, ward, wardCount, embedded }: SmsCenterProps) {
  const { toast } = useUi();
  const [data, setData] = useState<SmsOverview | null>(null);
  const [wardChoice, setWardChoice] = useState(ALL_WARDS);
  const [message, setMessage] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [filter, setFilter] = useState("All");
  const selectedWard = ward ?? (wardChoice === ALL_WARDS ? undefined : parseWard(wardChoice));
  const place = selectedWard ? wardLabel(selectedWard) : "your ward";

  const load = useCallback(() => {
    call<SmsOverview>(`/api/v1/sms${selectedWard ? `?ward=${selectedWard}` : ""}`)
      .then(setData)
      .catch((e) => toast(errorMessage(e)));
  }, [call, selectedWard, toast]);

  useEffect(load, [load]);

  const send = async (to?: string) => {
    if (!message.trim()) return toast("Write a message first");
    setSending(true);
    try {
      const r = await call<SmsSendResult>("/api/v1/sms/send", {
        method: "POST",
        body: { message, ward: selectedWard ?? null, phone: to ?? null },
      });
      const mode = data?.provider === "dummy" ? " (dummy: logged, not delivered)" : "";
      toast(`${r.sent} SMS sent${r.failed ? `, ${r.failed} failed` : ""}${mode}`);
      if (!to) setMessage("");
      load();
    } catch (e) {
      toast(errorMessage(e));
    } finally {
      setSending(false);
    }
  };

  const addSubscriber = async () => {
    if (!selectedWard) return toast("Choose a ward first");
    try {
      await call<Subscriber>("/api/v1/sms/subscribers", { method: "POST", body: { name, phone, ward: selectedWard } });
      setName("");
      setPhone("");
      toast("Subscriber added");
      load();
    } catch (e) {
      toast(errorMessage(e));
    }
  };

  const removeSubscriber = async (s: Subscriber) => {
    try {
      await call(`/api/v1/sms/subscribers/${s.id}`, { method: "DELETE" });
      toast(`${s.name || localPhone(s.phone)} unsubscribed`);
      load();
    } catch (e) {
      toast(errorMessage(e));
    }
  };

  const s = data?.summary;
  const dummy = data?.provider === "dummy";
  const { limit, parts } = smsParts(message);
  const audience = selectedWard
    ? data?.subscribers.filter((x) => x.ward === selectedWard).length
    : data?.subscribers.length;
  const outbox = (data?.messages ?? []).filter(
    (m) =>
      filter === "All" ||
      (filter === "Automatic" && AUTOMATIC.includes(m.kind)) ||
      (filter === "Broadcast" && (m.kind === "manual" || m.kind === "test")) ||
      (filter === "Failed" && m.status === "failed")
  );

  const gateway = data && (
    <Pill tone={dummy ? "A" : "G"} className="whitespace-normal py-1.5 text-[13px]">
      <Dot tone={dummy ? "A" : "G"} />
      {dummy ? "Dummy mode: messages are logged, not delivered" : `Live: ${data.provider}`}
    </Pill>
  );

  return (
    <>
      {embedded ? gateway && <div className="mb-4">{gateway}</div> : <PageHeader title="SMS Alerts" subtitle={subtitle} action={gateway} />}
      <StatStrip
        items={[
          { label: "Subscribers", value: String(s?.subscribers ?? 0), icon: <Users size={20} /> },
          { label: "SMS sent", value: String(s?.sent ?? 0), icon: <Send size={20} />, tone: "G" },
          { label: "Failed", value: String(s?.failed ?? 0), icon: <AlertCircle size={20} />, tone: "R" },
          { label: "Gateway", value: data ? (dummy ? "Dummy" : data.provider) : "–", icon: <Radio size={20} />, tone: "B" },
        ]}
      />
      {wardCount && (
        <div className="mb-[18px] max-w-xs">
          <Label className="mt-0">Ward</Label>
          <Select options={[ALL_WARDS, ...wardOptions(wardCount)]} value={wardChoice} onChange={setWardChoice} />
        </div>
      )}
      <div className="grid gap-[18px] lg:grid-cols-2">
        <Box title="Send SMS" icon={<MessageSquareText size={18} />}>
          <Label className="mt-0">Templates</Label>
          <Chips items={Object.keys(templates(place))} active="" onChange={(t) => setMessage(templates(place)[t])} />
          <Label htmlFor="sms-message">Message</Label>
          <Textarea id="sms-message" rows={4} value={message} maxLength={640} onChange={(e) => setMessage(e.target.value)} />
          <p className="mt-1 text-[13px] text-mut">
            {message.length} characters · {parts} SMS part{parts > 1 ? "s" : ""} ({limit} per SMS)
          </p>
          <p className="flex flex-wrap gap-2">
            <Button onClick={() => send()} disabled={sending || !audience}>
              {sending ? "Sending…" : `Send to ${audience ?? 0} subscriber${audience === 1 ? "" : "s"}`}
            </Button>
          </p>
          <Label htmlFor="sms-test">Or send a test to one number</Label>
          <div className="flex gap-2">
            <Input id="sms-test" inputMode="tel" placeholder="98XXXXXXXX" value={testPhone} onChange={(e) => setTestPhone(e.target.value)} />
            <Button variant="outline" className="shrink-0" disabled={sending || !testPhone} onClick={() => send(testPhone)}>
              Send test
            </Button>
          </div>
          <p className="mb-0 text-[13px] text-mut">
            Automatic alerts: route delays, collection time changes and announced awareness programs are texted to the ward&apos;s
            subscribers.
          </p>
        </Box>
        <Box title={`Subscribers${data ? ` (${audience ?? 0})` : ""}`} icon={<Users size={18} />}>
          {selectedWard ? (
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Subscriber name" />
              <Input
                placeholder="98XXXXXXXX"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-label="Subscriber phone"
              />
              <Button onClick={addSubscriber} disabled={!phone} className="col-span-2 sm:col-span-1">
                Add
              </Button>
            </div>
          ) : (
            <p className="text-[13px] text-mut">Choose a ward above to add subscribers.</p>
          )}
          <div className="max-h-[340px] overflow-y-auto">
            {data?.subscribers.length ? (
              data.subscribers.map((x) => (
                <Row key={x.id}>
                  <span>
                    {x.name || "Resident"} <span className="text-mut">· {localPhone(x.phone)}</span>
                    {!ward && <span className="text-[13px] text-mut"> · {wardLabel(x.ward)}</span>}
                  </span>
                  <Button variant="link" size="sm" onClick={() => removeSubscriber(x)}>
                    Remove
                  </Button>
                </Row>
              ))
            ) : (
              <p className="text-mut">No subscribers yet.</p>
            )}
          </div>
        </Box>
      </div>
      <Box className="mt-[18px]" title="Outbox" icon={<Inbox size={18} />}>
        <Chips items={OUTBOX_FILTERS} active={filter} onChange={setFilter} />
        {outbox.length ? (
          outbox.map((m) => (
            <Row key={m.id} block>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                <span>
                  <Dot tone={m.status === "sent" ? "G" : "R"} />
                  <b>{KIND[m.kind]}</b>
                  <span className="text-mut">
                    {" "}
                    → {localPhone(m.phone)}
                    {!ward && m.ward ? ` · ${wardLabel(m.ward)}` : ""}
                  </span>
                </span>
                <span className="text-mut">
                  {m.status === "sent" ? (m.provider === "dummy" ? "Logged (dummy)" : "Sent") : "Failed"} · {timeOf(m.created_at)}
                </span>
              </div>
              <div className="mt-1">{m.body}</div>
              {m.error && <div className="mt-1 text-[13px] text-bad">{m.error}</div>}
            </Row>
          ))
        ) : (
          <p className="text-mut">No messages yet.</p>
        )}
      </Box>
    </>
  );
}
