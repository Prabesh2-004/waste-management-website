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
    <>
      <Chips items={options.reportStatusFilters} active={status} onChange={onStatus} />
      <Chips items={options.reportCategoryFilters} active={category} onChange={onCategory} />
    </>
  );
}
