interface Stat {
  label: string;
  value: string;
}

export function StatStrip({ items }: { items: Stat[] }) {
  return (
    <div className="mb-[22px] grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-line bg-line md:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="bg-surface px-[18px] py-3.5 text-[13px] text-mut">
          {s.label}
          <b className="block text-2xl">{s.value}</b>
        </div>
      ))}
    </div>
  );
}
