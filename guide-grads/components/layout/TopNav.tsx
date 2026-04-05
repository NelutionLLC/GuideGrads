"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

export default function TopNav() {
  const { user, loading, signOut } = useAuth();

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
          <>
            <span className="hidden max-w-[140px] truncate text-sm text-white/70 sm:inline">
              {user.email}
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-full border border-white/30 px-4 py-2 text-sm hover:bg-white/10"
            >
              Log out
            </button>
          </>
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
