"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Building2, Eye, EyeOff, Home, Landmark, Truck } from "lucide-react";
import { Logo } from "@/components/brand/Brand";
import { ValleyScene } from "@/components/brand/ValleyScene";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { authenticate, errorMessage, loadToken, saveToken } from "@/lib/api";
import type { Portal } from "@/lib/api";
import { cn } from "@/lib/cn";
import { wardLabel, wardOptions } from "@/lib/format";
import meta from "@/data/shared/meta.json";
import demoUsers from "@/data/shared/demoUsers.json";

interface Section {
  portal: Portal;
  label: string;
  blurb: string;
  icon: typeof Home;
  rolePlaceholder?: string;
}

const SECTIONS: Section[] = [
  { portal: "citizen", label: "Citizen", blurb: "Collection times, track the truck, report issues", icon: Home },
  { portal: "driver", label: "Driver", blurb: "Today's route, GPS map and stops", icon: Truck },
  { portal: "ward", label: "Ward staff", blurb: "Run collection and programs for a ward", icon: Building2, rolePlaceholder: "e.g. Ward Secretary" },
  { portal: "kmc", label: "KMC staff", blurb: "City-wide view of all 32 wards", icon: Landmark, rolePlaceholder: "e.g. Solid Waste Officer" },
];

const LABEL: Record<Portal, string> = { citizen: "Citizen", driver: "Driver", ward: "Ward staff", kmc: "KMC staff" };

function isPortal(x: string | null): x is Portal {
  return x === "citizen" || x === "driver" || x === "ward" || x === "kmc";
}

export function LoginPage() {
  const params = useSearchParams();
  const initial = params.get("role");
  const [portal, setPortal] = useState<Portal>(isPortal(initial) ? initial : "citizen");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [saved, setSaved] = useState<Portal[]>([]);

  useEffect(() => {
    setSaved((["citizen", "driver", "ward", "kmc"] as Portal[]).filter((p) => loadToken(p)));
  }, []);

  const section = SECTIONS.find((s) => s.portal === portal)!;

  return (
    <main className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[minmax(0,1fr)_520px]">
      {/* Hero: a green band on phones, a full panel on desktop, with the valley drawn behind. */}
      <section className="relative overflow-hidden bg-ac px-5 pb-36 pt-[max(28px,env(safe-area-inset-top))] text-white lg:p-14">
        {/* Phones: a strip under the text (its bottom 40px sits behind the card). Desktop: the whole panel. */}
        <ValleyScene className="absolute inset-x-0 bottom-0 h-[150px] w-full lg:h-full" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.16),transparent_55%)] lg:bg-[linear-gradient(to_bottom,rgb(0_0_0/0.18),transparent_45%)]"
        />
        <div className="relative z-[1] flex items-center gap-3">
          <Logo size={44} className="bg-white/15" />
          <div className="min-w-0 flex-1">
            <b className="block text-lg leading-tight">Clean Kathmandu</b>
            <span className="text-sm text-white/80">{meta.cityName}</span>
          </div>
          <ThemeToggle variant="onAccent" />
        </div>
        <div className="relative z-[1] mt-6 max-w-xl lg:mt-16">
          <h1 className="text-[26px] text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.18)] lg:text-[44px]">Cleaner streets, healthier communities.</h1>
          <p className="mb-0 mt-2 text-white/90 lg:text-lg">
            One sign-in for residents, collection drivers, ward offices and KMC. Choose who you are to continue.
          </p>
        </div>
      </section>

      <section className="relative z-[2] -mt-10 px-4 pb-10 lg:mt-0 lg:flex lg:items-center lg:px-10">
        <div className="mx-auto w-full max-w-[460px] rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
          <h2 className="mb-1 text-xl">{mode === "login" ? "Sign in" : "Create an account"}</h2>
          <p className="mb-4 mt-0 text-sm text-mut">I am a…</p>
          <div role="radiogroup" aria-label="Section" className="grid grid-cols-2 gap-2.5">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = s.portal === portal;
              return (
                <button
                  key={s.portal}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPortal(s.portal)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-colors",
                    active ? "border-ac bg-ac-soft" : "border-line bg-surface hover:border-ac"
                  )}
                >
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", active ? "bg-ac text-white" : "bg-ac-soft text-ac")}>
                    <Icon size={18} />
                  </span>
                  <b className={cn("text-sm leading-tight", active ? "text-ac" : "text-ink")}>{s.label}</b>
                </button>
              );
            })}
          </div>
          <p className="mb-0 mt-2.5 text-[13px] text-mut">{section.blurb}</p>

          <AuthForm key={`${portal}-${mode}`} section={section} mode={mode} setMode={setMode} />

          {saved.length > 0 && (
            <div className="mt-5 border-t border-line pt-4">
              <h3>Already signed in</h3>
              <div className="flex flex-wrap gap-2">
                {saved.map((p) => (
                  <a key={p} href={`/${p}`} className="inline-flex items-center gap-1 rounded-full bg-ac-soft px-3 py-1.5 text-[13px] font-semibold text-ac">
                    Open {LABEL[p]} <ArrowRight size={14} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function AuthForm({ section, mode, setMode }: { section: Section; mode: "login" | "signup"; setMode: (m: "login" | "signup") => void }) {
  const router = useRouter();
  const { portal } = section;
  const isLogin = mode === "login";
  const demoEmail = demoUsers[portal];
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [ward, setWard] = useState(wardLabel(17));
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(isLogin ? demoEmail : "");
  const [password, setPassword] = useState(isLogin ? meta.demoPassword : "");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) return setError("Enter your email and password.");
    if (!isLogin && !name.trim()) return setError("Enter your name.");
    if (!isLogin && password.length < 6) return setError("Password must be at least 6 characters.");
    setBusy(true);
    try {
      const extra = portal === "citizen" && !isLogin ? { ward: Number(ward.slice(5)), phone: phone.trim() || undefined } : {};
      const res = await authenticate(portal, mode, { name: name.trim(), role: role.trim(), email }, password, extra);
      saveToken(portal, res.access_token);
      router.push(`/${portal}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mt-2">
      {!isLogin && (
        <>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          {section.rolePlaceholder && (
            <>
              <Label htmlFor="role">Job title</Label>
              <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder={section.rolePlaceholder} />
            </>
          )}
          {portal === "citizen" && (
            <>
              <Label htmlFor="ward">Your ward</Label>
              <Select id="ward" options={wardOptions(meta.wardCount)} value={ward} onChange={setWard} />
              <Label htmlFor="phone">Mobile number (optional, for SMS reminders)</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="98XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </>
          )}
        </>
      )}
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        inputMode="email"
        autoComplete={isLogin ? "username" : "email"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Label htmlFor="password">Password</Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          autoComplete={isLogin ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pr-12"
        />
        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((s) => !s)}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-mut"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p role="alert" className="mb-0 mt-3 rounded-xl bg-bad-soft px-3 py-2 text-sm text-bad">
          {error}
        </p>
      )}
      <Button type="submit" block size="lg" className="mt-5" disabled={busy}>
        {busy ? "Please wait…" : isLogin ? `Sign in as ${LABEL[portal]}` : "Create account"}
      </Button>
      {isLogin && (
        <p className="mb-0 mt-3 text-center text-xs text-mut">
          Demo account filled in · password <code>{meta.demoPassword}</code>
        </p>
      )}
      <p className="mb-0 mt-3 text-center text-[13px] text-mut">
        {isLogin ? "New here? " : "Have an account? "}
        <Button variant="link" onClick={() => setMode(isLogin ? "signup" : "login")}>
          {isLogin ? "Create an account" : "Sign in"}
        </Button>
      </p>
    </form>
  );
}
