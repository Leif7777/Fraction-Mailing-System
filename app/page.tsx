"use client";

import { useState } from "react";
import Image from "next/image";
import { sampleEmails, Email, EmailLabel } from "@/lib/emails";

const labelConfig: Record<EmailLabel, { bg: string; text: string; border: string; dot: string; short: string }> = {
  Urgent: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    short: "Urgent",
  },
  "Needs Reply": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
    short: "Reply",
  },
  FYI: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-400",
    short: "FYI",
  },
  Ignore: {
    bg: "bg-gray-50",
    text: "text-gray-400",
    border: "border-gray-200",
    dot: "bg-gray-300",
    short: "Ignore",
  },
};

const FILTERS = ["All", "Urgent", "Needs Reply", "FYI", "Ignore"] as const;
type Filter = (typeof FILTERS)[number];

export default function Home() {
  const [emails, setEmails] = useState<Email[]>(sampleEmails);
  const [selected, setSelected] = useState<Email | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [filter, setFilter] = useState<Filter>("All");
  const [analyzed, setAnalyzed] = useState(false);
  const [copied, setCopied] = useState(false);

  const analyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });
      const { results } = await res.json();

      const priorityMap = new Map(
        results.map((r: { id: string; label: EmailLabel; priority: number }) => [r.id, r])
      );

      const updated = [...emails]
        .map((e) => {
          const result = priorityMap.get(e.id) as { label: EmailLabel; priority: number } | undefined;
          return result ? { ...e, label: result.label } : e;
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
    // Mark as read
    setEmails((prev) => prev.map((e) => (e.id === email.id ? { ...e, read: true } : e)));
    setSelected({ ...email, read: true });
  };

  const filteredEmails = emails.filter((e) => filter === "All" || e.label === filter);

  const counts: Record<Filter, number> = {
    All: emails.length,
    Urgent: emails.filter((e) => e.label === "Urgent").length,
    "Needs Reply": emails.filter((e) => e.label === "Needs Reply").length,
    FYI: emails.filter((e) => e.label === "FYI").length,
    Ignore: emails.filter((e) => e.label === "Ignore").length,
  };

  const unread = emails.filter((e) => !e.read).length;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--fraction-bg)" }}>

      {/* ── Sidebar ── */}
      <aside className="w-64 flex flex-col border-r" style={{ background: "#fff", borderColor: "var(--fraction-border)" }}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b" style={{ borderColor: "var(--fraction-border)" }}>
          <Image
            src="https://cdn.prod.website-files.com/625dbcce19e14f11c2b08a8c/625e707681cc87d05b0a03dc_primary%202.png"
            alt="Fraction"
            width={110}
            height={32}
            className="object-contain"
            unoptimized
          />
          <p className="mt-2 text-xs" style={{ color: "var(--fraction-muted)" }}>
            Smart Inbox · Sales
          </p>
        </div>

        {/* Analyze button */}
        <div className="px-4 py-4 border-b" style={{ borderColor: "var(--fraction-border)" }}>
          <button
            onClick={analyze}
            disabled={analyzing}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            style={
              analyzed
                ? { background: "var(--fraction-green-light)", color: "var(--fraction-green-dark)", border: "1px solid var(--fraction-green-mid)" }
                : { background: "var(--fraction-green)", color: "#fff" }
            }
          >
            {analyzing ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing…
              </>
            ) : analyzed ? (
              "✓ Re-analyze inbox"
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analyze with AI
              </>
            )}
          </button>
        </div>

        {/* Filter nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {FILTERS.map((f) => {
            const active = filter === f;
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
                  {f !== "All" && (
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: f !== "All" ? labelConfig[f as EmailLabel].dot : undefined }}
                    />
                  )}
                  <span>{f}</span>
                </div>
                {counts[f] > 0 && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={
                      active
                        ? { background: "var(--fraction-green-mid)", color: "var(--fraction-green-dark)" }
                        : { background: "var(--fraction-green-light)", color: "var(--fraction-muted)" }
                    }
                  >
                    {counts[f]}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t" style={{ borderColor: "var(--fraction-border)" }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{ background: "var(--fraction-green)", color: "#fff" }}
            >
              L
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--fraction-dark)" }}>Leif</p>
              <p className="text-xs" style={{ color: "var(--fraction-muted)" }}>Sales Associate</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Email list ── */}
      <section
        className="w-80 flex flex-col border-r overflow-hidden"
        style={{ background: "#fff", borderColor: "var(--fraction-border)" }}
      >
        <div className="px-4 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--fraction-border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--fraction-dark)" }}>
            {filter === "All" ? "Inbox" : filter}
          </h2>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "var(--fraction-green)", color: "#fff" }}
              >
                {unread} new
              </span>
            )}
            <span className="text-xs" style={{ color: "var(--fraction-muted)" }}>
              {filteredEmails.length} total
            </span>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredEmails.length === 0 ? (
            <div className="p-10 text-center text-sm" style={{ color: "var(--fraction-muted)" }}>
              No emails here
            </div>
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
                    {!email.read && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: "var(--fraction-green)" }} />
                    )}
                    <span
                      className="text-sm truncate"
                      style={{ fontWeight: email.read ? 400 : 700, color: "var(--fraction-dark)" }}
                    >
                      {email.from}
                    </span>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--fraction-muted)" }}>
                    {email.time}
                  </span>
                </div>

                <p
                  className="text-xs truncate mb-1.5"
                  style={{ fontWeight: email.read ? 400 : 600, color: email.read ? "var(--fraction-muted)" : "var(--fraction-text)" }}
                >
                  {email.subject}
                </p>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs truncate flex-1" style={{ color: "var(--fraction-muted)" }}>
                    {email.body.trim().split("\n").find((l) => l.trim()) ?? ""}
                  </p>
                  {email.label && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full border flex-shrink-0 ${labelConfig[email.label].bg} ${labelConfig[email.label].text} ${labelConfig[email.label].border}`}
                    >
                      {labelConfig[email.label].short}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      {/* ── Reading pane ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <>
            {/* Email header */}
            <div className="bg-white border-b px-8 py-6" style={{ borderColor: "var(--fraction-border)" }}>
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h1
                    className="font-display text-2xl mb-3 leading-snug"
                    style={{ color: "var(--fraction-dark)", fontWeight: 500 }}
                  >
                    {selected.subject}
                  </h1>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: "var(--fraction-green-light)", color: "var(--fraction-green-dark)" }}
                    >
                      {selected.from[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--fraction-dark)" }}>
                        {selected.from}
                      </p>
                      <p className="text-xs" style={{ color: "var(--fraction-muted)" }}>
                        {selected.fromEmail} · {selected.time}
                      </p>
                    </div>
                  </div>
                </div>
                {selected.label && (
                  <span
                    className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${labelConfig[selected.label].bg} ${labelConfig[selected.label].text} ${labelConfig[selected.label].border}`}
                  >
                    {selected.label}
                  </span>
                )}
              </div>
            </div>

            {/* Email body */}
            <div className="flex-1 overflow-y-auto px-8 py-7" style={{ background: "var(--fraction-bg)" }}>
              <div className="max-w-2xl">
                <pre
                  className="whitespace-pre-wrap text-sm leading-relaxed"
                  style={{ fontFamily: "'Nunito Sans', 'Avenir Next', sans-serif", color: "var(--fraction-text)" }}
                >
                  {selected.body}
                </pre>

                {/* Draft */}
                {selected.draft ? (
                  <div
                    className="mt-10 rounded-xl overflow-hidden border shadow-sm"
                    style={{ borderColor: "var(--fraction-green-mid)" }}
                  >
                    <div
                      className="px-5 py-3 flex items-center gap-2 border-b"
                      style={{ background: "var(--fraction-green-light)", borderColor: "var(--fraction-green-mid)" }}
                    >
                      <svg className="w-4 h-4" style={{ color: "var(--fraction-green-dark)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-sm font-semibold" style={{ color: "var(--fraction-green-dark)" }}>
                        AI Draft Reply
                      </span>
                      <span className="text-xs ml-1" style={{ color: "var(--fraction-muted)" }}>
                        · written by Claude
                      </span>
                    </div>
                    <div className="bg-white px-5 py-5">
                      <pre
                        className="whitespace-pre-wrap text-sm leading-relaxed"
                        style={{ fontFamily: "'Nunito Sans', 'Avenir Next', sans-serif", color: "var(--fraction-text)" }}
                      >
                        {selected.draft}
                      </pre>
                    </div>
                    <div
                      className="px-5 py-3 flex gap-2 border-t"
                      style={{ background: "#fafcfa", borderColor: "var(--fraction-border)" }}
                    >
                      <button
                        onClick={copyDraft}
                        className="text-xs px-4 py-1.5 rounded-lg font-semibold transition-all text-white"
                        style={{ background: "var(--fraction-green)" }}
                      >
                        {copied ? "Copied!" : "Copy draft"}
                      </button>
                      <button
                        onClick={generateDraft}
                        disabled={drafting}
                        className="text-xs px-4 py-1.5 rounded-lg border font-semibold transition-colors disabled:opacity-50"
                        style={{ borderColor: "var(--fraction-border)", color: "var(--fraction-muted)" }}
                      >
                        {drafting ? "Writing…" : "Regenerate"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-10">
                    {selected.label === "Needs Reply" || selected.label === "Urgent" ? (
                      <button
                        onClick={generateDraft}
                        disabled={drafting}
                        className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 shadow-sm"
                        style={{ background: "var(--fraction-green)" }}
                      >
                        {drafting ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Writing draft…
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Generate AI draft reply
                          </>
                        )}
                      </button>
                    ) : selected.label ? (
                      <p className="text-sm italic" style={{ color: "var(--fraction-muted)" }}>
                        No reply needed for {selected.label === "FYI" ? "informational" : "ignored"} emails.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center" style={{ background: "var(--fraction-bg)" }}>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "var(--fraction-green-light)" }}
            >
              <svg className="w-8 h-8" style={{ color: "var(--fraction-green)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-display text-xl mb-1" style={{ color: "var(--fraction-dark)", fontWeight: 500 }}>
              Your inbox, smarter.
            </p>
            <p className="text-sm text-center max-w-xs" style={{ color: "var(--fraction-muted)" }}>
              {analyzed
                ? "Select an email to read it and generate a draft reply."
                : 'Select an email, or click "Analyze with AI" to sort and label your inbox automatically.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
