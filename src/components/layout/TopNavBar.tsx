import MobileMenuButton from "@/components/layout/MobileMenuButton";

type TopNavBarProps = {
  userEmail: string;
};

export default function TopNavBar({ userEmail }: TopNavBarProps) {
  const initial = userEmail.trim().charAt(0).toUpperCase() || "U";

  return (
    <header className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 font-[var(--font-heading)] text-sm font-medium text-gray-500 sm:px-6 md:left-[260px] md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <MobileMenuButton />
        <div className="relative ml-0 flex max-w-xl flex-1 items-center justify-end">
          <label htmlFor="top-nav-search" className="sr-only">
            Search students or assignments
          </label>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-outline)]">
          search
        </span>
        <input
          id="top-nav-search"
          type="text"
          placeholder="Search students, assignments..."
          className="w-full max-w-md min-w-0 rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] py-2 pl-4 pr-10 font-[var(--font-body)] text-[var(--color-on-surface)] transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>
      </div>
      <div className="ml-2 flex items-center gap-2 sm:ml-6 sm:gap-4">
        <button
          type="button"
          aria-label="Open notifications"
          className="relative rounded-full p-2 transition-colors hover:bg-gray-50"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full border border-white bg-[var(--color-secondary-container)]"></span>
        </button>
        <button
          type="button"
          aria-label="Open help"
          className="rounded-full p-2 transition-colors hover:bg-gray-50"
        >
          <span className="material-symbols-outlined">help</span>
        </button>
        <div className="mx-1 hidden h-8 w-px bg-[var(--color-outline-variant)] sm:mx-2 sm:block"></div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--color-surface-container-highest)] font-semibold text-[var(--color-on-surface)] transition-colors hover:border-[var(--color-primary)]">
          {initial}
        </div>
      </div>
    </header>
  );
}
