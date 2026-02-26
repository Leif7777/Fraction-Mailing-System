"use client";

import { useState, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle, Color, FontSize } from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

export interface ComposeData {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  html: string;
}

interface Props {
  onClose: () => void;
  onSend: (data: ComposeData) => void;
  initialData?: Partial<ComposeData>;
}

type WindowMode = "normal" | "minimized" | "fullscreen";

const COMMON_EMOJIS = ["😊","👍","🙏","👋","✅","🔥","💡","⚡","📧","📝","🏠","🤝","💰","📊","🎯","🚀","⭐","❤️","👏","💬","🏡","🌿","📅","⏰","✨","🎉","💪","🌟","📍","🔑"];

const FONT_SIZES = [
  { label: "Small", value: "12px" },
  { label: "Normal", value: "14px" },
  { label: "Large", value: "18px" },
  { label: "Huge", value: "22px" },
];

const TEXT_COLORS = ["#1a2e1a","#dc2626","#d97706","#16a34a","#0284c7","#7c3aed","#db2777","#ea580c","#6b7280"];

function ToolbarBtn({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors hover:bg-gray-100"
      style={{ color: active ? "var(--fraction-green-dark)" : "var(--fraction-text)", background: active ? "var(--fraction-green-light)" : undefined }}
    >
      {children}
    </button>
  );
}

export default function ComposeWindow({ onClose, onSend, initialData }: Props) {
  const [mode, setMode] = useState<WindowMode>("normal");
  const [to, setTo] = useState<string[]>(initialData?.to ?? []);
  const [toInput, setToInput] = useState("");
  const [cc, setCc] = useState<string[]>(initialData?.cc ?? []);
  const [ccInput, setCcInput] = useState("");
  const [bcc, setBcc] = useState<string[]>(initialData?.bcc ?? []);
  const [bccInput, setBccInput] = useState("");
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [subject, setSubject] = useState(initialData?.subject ?? "");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showToolbar, setShowToolbar] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showTextColor, setShowTextColor] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontSize,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write your message, or click ✨ AI Assist to generate a draft…" }),
    ],
    content: initialData?.html ?? "",
    editorProps: {
      attributes: { class: "compose-editor" },
    },
  });

  const hasContent = !!editor?.getText().trim() || subject.trim() !== "";

  const handleToKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && toInput.trim()) {
      e.preventDefault();
      setTo([...to, toInput.trim().replace(/,$/, "")]);
      setToInput("");
    }
  };

  const handleCcKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && ccInput.trim()) {
      e.preventDefault();
      setCc([...cc, ccInput.trim().replace(/,$/, "")]);
      setCcInput("");
    }
  };

  const handleBccKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && bccInput.trim()) {
      e.preventDefault();
      setBcc([...bcc, bccInput.trim().replace(/,$/, "")]);
      setBccInput("");
    }
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    setAttachments((prev) => [...prev, ...Array.from(files)]);
  }, []);

  const formatBytes = (b: number) => {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleClose = () => {
    if (hasContent) { setShowDiscard(true); return; }
    onClose();
  };

  const handleSend = () => {
    onSend({
      to, cc, bcc, subject,
      html: editor?.getHTML() ?? "",
    });
  };

  const handleAIAssist = async () => {
    setIsGenerating(true);
    try {
      const body = editor?.getText().trim();
      const prompt = `You are drafting an email on behalf of Leif, a Sales Associate at Fraction (fraction.com) — a platform for fractional co-ownership of luxury and vacation real estate.

Subject: ${subject || "(no subject yet)"}
${body ? `Draft so far:\n${body}` : "No content yet."}

Write a complete, polished, professional email body. Match the context: if it's a sales outreach, be warm and compelling. If it's a client support reply, be helpful and clear. If it's an internal email, be direct and brief. Sign off as Leif. Write only the email body — no subject line.`;

      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const { text, error } = await res.json();
      if (error) throw new Error(error);
      editor?.commands.setContent(`<p>${text.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyLink = () => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  // Window geometry
  const normalStyle = { width: 560, height: 480, bottom: 0, right: 24 };
  const minimizedStyle = { width: 320, height: "auto", bottom: 0, right: 24 };
  const fullscreenStyle = { inset: "5vh 8vw", width: "auto", height: "auto", borderRadius: 16 };

  const containerStyle = mode === "fullscreen"
    ? { ...fullscreenStyle, position: "fixed" as const }
    : mode === "minimized"
    ? { ...minimizedStyle, position: "fixed" as const }
    : { ...normalStyle, position: "fixed" as const };

  return (
    <div
      className="z-[150] flex flex-col overflow-hidden shadow-2xl"
      style={{
        ...containerStyle,
        borderRadius: mode === "fullscreen" ? 16 : "12px 12px 0 0",
        border: "1px solid rgba(26,46,26,0.15)",
        animation: "slideUp 150ms ease-out",
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0 cursor-pointer select-none"
        style={{ background: "var(--fraction-dark)", color: "#fff" }}
        onClick={() => { if (mode === "minimized") setMode("normal"); }}
      >
        <span className="text-sm font-semibold">New Message</span>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMode(mode === "minimized" ? "normal" : "minimized")}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            title="Minimise"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={() => setMode(mode === "fullscreen" ? "normal" : "fullscreen")}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            title="Fullscreen"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
          <button
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            title="Close"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body (hidden when minimised) */}
      {mode !== "minimized" && (
        <div className="flex flex-col flex-1 overflow-hidden bg-white">

          {/* Discard confirmation */}
          {showDiscard && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
              <div className="text-center px-8 py-6 rounded-xl border shadow-lg bg-white" style={{ borderColor: "var(--fraction-border)" }}>
                <p className="font-semibold mb-1" style={{ color: "var(--fraction-dark)" }}>Discard draft?</p>
                <p className="text-sm mb-4" style={{ color: "var(--fraction-muted)" }}>Your message will be permanently deleted.</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">Discard</button>
                  <button onClick={() => setShowDiscard(false)} className="px-4 py-2 text-sm rounded-lg font-semibold border transition-colors" style={{ borderColor: "var(--fraction-border)", color: "var(--fraction-text)" }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* To field */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-b flex-wrap" style={{ borderColor: "var(--fraction-border)" }}>
            <span className="text-xs flex-shrink-0" style={{ color: "var(--fraction-muted)" }}>To</span>
            <div className="flex flex-wrap gap-1 flex-1 items-center">
              {to.map((addr) => (
                <span key={addr} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--fraction-green-light)", color: "var(--fraction-green-dark)" }}>
                  {addr}
                  <button onClick={() => setTo(to.filter((a) => a !== addr))} className="hover:text-red-500 transition-colors">×</button>
                </span>
              ))}
              <input
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                onKeyDown={handleToKey}
                onBlur={() => { if (toInput.trim()) { setTo([...to, toInput.trim()]); setToInput(""); } }}
                placeholder={to.length === 0 ? "Recipients" : ""}
                className="flex-1 min-w-16 outline-none text-sm"
                style={{ color: "var(--fraction-dark)" }}
              />
            </div>
            <button
              onClick={() => setShowCcBcc(!showCcBcc)}
              className="text-xs flex-shrink-0 hover:underline"
              style={{ color: "var(--fraction-muted)" }}
            >
              Cc Bcc
            </button>
          </div>

          {/* Cc/Bcc */}
          {showCcBcc && (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 border-b flex-wrap" style={{ borderColor: "var(--fraction-border)" }}>
                <span className="text-xs flex-shrink-0" style={{ color: "var(--fraction-muted)" }}>Cc</span>
                <div className="flex flex-wrap gap-1 flex-1 items-center">
                  {cc.map((addr) => (
                    <span key={addr} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--fraction-green-light)", color: "var(--fraction-green-dark)" }}>
                      {addr}<button onClick={() => setCc(cc.filter((a) => a !== addr))}>×</button>
                    </span>
                  ))}
                  <input value={ccInput} onChange={(e) => setCcInput(e.target.value)} onKeyDown={handleCcKey} className="flex-1 min-w-16 outline-none text-sm" style={{ color: "var(--fraction-dark)" }} />
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 border-b flex-wrap" style={{ borderColor: "var(--fraction-border)" }}>
                <span className="text-xs flex-shrink-0" style={{ color: "var(--fraction-muted)" }}>Bcc</span>
                <div className="flex flex-wrap gap-1 flex-1 items-center">
                  {bcc.map((addr) => (
                    <span key={addr} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--fraction-green-light)", color: "var(--fraction-green-dark)" }}>
                      {addr}<button onClick={() => setBcc(bcc.filter((a) => a !== addr))}>×</button>
                    </span>
                  ))}
                  <input value={bccInput} onChange={(e) => setBccInput(e.target.value)} onKeyDown={handleBccKey} className="flex-1 min-w-16 outline-none text-sm" style={{ color: "var(--fraction-dark)" }} />
                </div>
              </div>
            </>
          )}

          {/* Subject */}
          <div className="border-b" style={{ borderColor: "var(--fraction-border)" }}>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full px-3 py-2 outline-none text-sm font-medium"
              style={{ color: "var(--fraction-dark)" }}
            />
          </div>

          {/* Formatting toolbar */}
          {showToolbar && (
            <div className="flex items-center gap-0.5 px-2 py-1 border-b flex-wrap relative" style={{ borderColor: "var(--fraction-border)", background: "#fafcfa" }}>
              <ToolbarBtn active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold"><b>B</b></ToolbarBtn>
              <ToolbarBtn active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic"><i>I</i></ToolbarBtn>
              <ToolbarBtn active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()} title="Underline"><u>U</u></ToolbarBtn>
              <ToolbarBtn active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()} title="Strikethrough"><s>S</s></ToolbarBtn>
              <div className="w-px h-4 mx-0.5 bg-gray-200" />

              {/* Font size */}
              <div className="relative">
                <ToolbarBtn active={showFontSize} onClick={() => { setShowFontSize(!showFontSize); setShowTextColor(false); }} title="Font size">
                  <span style={{ fontSize: 10 }}>Aa</span>
                </ToolbarBtn>
                {showFontSize && (
                  <div className="absolute top-8 left-0 z-20 rounded-lg shadow-xl border bg-white py-1 w-28" style={{ borderColor: "var(--fraction-border)" }}>
                    {FONT_SIZES.map(({ label, value }) => (
                      <button key={value} onMouseDown={(e) => { e.preventDefault(); (editor?.chain().focus() as unknown as Record<string, (v: string) => { run: () => void }>)?.setFontSize?.(value)?.run?.(); setShowFontSize(false); }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors" style={{ color: "var(--fraction-text)" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Text color */}
              <div className="relative">
                <ToolbarBtn active={showTextColor} onClick={() => { setShowTextColor(!showTextColor); setShowFontSize(false); }} title="Text color">
                  <span className="text-xs font-bold" style={{ borderBottom: "2px solid var(--fraction-green)" }}>A</span>
                </ToolbarBtn>
                {showTextColor && (
                  <div className="absolute top-8 left-0 z-20 rounded-lg shadow-xl border bg-white p-2 flex flex-wrap gap-1 w-28" style={{ borderColor: "var(--fraction-border)" }}>
                    {TEXT_COLORS.map((c) => (
                      <button key={c} onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().setColor(c).run(); setShowTextColor(false); }}
                        className="w-5 h-5 rounded-full hover:scale-110 transition-transform" style={{ background: c }} />
                    ))}
                    <button onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().unsetColor().run(); setShowTextColor(false); }}
                      className="w-full text-xs text-center mt-1 hover:underline" style={{ color: "var(--fraction-muted)" }}>Clear</button>
                  </div>
                )}
              </div>

              <div className="w-px h-4 mx-0.5 bg-gray-200" />
              <ToolbarBtn active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet list">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </ToolbarBtn>
              <ToolbarBtn active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Numbered list">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </ToolbarBtn>
              <ToolbarBtn active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="Blockquote">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </ToolbarBtn>
              <ToolbarBtn active={editor?.isActive("link")} onClick={() => setShowLinkInput(!showLinkInput)} title="Link">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()} title="Remove formatting">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </ToolbarBtn>

              {/* Link input popover */}
              {showLinkInput && (
                <div className="absolute top-9 left-1/2 -translate-x-1/2 z-20 flex gap-1 bg-white border rounded-lg shadow-xl px-2 py-1.5" style={{ borderColor: "var(--fraction-border)" }}>
                  <input autoFocus value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setShowLinkInput(false); }}
                    placeholder="https://" className="text-xs outline-none w-44 px-1" style={{ color: "var(--fraction-dark)" }} />
                  <button onMouseDown={(e) => { e.preventDefault(); applyLink(); }} className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: "var(--fraction-green)", color: "#fff" }}>Apply</button>
                </div>
              )}
            </div>
          )}

          {/* Editor */}
          <div
            className="flex-1 overflow-y-auto relative"
            style={{ minHeight: mode === "fullscreen" ? 300 : 160 }}
          >
            {isDragging && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed m-2 pointer-events-none"
                style={{ background: "var(--fraction-green-light)", borderColor: "var(--fraction-green)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--fraction-green-dark)" }}>Drop files to attach</p>
              </div>
            )}
            <EditorContent editor={editor} className="h-full" />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="px-3 py-2 border-t flex flex-wrap gap-1.5" style={{ borderColor: "var(--fraction-border)" }}>
              {attachments.map((f, i) => (
                <div key={i} className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border" style={{ borderColor: "var(--fraction-border)", color: "var(--fraction-text)" }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  <span className="max-w-[120px] truncate">{f.name}</span>
                  <span style={{ color: "var(--fraction-muted)" }}>{formatBytes(f.size)}</span>
                  <button onClick={() => setAttachments(attachments.filter((_, j) => j !== i))} className="hover:text-red-500 transition-colors">×</button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom toolbar */}
          <div className="flex items-center gap-1 px-3 py-2 border-t" style={{ borderColor: "var(--fraction-border)", background: "#fafcfa" }}>
            {/* Send */}
            <button
              onClick={handleSend}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: "var(--fraction-green)" }}
            >
              Send
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>

            {/* AI Assist */}
            <button
              onClick={handleAIAssist}
              disabled={isGenerating}
              title="AI Assist — generate a draft"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50"
              style={{ borderColor: "var(--fraction-border)", color: "var(--fraction-text)" }}
            >
              {isGenerating ? (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : "✨"}
              {isGenerating ? "Writing…" : "AI Assist"}
            </button>

            <div className="flex-1" />

            {/* Format toggle */}
            <button onClick={() => setShowToolbar(!showToolbar)} title="Formatting" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-xs font-bold" style={{ color: showToolbar ? "var(--fraction-green-dark)" : "var(--fraction-muted)", textDecoration: "underline" }}>A</button>

            {/* Attach */}
            <button onClick={() => fileInputRef.current?.click()} title="Attach file" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors" style={{ color: "var(--fraction-muted)" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            </button>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />

            {/* Emoji */}
            <div className="relative">
              <button onClick={() => setShowEmoji(!showEmoji)} title="Emoji" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-base">😊</button>
              {showEmoji && (
                <div className="absolute bottom-9 right-0 z-20 bg-white border rounded-xl shadow-xl p-2 grid grid-cols-6 gap-1 w-44" style={{ borderColor: "var(--fraction-border)" }}>
                  {COMMON_EMOJIS.map((e) => (
                    <button key={e} onMouseDown={(ev) => { ev.preventDefault(); editor?.chain().focus().insertContent(e).run(); setShowEmoji(false); }}
                      className="text-base w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Discard */}
            <button onClick={handleClose} title="Discard draft" className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 transition-colors" style={{ color: "var(--fraction-muted)" }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
