import { Suspense } from "react";
import { LoginPage } from "@/components/auth/LoginPage";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginPage />
    </Suspense>
  );
}
