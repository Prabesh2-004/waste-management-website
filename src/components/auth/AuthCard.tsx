"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { useUi } from "@/context/UiContext";
import meta from "@/data/shared/meta.json";
import type { UserProfile } from "@/types";

type Mode = "login" | "signup";

interface AuthCardProps {
  portalLabel: string;
  rolePlaceholder: string;
  fallbackRole: string;
  defaultEmail: string;
  onAuthenticate: (mode: Mode, profile: UserProfile) => void;
}

export function AuthCard({ portalLabel, rolePlaceholder, fallbackRole, defaultEmail, onAuthenticate }: AuthCardProps) {
  const [mode, setMode] = useState<Mode>("login");
  return (
    <AuthForm
      key={mode}
      mode={mode}
      setMode={setMode}
      portalLabel={portalLabel}
      rolePlaceholder={rolePlaceholder}
      fallbackRole={fallbackRole}
      defaultEmail={defaultEmail}
      onAuthenticate={onAuthenticate}
    />
  );
}

interface AuthFormProps extends AuthCardProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

function AuthForm({ mode, setMode, portalLabel, rolePlaceholder, fallbackRole, defaultEmail, onAuthenticate }: AuthFormProps) {
  const { toast } = useUi();
  const isLogin = mode === "login";
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState(isLogin ? defaultEmail : "");
  const [password, setPassword] = useState(isLogin ? meta.demoPassword : "");
  const [showPassword, setShowPassword] = useState(false);

  const submit = () => {
    if (!email || !password) return toast("Please enter your email and password");
    if (!isLogin && !name) return toast("Please enter your name");
    if (isLogin && password !== meta.demoPassword) return toast("Invalid password");
    if(isLogin && email !== defaultEmail) return toast("Invalid Email") 
    onAuthenticate(mode, { name, role: role || fallbackRole, email });
  };

  return (
    <div className="grid min-h-screen place-items-center p-5">
      <div className="w-95 max-w-full rounded-xl border border-line bg-surface p-7">
        <h1 className="text-ac">{meta.appName}</h1>
        <p className="text-[13px] text-mut">{portalLabel}</p>
        {!isLogin && (
          <>
            <Label>Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <Label>Role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder={rolePlaceholder} />
          </>
        )}
        <Label>Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Label>Password</Label>
        <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="button" onClick={() => setShowPassword((s) => !s)}>
          {showPassword ? "Hide Password" : "Show Password"}
        </button>
        <p>
          <Button block onClick={submit}>
            {isLogin ? "Log in" : "Create account"}
          </Button>
        </p>
        <p className="text-center text-[13px] text-mut">
          {isLogin ? "New here? " : "Have an account? "}
          <Button variant="link" onClick={() => setMode(isLogin ? "signup" : "login")}>
            {isLogin ? "Sign up" : "Log in"}
          </Button>
        </p>
      </div>
    </div>
  );
}