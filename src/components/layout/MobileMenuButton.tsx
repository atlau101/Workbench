"use client";

import { useSidebar } from "@/components/layout/SidebarProvider";

export default function MobileMenuButton() {
  const { openSidebar } = useSidebar();

  return (
    <button
      type="button"
      onClick={openSidebar}
      aria-label="Open navigation menu"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container-low)] md:hidden"
    >
      <span className="material-symbols-outlined">menu</span>
    </button>
  );
}
