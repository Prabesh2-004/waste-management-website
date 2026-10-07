import { Status } from "@/components/ui/Status";
import { kmcTones } from "@/lib/kmc";

export function KmcStatus({ status, dotOnly }: { status: string; dotOnly?: boolean }) {
  return <Status status={status} tones={kmcTones} dotOnly={dotOnly} />;
}
