"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

function profileInitials(user: User): string {
  const name = user.user_metadata?.full_name;
  if (typeof name === "string" && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (
        (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      );
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  const e = user.email ?? "?";
  return e.slice(0, 2).toUpperCase();
}

export default function TopNav() {
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    const onPointer = (e: MouseEvent | PointerEvent) => {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) closeMenu();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [menuOpen, closeMenu]);

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <Link href="/" className="text-2xl font-semibold tracking-tight">
        <span className="text-white">Guide</span>
        <span className="text-teal-400">Grads</span>
      </Link>

      <nav className="hidden items-center gap-8 text-sm text-white/80 md:flex">
        <Link href="/dashboard" className="hover:text-white">
          Dashboard
        </Link>
        <Link href="/resume" className="hover:text-white">
          Resumes
        </Link>
        <Link href="/cover-letters" className="hover:text-white">
          Cover Letters
        </Link>
        <Link href="/jobs" className="hover:text-white">
          Jobs
        </Link>
        <Link href="/immigration" className="hover:text-white">
          Immigration
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        {loading ? (
          <span className="text-sm text-white/40">…</span>
        ) : user ? (
          <div className="relative" ref={wrapRef}>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-white/10 text-sm font-semibold text-white shadow-sm outline-none ring-teal-400/40 transition hover:bg-white/15 focus-visible:ring-2"
              title="Account menu"
            >
              {typeof user.user_metadata?.avatar_url === "string" &&
              user.user_metadata.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                profileInitials(user)
              )}
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,16rem)] rounded-2xl border border-white/15 bg-[#0b223a] py-3 shadow-xl ring-1 ring-black/20"
              >
                <div className="px-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-white/45">Signed in as</p>
                  <p className="mt-1 break-all text-sm text-white/90">{user.email}</p>
                </div>
                <div className="mt-3 border-t border-white/10 pt-2">
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-300 hover:bg-white/10"
                    onClick={() => {
                      closeMenu();
                      void signOut();
                    }}
                  >
                    Log out
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-full border border-white/30 px-4 py-2 text-sm hover:bg-white/10"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-400"
            >
              Free Account
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
