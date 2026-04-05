"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

/**
 * Requires Supabase: Authentication → Providers → Google (Client ID + Secret from Google Cloud Console).
 * Google Cloud: OAuth client → Authorized redirect URI = https://<project-ref>.supabase.co/auth/v1/callback
 * Supabase: Authentication → URL configuration → add http://localhost:3000/auth/callback (and production).
 */
export function SignInWithGoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onClick() {
    setError("");
    setPending(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=/`,
        },
      });
      if (err) {
        setError(err.message);
        setPending(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("No redirect URL returned. Enable the Google provider in Supabase.");
    } catch {
      setError("Supabase is not configured or Google sign-in failed to start.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-white/95 disabled:opacity-60"
      >
        <GoogleMark className="shrink-0" />
        {pending ? "Redirecting…" : label}
      </button>
      {error ? <p className="mt-2 text-center text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.42 35.583 29.214 40 24 40c-8.837 0-16-7.163-16-16S15.163 8 24 8c4.065 0 7.563 1.605 10.243 4.195l5.657-5.657C34.607 3.672 29.621 1 24 1 12.955 1 4 9.955 4 21s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c4.065 0 7.563 1.605 10.243 4.195l5.657-5.657C34.607 3.672 29.621 1 24 1 16.318 1 9.656 5.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 43c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 43 24 43z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
