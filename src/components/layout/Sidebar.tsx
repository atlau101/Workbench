"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { useSidebar } from "@/components/layout/SidebarProvider";

type Role = "instructor" | "student";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  matchPrefix?: string;
};

type SidebarProps = {
  role: Role;
};

const navItemsByRole: Record<Role, NavItem[]> = {
  instructor: [
    { href: "/instructor/dashboard", label: "Dashboard", icon: "dashboard" },
    {
      href: "/instructor/assignments",
      label: "Assignments",
      icon: "edit_note",
      matchPrefix: "/instructor/assignments",
    },
    {
      href: "/instructor/courses",
      label: "Courses",
      icon: "group",
      matchPrefix: "/instructor/courses",
    },
    { href: "/instructor/gym", label: "Thinking Gym", icon: "psychology" },
    { href: "/instructor/profile", label: "Profile", icon: "person" },
  ],
  student: [
    { href: "/student/dashboard", label: "Dashboard", icon: "dashboard" },
    {
      href: "/student/courses",
      label: "Courses",
      icon: "school",
      matchPrefix: "/student/courses",
    },
    {
      href: "/student/assignments",
      label: "Workspace",
      icon: "edit_note",
      matchPrefix: "/student/assignments",
    },
    { href: "/student/gym", label: "Thinking Gym", icon: "psychology" },
    { href: "/student/profile", label: "Profile", icon: "person" },
  ],
};

function isActive(pathname: string, item: NavItem) {
  const prefix = item.matchPrefix ?? item.href;

  if (
    prefix.endsWith("/dashboard") ||
    prefix.endsWith("/gym") ||
    prefix.endsWith("/profile")
  ) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${prefix}/`);
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navItemsByRole[role];
  const { open, closeSidebar } = useSidebar();

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={closeSidebar}
        className={[
          "fixed inset-0 z-40 bg-[var(--color-on-surface)]/40 backdrop-blur-sm transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        ].join(" ")}
        aria-label={`${role} navigation`}
      >
        {/* Wordmark */}
        <div className="px-6 py-5 border-b border-[var(--color-outline-variant)]">
          <Link href={role === "instructor" ? "/instructor/dashboard" : "/student/dashboard"} className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] shrink-0">
              <span className="material-symbols-outlined text-[18px] fill">menu_book</span>
            </div>
            <span className="font-heading text-base font-semibold text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
              Workbench
            </span>
          </Link>
        </div>

        {role === "instructor" && (
          <div className="px-4 pt-4">
            <Link
              href="/instructor/assignments/new"
              onClick={closeSidebar}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 font-heading text-sm font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Assignment
            </Link>
          </div>
        )}

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = isActive(pathname, item);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all font-heading font-medium",
                  active
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]",
                ].join(" ")}
              >
                <span className={active ? "material-symbols-outlined fill text-[20px]" : "material-symbols-outlined text-[20px]"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-0.5 border-t border-[var(--color-outline-variant)] px-3 py-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-heading font-medium text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            Settings
          </button>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Sign out"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-heading font-medium text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
