import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { Email, EmailLabel } from "@/lib/emails";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { emails }: { emails: Email[] } = await req.json();

  const emailSummaries = emails
    .map(
      (e) =>
        `ID: ${e.id}
From: ${e.from} <${e.fromEmail}>
Subject: ${e.subject}
Body: ${e.body.slice(0, 300)}`
    )
    .join("\n\n---\n\n");

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an executive assistant. Analyze these emails and assign each one a label and priority score.

Labels:
- "Urgent": requires immediate action today
- "Needs Reply": requires a response but not today
- "FYI": informational, no action needed
- "Ignore": newsletters, promotions, spam

Emails:
${emailSummaries}

Respond with ONLY a JSON array (no markdown, no explanation) in this exact format:
[{"id": "1", "label": "Urgent", "priority": 1}, {"id": "2", "label": "Needs Reply", "priority": 2}, ...]

Priority 1 = most urgent. Sort by priority ascending.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Strip markdown code blocks if present
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  const results: Array<{ id: string; label: EmailLabel; priority: number }> =
    JSON.parse(cleaned);

  return NextResponse.json({ results });
}
