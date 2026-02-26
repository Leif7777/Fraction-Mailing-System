import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { Email } from "@/lib/emails";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { email }: { email: Email } = await req.json();

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `You are drafting a reply on behalf of Leif, a Sales Associate at Fraction (fraction.com) — a platform that enables fractional co-ownership of luxury and vacation real estate. Fraction helps homeowners sell partial stakes in their properties, and helps buyers own a share of premium homes they couldn't otherwise afford outright. Co-owners split costs, usage rights, and rental income proportionally.

Write a concise, professional, and personalized reply as Leif. Match the tone of the original email — casual if they're casual, formal if they're formal. Be warm, knowledgeable about fractional real estate, and solution-oriented. Do not add a subject line. Start directly with the salutation.

Original email:
From: ${email.from} <${email.fromEmail}>
Subject: ${email.subject}

${email.body}

Write only the email body — no subject line, no metadata.`,
      },
    ],
  });

  const draft =
    message.content[0].type === "text" ? message.content[0].text : "";

  return NextResponse.json({ draft });
}
