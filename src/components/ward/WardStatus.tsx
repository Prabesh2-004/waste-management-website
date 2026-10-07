import { Status } from "@/components/ui/Status";
import { wardTones } from "@/lib/ward";

export function WardStatus({ status, dotOnly }: { status: string; dotOnly?: boolean }) {
  return <Status status={status} tones={wardTones} dotOnly={dotOnly} />;
}
