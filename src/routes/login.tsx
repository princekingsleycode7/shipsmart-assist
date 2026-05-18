import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        nav({ to: "/" });
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="font-display text-4xl"><em>{mode === "signin" ? "Welcome back" : "Create account"}</em></h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to save your AI chats and reach our live support team.</p>
      <form onSubmit={submit} className="card-soft mt-6 space-y-3 p-6">
        <label className="block text-sm">
          <span className="text-muted-foreground">Email</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Password</span>
          <input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" />
        </label>
        <button disabled={busy} className="w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground disabled:opacity-50">
          {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
        <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
          {mode === "signin" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
