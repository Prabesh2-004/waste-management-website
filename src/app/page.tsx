import Link from "next/link";
import { ChevronRight, Landmark, Leaf } from "lucide-react";
import { CITY_NAME } from "@/data/shared";

const PORTALS = [
  {
    href: "/kmc",
    icon: Landmark,
    title: "KMC Waste Management Portal",
    description: "Citywide overview of all 32 wards: vehicle approvals, collection, campaigns, monitoring and complaints.",
  },
  {
    href: "/ward",
    icon: Leaf,
    title: "Ward Waste Management",
    description: "Ward 17 operations: routes and stops, vehicles, awareness programs, updates and complaints.",
  },
];

export default function Home() {
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="w-[480px] max-w-full rounded-2xl border border-line bg-surface p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-brand text-white">
            <Landmark className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold">Kathmandu Waste Management</h1>
            <p className="text-[13px] text-muted">{CITY_NAME}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {PORTALS.map(({ href, icon: Icon, title, description }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl border border-line px-4 py-3.5 transition-colors hover:bg-hover">
              <span className="grid size-10 flex-none place-items-center rounded-full bg-tint text-brand">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block">{title}</b>
                <span className="text-[13px] text-muted">{description}</span>
              </span>
              <ChevronRight className="size-4 flex-none text-muted" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
