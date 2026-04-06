"use client";

import HomeNavbar from "@/components/layout/TopNav";
// use the SAME navbar component you already use on homepage

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071a2f] to-[#061528]">
      {/* Top navbar (same as home page) */}
      <HomeNavbar />

      <main className="px-6 pb-6 pt-3 sm:px-6 sm:pt-4 sm:pb-6">{children}</main>
    </div>
  );
}
