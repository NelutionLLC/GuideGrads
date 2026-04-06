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

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-[14px] w-[18px]" aria-hidden>
      <span
        className={[
          "absolute left-0 top-0 h-0.5 w-full rounded-full bg-white transition-transform duration-200",
          open ? "top-[6px] rotate-45" : "",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-[6px] h-0.5 w-full rounded-full bg-white transition-opacity duration-200",
          open ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-[12px] h-0.5 w-full rounded-full bg-white transition-transform duration-200",
          open ? "top-[6px] -rotate-45" : "",
        ].join(" ")}
      />
    </span>
  );
}

export default function TopNav() {
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mobileWrapRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

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

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileNav();
    };
    const onPointer = (e: MouseEvent | PointerEvent) => {
      const el = mobileWrapRef.current;
      if (el && !el.contains(e.target as Node)) closeMobileNav();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [mobileNavOpen, closeMobileNav]);

  const navLinkClass = "block rounded-xl px-3 py-2.5 text-sm text-white/85 hover:bg-white/10 hover:text-white";

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
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

      {/* Desktop auth */}
      <div className="hidden items-center gap-3 md:flex">
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

      {/* Mobile: hamburger with full nav + auth */}
      <div className="relative md:hidden" ref={mobileWrapRef}>
        <button
          type="button"
          aria-expanded={mobileNavOpen}
          aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileNavOpen((o) => !o)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white outline-none ring-teal-400/40 transition hover:bg-white/15 focus-visible:ring-2"
        >
          <HamburgerIcon open={mobileNavOpen} />
        </button>

        {mobileNavOpen ? (
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,18rem)] overflow-hidden rounded-2xl border border-white/15 bg-[#0b223a] py-2 shadow-xl ring-1 ring-black/20"
          >
            <Link href="/dashboard" className={navLinkClass} onClick={closeMobileNav}>
              Dashboard
            </Link>
            <Link href="/resume" className={navLinkClass} onClick={closeMobileNav}>
              Resumes
            </Link>
            <Link href="/cover-letters" className={navLinkClass} onClick={closeMobileNav}>
              Cover Letters
            </Link>
            <Link href="/jobs" className={navLinkClass} onClick={closeMobileNav}>
              Jobs
            </Link>
            <Link href="/immigration" className={navLinkClass} onClick={closeMobileNav}>
              Immigration
            </Link>

            <div className="my-2 border-t border-white/10" />

            {loading ? (
              <div className="px-3 py-2 text-sm text-white/40">…</div>
            ) : user ? (
              <>
                <div className="px-3 pt-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-white/45">Signed in as</p>
                  <p className="mt-1 break-all text-sm text-white/90">{user.email}</p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  className="mt-2 w-full rounded-xl px-3 py-2.5 text-left text-sm text-red-300 hover:bg-white/10"
                  onClick={() => {
                    closeMobileNav();
                    void signOut();
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-2 pb-2">
                <Link
                  href="/login"
                  className="rounded-xl border border-white/25 px-3 py-2.5 text-center text-sm text-white hover:bg-white/10"
                  onClick={closeMobileNav}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl bg-teal-500 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-teal-400"
                  onClick={closeMobileNav}
                >
                  Free Account
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
