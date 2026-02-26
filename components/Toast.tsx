"use client";

import { useEffect, useRef } from "react";

export interface ToastData {
  message: string;
  onUndo?: () => void;
}

interface Props {
  toast: ToastData;
  onDismiss: () => void;
}

export default function Toast({ toast, onDismiss }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [onDismiss]);

  const handleUndo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    toast.onUndo?.();
    onDismiss();
  };

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium"
      style={{
        background: "var(--fraction-dark)",
        color: "#fff",
        animation: "slideUp 150ms ease-out",
      }}
    >
      <svg className="w-4 h-4 flex-shrink-0" style={{ color: "var(--fraction-green)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span>{toast.message}</span>
      {toast.onUndo && (
        <button
          onClick={handleUndo}
          className="ml-1 underline text-xs font-semibold"
          style={{ color: "var(--fraction-green)" }}
        >
          Undo
        </button>
      )}
      <button onClick={onDismiss} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
