import Link from "next/link";
import meta from "@/data/shared/meta.json";

const portals = [
  { href: "/kmc", title: "KMC staff portal", description: "Monitor all 32 wards, vehicles, programs and complaints." },
  { href: "/ward", title: "Ward staff portal", description: "Manage routes, vehicles, awareness programs and reports for one ward." },
];

export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center p-5">
      <div className="w-[480px] max-w-full rounded-xl border border-line bg-surface p-7">
        <h1 className="text-ac">{meta.appName}</h1>
        <p className="text-[13px] text-mut">{meta.cityName}</p>
        {portals.map((p) => (
          <Link key={p.href} href={p.href} className="mb-3 block rounded-[10px] border border-line px-4 py-3.5 hover:bg-ac-faint">
            <b className="block">{p.title}</b>
            <span className="text-[13px] text-mut">{p.description}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
