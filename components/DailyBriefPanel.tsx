"use client";

import { useState, useCallback } from "react";
import { Email } from "@/lib/emails";

interface PriorityCall {
  from: string;
  subject: string;
  stake: string;
  action: string;
  take: string;
}

interface BriefData {
  openingLine: string;
  priorityCalls: PriorityCall[];
  interestingNotes: string[];
  watchList: string[];
  quickWins: string[];
  closingLine: string;
}

interface Props {
  show: boolean;
  emails: Email[];
  onClose: () => void;
}

const VARIATIONS = [
  "Focus on hidden connections between emails and non-obvious strategic opportunities.",
  "Focus on the human dynamics — what each sender's tone says, and how to strengthen these relationships.",
  "Focus on financial implications: what money is on the table, what's the upside, what's the risk of inaction.",
  "Focus on time pressure: what gets materially worse with every hour of delay.",
  "Think like a strategic advisor: what does this inbox reveal about where Fraction is as a business right now?",
];

function buildPrompt(emails: Email[], variation: string): string {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const emailList = emails
    .map((e) => `[${e.label}] From: ${e.from} <${e.fromEmail}>\nSubject: ${e.subject}\n${e.body.slice(0, 400)}`)
    .join("\n\n---\n\n");

  return `You are Leif's sharp, opinionated chief of staff at Fraction (fraction.com) — a fractional real estate co-ownership platform where homeowners sell partial stakes and buyers co-own premium properties. Today is ${today}.

You have read every email in Leif's inbox. Give him a frank, specific, intelligent morning brief. Use real names, real dollar amounts, real deadlines. Be direct about what to DO, not just what exists. Be smart enough to spot things Leif might miss. Light humour where it fits naturally. Never vague, never generic, never corporate.

Leif is a Sales Associate. His job is to close deals, support co-owners, build broker relationships, and grow the platform.

${variation}

Emails:
${emailList}

Respond with ONLY valid JSON — no markdown fences, no explanation. Use this exact structure:
{
  "openingLine": "One punchy sentence that captures the real vibe of today's inbox. Must be specific to what's actually in these emails.",
  "priorityCalls": [
    {
      "from": "sender name",
      "subject": "email subject",
      "stake": "what is actually at risk or on the table — specific amounts, deadlines, relationships",
      "action": "the exact next move Leif should take right now",
      "take": "frank 1-2 sentence assessment"
    }
  ],
  "interestingNotes": [
    "Insight about patterns, connections, or opportunities across emails that aren't obvious — specific and smart"
  ],
  "watchList": [
    "Something currently quiet that could blow up if ignored — with reasoning"
  ],
  "quickWins": [
    "Action that takes under 2 minutes but has real impact today"
  ],
  "closingLine": "One energising, specific line tied to what's actually on Leif's plate. Never a generic quote."
}

Include 2-3 priority calls, 2-3 interesting notes, 1-2 watch list items, 2-3 quick wins.`;
}

export default function DailyBriefPanel({ show, emails, onClose }: Props) {
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    const variation = VARIATIONS[Math.floor(Math.random() * VARIATIONS.length)];
    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(emails, variation) }),
      });
      const { text, error: apiError } = await res.json();
      if (apiError) throw new Error(apiError);
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      setBrief(JSON.parse(cleaned));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [emails]);

  // Auto-generate when panel first opens
  const handleOpen = useCallback(() => {
    if (!brief && !loading) generate();
  }, [brief, loading, generate]);

  // Trigger generation when shown
  if (show && !brief && !loading && !error) {
    handleOpen();
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-200"
        style={{
          background: "rgba(26,46,26,0.2)",
          opacity: show ? 1 : 0,
          pointerEvents: show ? "auto" : "none",
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed inset-y-0 right-0 z-50 flex flex-col"
        style={{
          width: 460,
          background: "#fff",
          boxShadow: "-4px 0 40px rgba(26,46,26,0.12)",
          transform: show ? "translateX(0)" : "translateX(100%)",
          transition: "transform 200ms ease-out",
        }}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--fraction-border)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
              style={{ background: "var(--fraction-green-light)" }}
            >
              ☀️
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--fraction-dark)" }}>Daily Brief</p>
              <p className="text-xs" style={{ color: "var(--fraction-muted)" }}>AI-generated inbox digest</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {brief && !loading && (
              <button
                onClick={generate}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors hover:bg-gray-50"
                style={{ borderColor: "var(--fraction-border)", color: "var(--fraction-text)" }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
              style={{ color: "var(--fraction-muted)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--fraction-green-light)" }}
              >
                <svg className="animate-spin w-5 h-5" style={{ color: "var(--fraction-green)" }} fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--fraction-dark)" }}>Reading your inbox…</p>
              <p className="text-xs" style={{ color: "var(--fraction-muted)" }}>Putting together your brief</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
              <p className="text-sm" style={{ color: "var(--fraction-text)" }}>Couldn't generate the brief.</p>
              <p className="text-xs" style={{ color: "var(--fraction-muted)" }}>{error}</p>
              <button
                onClick={generate}
                className="text-sm px-4 py-2 rounded-lg font-semibold text-white"
                style={{ background: "var(--fraction-green)" }}
              >
                Try again
              </button>
            </div>
          )}

          {brief && !loading && (
            <div className="px-6 py-6 space-y-6">
              {/* Greeting */}
              <div>
                <h2 className="font-display text-2xl mb-0.5" style={{ color: "var(--fraction-dark)", fontWeight: 500 }}>
                  Good morning, Leif.
                </h2>
                <p className="text-xs" style={{ color: "var(--fraction-muted)" }}>{today}</p>
                <p
                  className="mt-3 text-sm leading-relaxed font-medium italic"
                  style={{ color: "var(--fraction-text)" }}
                >
                  "{brief.openingLine}"
                </p>
              </div>

              <div style={{ borderTop: "1px solid var(--fraction-border)" }} />

              {/* Priority Calls */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--fraction-muted)" }}>
                  🔥 Priority Calls
                </h3>
                <div className="space-y-3">
                  {brief.priorityCalls.map((c, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-4"
                      style={{ background: "var(--fraction-green-light)", border: "1px solid var(--fraction-green-mid)" }}
                    >
                      <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--fraction-dark)" }}>
                        {c.from}
                      </p>
                      <p className="text-xs mb-2" style={{ color: "var(--fraction-muted)" }}>{c.subject}</p>
                      <p className="text-xs mb-1.5 leading-relaxed" style={{ color: "var(--fraction-text)" }}>
                        <span className="font-semibold">At stake:</span> {c.stake}
                      </p>
                      <p className="text-xs mb-1.5 leading-relaxed font-semibold" style={{ color: "var(--fraction-green-dark)" }}>
                        → {c.action}
                      </p>
                      <p className="text-xs leading-relaxed italic" style={{ color: "var(--fraction-text)" }}>
                        {c.take}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <div style={{ borderTop: "1px solid var(--fraction-border)" }} />

              {/* Interesting Notes */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--fraction-muted)" }}>
                  💡 Interesting Notes
                </h3>
                <ul className="space-y-2">
                  {brief.interestingNotes.map((note, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed" style={{ color: "var(--fraction-text)" }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--fraction-green)" }} />
                      {note}
                    </li>
                  ))}
                </ul>
              </section>

              <div style={{ borderTop: "1px solid var(--fraction-border)" }} />

              {/* Watch List */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--fraction-muted)" }}>
                  ⚠️ Watch List
                </h3>
                <ul className="space-y-2">
                  {brief.watchList.map((item, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed" style={{ color: "var(--fraction-text)" }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-amber-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <div style={{ borderTop: "1px solid var(--fraction-border)" }} />

              {/* Quick Wins */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--fraction-muted)" }}>
                  ✉️ Quick Wins
                </h3>
                <ul className="space-y-2">
                  {brief.quickWins.map((win, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed" style={{ color: "var(--fraction-text)" }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-sky-400" />
                      {win}
                    </li>
                  ))}
                </ul>
              </section>

              <div style={{ borderTop: "1px solid var(--fraction-border)" }} />

              {/* Closing line */}
              <p
                className="text-sm italic text-center pb-2"
                style={{ color: "var(--fraction-muted)" }}
              >
                {brief.closingLine}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
