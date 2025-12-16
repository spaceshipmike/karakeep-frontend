"use client";

import { useState, Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import type { List } from "@/types";

interface AppShellProps {
  lists: List[];
  children: React.ReactNode;
}

export function AppShell({ lists, children }: AppShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Desktop Sidebar - Suspense needed for useSearchParams */}
      <Suspense fallback={<div className="fixed inset-y-0 left-0 hidden w-64 border-r border-sidebar-border bg-sidebar md:block" />}>
        <Sidebar lists={lists} className="fixed inset-y-0 left-0 hidden md:flex" />
      </Suspense>

      {/* Mobile Navigation - Suspense needed for useSearchParams */}
      <Suspense fallback={null}>
        <MobileNav
          lists={lists}
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
        />
      </Suspense>

      {/* Main content area */}
      <div className="flex min-h-screen flex-col md:pl-64">
        <Header
          showMenuButton
          onMenuToggle={() => setIsMobileNavOpen(true)}
        />

        {/* Main content */}
        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
