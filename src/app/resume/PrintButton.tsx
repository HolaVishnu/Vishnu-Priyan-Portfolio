"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-[#0b1226] px-6 py-2.5 font-mono text-xs uppercase tracking-[0.25em] transition-colors hover:bg-[#0b1226] hover:text-white"
    >
      Print / save as PDF
    </button>
  );
}
