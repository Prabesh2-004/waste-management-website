import { Chips } from "@/components/ui/Tabs";
import options from "@/data/shared/options.json";

interface ReportFiltersProps {
  status: string;
  category: string;
  onStatus: (v: string) => void;
  onCategory: (v: string) => void;
}

export function ReportFilters({ status, category, onStatus, onCategory }: ReportFiltersProps) {
  return (
    <div className="mb-4 grid gap-1 rounded-2xl border border-line bg-surface px-3 pt-3 shadow-card md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-x-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-mut">Status</span>
      <Chips items={options.reportStatusFilters} active={status} onChange={onStatus} />
      <span className="text-xs font-semibold uppercase tracking-wide text-mut">Type</span>
      <Chips items={options.reportCategoryFilters} active={category} onChange={onCategory} />
    </div>
  );
}
