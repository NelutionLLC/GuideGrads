"use client";

import { SignInWithGoogleButton } from "@/components/auth/SignInWithGoogleButton";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    setPending(true);
    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage("Check your email to confirm, or you are signed in — redirecting…");
      router.push("/");
      router.refresh();
    } catch {
      setMessage("Supabase is not configured. Add .env.local with NEXT_PUBLIC_SUPABASE_* keys.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#071c33] px-4 text-white">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0b223a] p-8 shadow-2xl">
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-white/60">
          Already have one?{" "}
          <Link href="/login" className="text-teal-400 hover:text-teal-300">
            Log in
          </Link>
        </p>

        <div className="mt-6">
          <SignInWithGoogleButton label="Sign up with Google" />
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-white/15" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#0b223a] px-2 text-white/45">or use email</span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/70">Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm outline-none focus:border-teal-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-white/70">Password</label>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm outline-none focus:border-teal-500/50"
            />
          </div>
          {message ? <p className="text-sm text-teal-200/90">{message}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-teal-500 py-2.5 text-sm font-semibold text-white hover:bg-teal-400 disabled:opacity-50"
          >
            {pending ? "…" : "Sign up"}
          </button>
        </form>

        <Link href="/" className="mt-6 block text-center text-sm text-white/50 hover:text-white/80">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
