"use client";

export function PrintButton() {
  return (
    <button type="button" className="stamp-btn" onClick={() => window.print()}>
      Print
    </button>
  );
}
