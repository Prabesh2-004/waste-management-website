/** Ward collection runs daily at the ward's scheduled time ("07:00"). */
export function atTime(day: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

/** Next collection: today if the time has not passed or today's collection is still running, otherwise tomorrow. */
export function nextCollection(time: string, wardStatus: string, now = new Date()): Date {
  const today = atTime(now, time);
  const running = wardStatus === "In Progress" || wardStatus === "Delayed";
  if (today.getTime() > now.getTime() || running) return today;
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  return atTime(tomorrow, time);
}

export function upcomingDays(time: string, count: number, now = new Date()): Date[] {
  const first = nextCollection(time, "", now);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(first);
    d.setDate(first.getDate() + i);
    return d;
  });
}

export function dayLabel(d: Date, now = new Date()): string {
  const days = Math.round((atTime(d, "00:00").getTime() - atTime(now, "00:00").getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}
