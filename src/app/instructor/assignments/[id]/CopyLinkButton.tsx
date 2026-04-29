"use client";

export default function CopyLinkButton({ id }: { id: string }) {
  async function copy() {
    const url = `${window.location.origin}/a/${id}`;
    await navigator.clipboard.writeText(url);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy student access link"
      className="px-4 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-container)] transition-colors flex items-center gap-2 shrink-0"
    >
      <span className="material-symbols-outlined text-[16px]">content_copy</span>
      Copy Link
    </button>
  );
}
