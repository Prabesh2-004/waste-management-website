export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")}${h < 12 ? " AM" : " PM"}`;
}

export function wardLabel(n: number): string {
  return `Ward ${n}`;
}

export function wardOptions(count: number): string[] {
  return Array.from({ length: count }, (_, i) => wardLabel(i + 1));
}

export function parseWard(label: string): number {
  return Number(label.slice(5));
}

export function parseRoute(label: string): number {
  return Number(label.slice(6));
}
