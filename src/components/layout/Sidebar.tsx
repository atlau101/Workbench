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

  if (prefix.endsWith("/dashboard") || prefix.endsWith("/gym") || prefix.endsWith("/profile")) {
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
          "fixed inset-0 z-40 bg-black/35 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-gray-200 bg-gray-50 p-4 font-[var(--font-heading)] text-sm transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        ].join(" ")}
        aria-label={`${role} navigation`}
      >
        <div className="mb-6 flex items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
            <span className="material-symbols-outlined">menu_book</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-teal-600">Workbench</h1>
            <p className="text-xs text-[var(--color-on-surface-variant)] opacity-70">Educational App</p>
          </div>
        </div>

        {role === "instructor" ? (
          <Link
            href="/instructor/assignments/new"
            onClick={closeSidebar}
            className="mb-8 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-3 font-semibold text-[var(--color-on-primary)] shadow-sm transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined">add</span>
            New Assignment
          </Link>
        ) : null}

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex items-center gap-3 rounded-lg px-4 py-3 transition-all",
                  active
                    ? "border-r-4 border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary-container)_10%,white)] font-bold text-[var(--color-primary)]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-teal-600",
                ].join(" ")}
              >
                <span
                  className={active ? "material-symbols-outlined fill" : "material-symbols-outlined"}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1 border-t border-[var(--color-outline-variant)] pt-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-gray-600 transition-all hover:bg-gray-100 hover:text-teal-600"
          >
            <span className="material-symbols-outlined">settings</span>
            Settings
          </button>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Sign out"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-gray-600 transition-all hover:bg-gray-100 hover:text-teal-600"
            >
              <span className="material-symbols-outlined">logout</span>
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
