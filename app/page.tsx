"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { sampleEmails, Email } from "@/lib/emails";
import { CustomTag, getLabelStyle, DEFAULT_LABEL_NAMES } from "@/lib/labelConfig";
import DailyBriefPanel from "@/components/DailyBriefPanel";
import TagPopover from "@/components/TagPopover";
import ComposeWindow, { ComposeData } from "@/components/ComposeWindow";
import Toast, { ToastData } from "@/components/Toast";

interface TagPopoverState {
  emailId: string;
  currentLabel: string;
  position: { top: number; left: number };
}

const USERS = [
  { name: "Leif", role: "Sales Associate", initial: "L" },
  { name: "Jordan", role: "Sales Associate", initial: "J" },
  { name: "Maya", role: "Director of Sales", initial: "M" },
];

export default function Home() {
  // ── Core email state (hydrated from localStorage) ──
  const [emails, setEmails] = useState<Email[]>(() => {
    if (typeof window === "undefined") return sampleEmails;
    try {
      const saved = localStorage.getItem("fraction_emails");
      return saved ? JSON.parse(saved) : sampleEmails;
    } catch { return sampleEmails; }
  });
  const [selected, setSelected] = useState<Email | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Custom tags (hydrated from localStorage) ──
  const [customTags, setCustomTags] = useState<CustomTag[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("fraction_custom_tags");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // ── Daily brief ──
  const [showBrief, setShowBrief] = useState(false);

  // ── Tag popover ──
  const [tagPopover, setTagPopover] = useState<TagPopoverState | null>(null);

  // ── Compose ──
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeInitial, setComposeInitial] = useState<Partial<ComposeData> | undefined>();

  // ── Toast ──
  const [toast, setToast] = useState<ToastData | null>(null);

  // ── Profile menu ──
  const [currentUser, setCurrentUser] = useState(USERS[0]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // ── Mobile navigation ──
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  // ── Persist to localStorage ──
  useEffect(() => { localStorage.setItem("fraction_emails", JSON.stringify(emails)); }, [emails]);
  useEffect(() => { localStorage.setItem("fraction_custom_tags", JSON.stringify(customTags)); }, [customTags]);

  // ── Poll for inbound emails every 30s ──
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/emails");
        const { emails: inbound } = await res.json();
        if (!inbound?.length) return;
        setEmails((prev) => {
          const existingIds = new Set(prev.map((e) => e.id));
          const fresh = inbound.filter((e: Email) => !existingIds.has(e.id));
          if (!fresh.length) return prev;
          setToast({ message: `${fresh.length} new email${fresh.length > 1 ? "s" : ""} received` });
          return [...fresh, ...prev];
        });
      } catch { /* silently ignore */ }
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, []);

  // ── Analyze ──
  const analyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });
      const { results } = await res.json();
      const priorityMap = new Map(results.map((r: { id: string; label: string; priority: number }) => [r.id, r]));
      const updated = [...emails]
        .map((e) => {
          const r = priorityMap.get(e.id) as { label: string; priority: number } | undefined;
          return r ? { ...e, label: r.label } : e;
        })
        .sort((a, b) => {
          const pa = (priorityMap.get(a.id) as { priority: number } | undefined)?.priority ?? 99;
          const pb = (priorityMap.get(b.id) as { priority: number } | undefined)?.priority ?? 99;
          return pa - pb;
        });
      setEmails(updated);
      setAnalyzed(true);
      if (selected) {
        const fresh = updated.find((e) => e.id === selected.id);
        if (fresh) setSelected(fresh);
      }
    } catch (e) {
      console.error(e);
      alert("Error analyzing emails. Check your API key in .env.local");
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Draft ──
  const generateDraft = async () => {
    if (!selected) return;
    setDrafting(true);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selected }),
      });
      const { draft } = await res.json();
      const updated = emails.map((e) => (e.id === selected.id ? { ...e, draft } : e));
      setEmails(updated);
      setSelected({ ...selected, draft });
    } catch (e) {
      console.error(e);
      alert("Error generating draft.");
    } finally {
      setDrafting(false);
    }
  };

  const copyDraft = () => {
    if (selected?.draft) {
      navigator.clipboard.writeText(selected.draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectEmail = (email: Email) => {
    setEmails((prev) => prev.map((e) => (e.id === email.id ? { ...e, read: true } : e)));
    setSelected({ ...email, read: true });
    setMobileView("detail");
  };

  // ── Tag actions ──
  const openTagPopover = (e: React.MouseEvent, emailId: string, currentLabel: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTagPopover({ emailId, currentLabel, position: { top: rect.bottom + 4, left: rect.left } });
  };

  const handleSelectTag = useCallback((emailId: string, tag: string) => {
    setEmails((prev) => prev.map((e) => (e.id === emailId ? { ...e, label: tag } : e)));
    setSelected((prev) => (prev?.id === emailId ? { ...prev, label: tag } : prev));
  }, []);

  const handleCreateTag = useCallback((tag: CustomTag) => {
    setCustomTags((prev) => [...prev.filter((t) => t.name !== tag.name), tag]);
  }, []);

  // ── Compose / Send ──
  const handleSend = (data: ComposeData) => {
    setComposeOpen(false);
    setComposeInitial(undefined);
    setToast({
      message: "Message sent",
      onUndo: () => {
        setComposeInitial(data);
        setComposeOpen(true);
      },
    });
  };

  // ── Counts ──
  const allFilterNames = ["All", ...DEFAULT_LABEL_NAMES, ...customTags.map((t) => t.name)];
  const counts: Record<string, number> = Object.fromEntries(
    allFilterNames.map((f) => [f, f === "All" ? emails.length : emails.filter((e) => e.label === f).length])
  );
  const filteredEmails = emails.filter((e) => {
    if (filter !== "All" && e.label !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return e.from.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q) || e.body.toLowerCase().includes(q);
    }
    return true;
  });
  const unread = emails.filter((e) => !e.read).length;

  // ── Label pill renderer ──
  const LabelPill = ({ email, size = "sm" }: { email: Email; size?: "sm" | "md" }) => {
    const s = getLabelStyle(email.label, customTags);
    return (
      <span
        onClick={(e) => openTagPopover(e, email.id, email.label)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openTagPopover(e as unknown as React.MouseEvent, email.id, email.label); }}
        className="rounded-full border flex-shrink-0 font-semibold transition-all hover:brightness-95 cursor-pointer"
        style={{
          background: s.bg,
          color: s.color,
          borderColor: s.border,
          fontSize: size === "sm" ? 11 : 13,
          padding: size === "sm" ? "2px 7px" : "5px 12px",
        }}
        title="Click to change label"
      >
        {size === "sm" ? s.short : email.label}
      </span>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--fraction-bg)" }}>

      {/* ── Sidebar (desktop only) ── */}
      <aside className="hidden md:flex w-64 flex-col border-r" style={{ background: "#fff", borderColor: "var(--fraction-border)" }}>
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b" style={{ borderColor: "var(--fraction-border)" }}>
          <Image
            src="https://cdn.prod.website-files.com/625dbcce19e14f11c2b08a8c/625e707681cc87d05b0a03dc_primary%202.png"
            alt="Fraction" width={110} height={32} className="object-contain" unoptimized
          />
          <p className="mt-2 text-xs" style={{ color: "var(--fraction-muted)" }}>Smart Inbox · Sales</p>
        </div>

        {/* Primary action button */}
        <div className="px-4 py-4 border-b space-y-2" style={{ borderColor: "var(--fraction-border)" }}>
          {/* Analyze (always visible) */}
          <button
            onClick={analyze}
            disabled={analyzing}
            className="w-full py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60 border"
            style={{ borderColor: "var(--fraction-border)", color: "var(--fraction-text)", background: "#fff" }}
          >
            {analyzing ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {analyzed ? "Re-sort inbox" : "Analyze with AI"}
              </>
            )}
          </button>

          {/* Daily Brief */}
          <button
            onClick={() => setShowBrief(true)}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 text-white"
            style={{ background: "var(--fraction-green)" }}
          >
            ☀️ Daily Brief
          </button>
        </div>

        {/* Filters */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {allFilterNames.map((f) => {
            const active = filter === f;
            const isDefault = f === "All" || DEFAULT_LABEL_NAMES.includes(f);
            const dotColor = f !== "All" ? getLabelStyle(f, customTags).dot : undefined;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors"
                style={
                  active
                    ? { background: "var(--fraction-green-light)", color: "var(--fraction-green-dark)", fontWeight: 600 }
                    : { color: "var(--fraction-text)" }
                }
              >
                <div className="flex items-center gap-2.5">
                  {dotColor && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor }} />
                  )}
                  <span>{f}</span>
                  {!isDefault && (
                    <span className="text-xs px-1 rounded" style={{ background: "var(--fraction-green-mid)", color: "var(--fraction-green-dark)" }}>custom</span>
                  )}
                </div>
                {counts[f] > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full"
                    style={active
                      ? { background: "var(--fraction-green-mid)", color: "var(--fraction-green-dark)" }
                      : { background: "var(--fraction-green-light)", color: "var(--fraction-muted)" }
                    }>
                    {counts[f]}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Profile */}
        <div className="px-4 py-4 border-t relative" style={{ borderColor: "var(--fraction-border)" }}>
          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute bottom-full left-0 right-0 mb-1 mx-0 rounded-xl shadow-lg border overflow-hidden z-20" style={{ background: "#fff", borderColor: "var(--fraction-border)" }}>
                <div className="px-3 py-2 border-b" style={{ borderColor: "var(--fraction-border)" }}>
                  <p className="text-xs font-semibold" style={{ color: "var(--fraction-muted)" }}>Switch account</p>
                </div>
                {USERS.map((user) => (
                  <button key={user.name} onClick={() => { setCurrentUser(user); setShowProfileMenu(false); }} className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-gray-50 transition-colors">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ background: currentUser.name === user.name ? "var(--fraction-green)" : "#e5e7eb", color: currentUser.name === user.name ? "#fff" : "var(--fraction-dark)" }}>
                      {user.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--fraction-dark)" }}>{user.name}</p>
                      <p className="text-xs truncate" style={{ color: "var(--fraction-muted)" }}>{user.role}</p>
                    </div>
                    {currentUser.name === user.name && (
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--fraction-green)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
                <div className="border-t" style={{ borderColor: "var(--fraction-border)" }}>
                  <button onClick={() => { setShowProfileMenu(false); setToast({ message: "Logged out successfully" }); }} className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--fraction-muted)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm" style={{ color: "var(--fraction-muted)" }}>Log out</span>
                  </button>
                </div>
              </div>
            </>
          )}
          <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-full flex items-center gap-2.5 rounded-lg p-1.5 -m-1.5 hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0" style={{ background: "var(--fraction-green)", color: "#fff" }}>
              {currentUser.initial}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--fraction-dark)" }}>{currentUser.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--fraction-muted)" }}>{currentUser.role}</p>
            </div>
            <svg className="w-4 h-4 flex-shrink-0 transition-transform" style={{ color: "var(--fraction-muted)", transform: showProfileMenu ? "rotate(180deg)" : undefined }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Email list ── */}
      <section className={`${mobileView === "detail" ? "mobile-hide" : ""} flex flex-col border-r overflow-hidden md:w-80 w-full`} style={{ background: "#fff", borderColor: "var(--fraction-border)" }}>

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--fraction-border)" }}>
          <Image src="https://cdn.prod.website-files.com/625dbcce19e14f11c2b08a8c/625e707681cc87d05b0a03dc_primary%202.png" alt="Fraction" width={90} height={26} className="object-contain" unoptimized />
          <div className="flex items-center gap-2">
            <button onClick={analyze} disabled={analyzing} className="w-8 h-8 flex items-center justify-center rounded-lg border" style={{ borderColor: "var(--fraction-border)", background: "#fff" }}>
              {analyzing ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--fraction-text)" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            </button>
            <button onClick={() => setShowBrief(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-base" style={{ background: "var(--fraction-green-light)" }}>☀️</button>
            <button onClick={() => { setComposeInitial(undefined); setComposeOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-white" style={{ background: "var(--fraction-green)" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>

        {/* Mobile filter pills */}
        <div className="md:hidden flex gap-2 px-3 py-2.5 border-b overflow-x-auto scrollbar-none" style={{ borderColor: "var(--fraction-border)" }}>
          {allFilterNames.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-shrink-0 text-xs px-3 py-1 rounded-full font-semibold border transition-all"
              style={{
                background: filter === f ? "var(--fraction-green)" : "#fff",
                color: filter === f ? "#fff" : "var(--fraction-text)",
                borderColor: filter === f ? "var(--fraction-green)" : "var(--fraction-border)",
              }}
            >
              {f} {counts[f] > 0 && <span className="opacity-70">· {counts[f]}</span>}
            </button>
          ))}
        </div>

        {/* Desktop header */}
        <div className="hidden md:flex px-4 py-3.5 border-b items-center justify-between" style={{ borderColor: "var(--fraction-border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--fraction-dark)" }}>
            {filter === "All" ? "Inbox" : filter}
          </h2>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "var(--fraction-green)", color: "#fff" }}>
                {unread} new
              </span>
            )}
            <button
              onClick={() => { setComposeInitial(undefined); setComposeOpen(true); }}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold text-white transition-colors"
              style={{ background: "var(--fraction-green)" }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Compose
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2.5 border-b" style={{ borderColor: "var(--fraction-border)" }}>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: "var(--fraction-bg)" }}>
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--fraction-muted)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search emails…"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--fraction-dark)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="flex-shrink-0" style={{ color: "var(--fraction-muted)" }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredEmails.length === 0 ? (
            <div className="p-10 text-center text-sm" style={{ color: "var(--fraction-muted)" }}>{search ? `No results for "${search}"` : "No emails here"}</div>
          ) : (
            filteredEmails.map((email) => (
              <button
                key={email.id}
                onClick={() => selectEmail(email)}
                className="w-full text-left px-4 py-3.5 border-b transition-all"
                style={{
                  borderColor: "var(--fraction-border)",
                  background: selected?.id === email.id ? "var(--fraction-green-light)" : undefined,
                  borderLeft: selected?.id === email.id ? "3px solid var(--fraction-green)" : "3px solid transparent",
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {!email.read && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: "var(--fraction-green)" }} />}
                    <span className="text-sm truncate" style={{ fontWeight: email.read ? 400 : 700, color: "var(--fraction-dark)" }}>
                      {email.from}
                    </span>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--fraction-muted)" }}>{email.time}</span>
                </div>
                <p className="text-xs truncate mb-1.5" style={{ fontWeight: email.read ? 400 : 600, color: email.read ? "var(--fraction-muted)" : "var(--fraction-text)" }}>
                  {email.subject}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs truncate flex-1" style={{ color: "var(--fraction-muted)" }}>
                    {email.body.trim().split("\n").find((l) => l.trim()) ?? ""}
                  </p>
                  <LabelPill email={email} size="sm" />
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      {/* ── Reading pane ── */}
      <main className={`${mobileView === "list" ? "mobile-hide" : ""} flex flex-1 flex-col overflow-hidden`}>
        {selected ? (
          <>
            <div className="bg-white border-b px-4 md:px-8 py-4 md:py-6" style={{ borderColor: "var(--fraction-border)" }}>
              {/* Mobile back button */}
              <button
                onClick={() => setMobileView("list")}
                className="md:hidden flex items-center gap-1.5 text-sm mb-3 font-medium"
                style={{ color: "var(--fraction-green-dark)" }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Inbox
              </button>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="font-display text-xl md:text-2xl mb-3 leading-snug" style={{ color: "var(--fraction-dark)", fontWeight: 500 }}>
                    {selected.subject}
                  </h1>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "var(--fraction-green-light)", color: "var(--fraction-green-dark)" }}>
                      {selected.from[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--fraction-dark)" }}>{selected.from}</p>
                      <p className="text-xs truncate" style={{ color: "var(--fraction-muted)" }}>{selected.fromEmail} · {selected.time}</p>
                    </div>
                  </div>
                </div>
                <LabelPill email={selected} size="md" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-5 md:py-7" style={{ background: "var(--fraction-bg)" }}>
              <div className="max-w-2xl w-full">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed" style={{ fontFamily: "'Nunito Sans', 'Avenir Next', sans-serif", color: "var(--fraction-text)" }}>
                  {selected.body}
                </pre>

                {selected.draft ? (
                  <div className="mt-10 rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: "var(--fraction-green-mid)" }}>
                    <div className="px-5 py-3 flex items-center gap-2 border-b" style={{ background: "var(--fraction-green-light)", borderColor: "var(--fraction-green-mid)" }}>
                      <svg className="w-4 h-4" style={{ color: "var(--fraction-green-dark)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-sm font-semibold" style={{ color: "var(--fraction-green-dark)" }}>AI Draft Reply</span>
                      <span className="text-xs ml-1" style={{ color: "var(--fraction-muted)" }}>· written by Claude</span>
                    </div>
                    <div className="bg-white px-5 py-5">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed" style={{ fontFamily: "'Nunito Sans', 'Avenir Next', sans-serif", color: "var(--fraction-text)" }}>
                        {selected.draft}
                      </pre>
                    </div>
                    <div className="px-5 py-3 flex gap-2 border-t" style={{ background: "#fafcfa", borderColor: "var(--fraction-border)" }}>
                      <button
                        onClick={() => {
                          setComposeInitial({
                            to: [selected.fromEmail],
                            subject: `Re: ${selected.subject}`,
                            html: `<p>${(selected.draft ?? "").replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>`,
                          });
                          setComposeOpen(true);
                        }}
                        className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-lg font-semibold transition-all text-white"
                        style={{ background: "var(--fraction-green)" }}
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send
                      </button>
                      <button onClick={copyDraft} className="text-xs px-4 py-1.5 rounded-lg border font-semibold transition-all" style={{ borderColor: "var(--fraction-border)", color: "var(--fraction-text)" }}>
                        {copied ? "Copied!" : "Copy draft"}
                      </button>
                      <button onClick={generateDraft} disabled={drafting} className="text-xs px-4 py-1.5 rounded-lg border font-semibold transition-colors disabled:opacity-50" style={{ borderColor: "var(--fraction-border)", color: "var(--fraction-muted)" }}>
                        {drafting ? "Writing…" : "Regenerate"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-10">
                    {selected.label === "Needs Reply" || selected.label === "Urgent" ? (
                      <button onClick={generateDraft} disabled={drafting} className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 shadow-sm" style={{ background: "var(--fraction-green)" }}>
                        {drafting ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            Writing draft…
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Generate AI draft reply
                          </>
                        )}
                      </button>
                    ) : (
                      <p className="text-sm italic" style={{ color: "var(--fraction-muted)" }}>
                        No reply needed — labelled <span className="font-medium">{selected.label}</span>.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center" style={{ background: "var(--fraction-bg)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--fraction-green-light)" }}>
              <svg className="w-8 h-8" style={{ color: "var(--fraction-green)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-display text-xl mb-1" style={{ color: "var(--fraction-dark)", fontWeight: 500 }}>Your inbox, smarter.</p>
            <p className="text-sm text-center max-w-xs" style={{ color: "var(--fraction-muted)" }}>
              Select an email to read it, or click <span className="font-medium" style={{ color: "var(--fraction-green-dark)" }}>☀️ Daily Brief</span> for your AI morning rundown.
            </p>
          </div>
        )}
      </main>

      {/* ── Overlays ── */}

      {/* Daily Brief panel */}
      <DailyBriefPanel show={showBrief} emails={emails} onClose={() => setShowBrief(false)} />

      {/* Tag popover backdrop + popover */}
      {tagPopover && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setTagPopover(null)} />
          <TagPopover
            emailId={tagPopover.emailId}
            currentLabel={tagPopover.currentLabel}
            position={tagPopover.position}
            customTags={customTags}
            onSelectTag={handleSelectTag}
            onCreateTag={handleCreateTag}
            onClose={() => setTagPopover(null)}
          />
        </>
      )}

      {/* Compose window */}
      {composeOpen && (
        <ComposeWindow
          onClose={() => { setComposeOpen(false); setComposeInitial(undefined); }}
          onSend={handleSend}
          initialData={composeInitial}
        />
      )}

      {/* Toast */}
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
