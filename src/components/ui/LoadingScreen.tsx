import { Leaf } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="grid min-h-dvh place-items-center p-5 text-mut" role="status">
      <div className="flex flex-col items-center gap-3">
        <span className="grid h-14 w-14 animate-pulse place-items-center rounded-2xl bg-ac text-white">
          <Leaf size={28} />
        </span>
        Loading…
      </div>
    </div>
  );
}
