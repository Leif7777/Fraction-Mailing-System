import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function parseFrom(raw: string): { name: string; email: string } {
  const match = raw.match(/^(.+?)\s*<(.+?)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: raw.trim(), email: raw.trim() };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Resend inbound payload shape
    const data = payload.data ?? payload;
    const rawFrom: string = data.from ?? "";
    const subject: string = data.subject ?? "(no subject)";
    const html: string = data.html ?? "";
    const text: string = data.text ?? stripHtml(html);

    const { name, email } = parseFrom(rawFrom);

    const newEmail = {
      id: `inbound_${Date.now()}`,
      from: name || email,
      fromEmail: email,
      subject,
      body: text.slice(0, 2000),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
      label: "Needs Reply",
    };

    await kv.lpush("fraction_inbound_emails", JSON.stringify(newEmail));
    await kv.ltrim("fraction_inbound_emails", 0, 199); // keep last 200

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Inbound webhook error:", err);
    return NextResponse.json({ error: "Failed to process email" }, { status: 500 });
  }
}
