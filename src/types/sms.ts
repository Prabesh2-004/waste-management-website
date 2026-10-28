export interface Subscriber {
  id: number;
  name: string;
  phone: string;
  ward: number;
  created_at: string;
}

export type SmsKind = "manual" | "test" | "schedule" | "delay" | "program";

export interface SmsMessage {
  id: number;
  phone: string;
  body: string;
  ward: number | null;
  kind: SmsKind;
  status: "sent" | "failed";
  provider: string;
  ref: string | null;
  error: string | null;
  created_at: string;
}

export interface SmsOverview {
  /** "dummy" logs messages without delivering them. */
  provider: string;
  subscribers: Subscriber[];
  messages: SmsMessage[];
  summary: { subscribers: number; sent: number; failed: number };
}

export interface SmsSendResult {
  sent: number;
  failed: number;
  messages: SmsMessage[];
}
