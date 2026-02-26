"use client";

import { useState } from "react";
import { CustomTag, DEFAULT_LABEL_NAMES, TAG_COLOR_PRESETS, getLabelStyle } from "@/lib/labelConfig";

interface Props {
  emailId: string;
  currentLabel: string;
  position: { top: number; left: number };
  customTags: CustomTag[];
  onSelectTag: (emailId: string, tag: string) => void;
  onCreateTag: (tag: CustomTag) => void;
  onClose: () => void;
}

export default function TagPopover({ emailId, currentLabel, position, customTags, onSelectTag, onCreateTag, onClose }: Props) {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(TAG_COLOR_PRESETS[0].hex);

  const allTags = [
    ...DEFAULT_LABEL_NAMES.map((n) => ({ name: n, color: getLabelStyle(n, []).color })),
    ...customTags.map((t) => ({ name: t.name, color: t.color })),
  ];

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreateTag({ name: trimmed, color: newColor });
    onSelectTag(emailId, trimmed);
    setNewName("");
    setShowNew(false);
    onClose();
  };

  // Clamp position so popover stays in viewport
  const top = Math.min(position.top, window.innerHeight - 320);
  const left = Math.min(position.left, window.innerWidth - 220);

  return (
    <div
      className="fixed z-[100] rounded-xl shadow-xl border overflow-hidden"
      style={{
        top,
        left,
        width: 210,
        background: "#fff",
        borderColor: "var(--fraction-border)",
        animation: "fadeIn 150ms ease-out",
      }}
    >
      <div className="px-3 py-2 border-b" style={{ borderColor: "var(--fraction-border)" }}>
        <p className="text-xs font-semibold" style={{ color: "var(--fraction-muted)" }}>CHANGE LABEL</p>
      </div>

      <div className="py-1">
        {allTags.map(({ name, color }) => {
          const isActive = name === currentLabel;
          return (
            <button
              key={name}
              onClick={() => { onSelectTag(emailId, name); onClose(); }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors hover:bg-gray-50"
              style={{ color: "var(--fraction-text)" }}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="flex-1 text-left">{name}</span>
              {isActive && (
                <svg className="w-3.5 h-3.5" style={{ color: "var(--fraction-green)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      <div className="border-t" style={{ borderColor: "var(--fraction-border)" }}>
        {!showNew ? (
          <button
            onClick={() => setShowNew(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-50"
            style={{ color: "var(--fraction-green-dark)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New tag
          </button>
        ) : (
          <div className="px-3 py-2.5 space-y-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowNew(false); }}
              placeholder="Tag name…"
              className="w-full text-sm px-2 py-1 rounded-md border outline-none"
              style={{
                borderColor: "var(--fraction-border)",
                color: "var(--fraction-dark)",
                background: "var(--fraction-bg)",
              }}
            />
            <div className="flex gap-1.5 flex-wrap">
              {TAG_COLOR_PRESETS.map(({ hex }) => (
                <button
                  key={hex}
                  onClick={() => setNewColor(hex)}
                  className="w-5 h-5 rounded-full transition-transform hover:scale-110 flex-shrink-0"
                  style={{
                    background: hex,
                    outline: newColor === hex ? `2px solid ${hex}` : "none",
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 text-xs py-1 rounded-md font-semibold text-white transition-opacity disabled:opacity-40"
                style={{ background: "var(--fraction-green)" }}
              >
                Create
              </button>
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 text-xs py-1 rounded-md border font-semibold transition-colors"
                style={{ borderColor: "var(--fraction-border)", color: "var(--fraction-muted)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
