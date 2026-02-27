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

    // Ignore all non-inbound events (sent, delivered, bounced, opened, clicked, etc.)
    if (payload.type && payload.type !== "email.received") {
      return NextResponse.json({ ok: true });
    }

    const data = payload.data ?? payload;
    console.log("Inbound payload:", JSON.stringify(payload, null, 2));

    const emailId: string = data.email_id ?? data.id ?? "";
    const rawFrom: string = data.from ?? "";
    const subject: string = data.subject ?? "(no subject)";

    const { name, email } = parseFrom(rawFrom);

    // Try body from webhook payload first, then fall back to Resend API
    let body = data.text || (data.html ? stripHtml(data.html) : "");

    if (!body && emailId) {
      // Resend webhook doesn't include body — must fetch from receiving API
      const res = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      const full = await res.json();
      console.log("Resend receiving API fetch:", JSON.stringify(full, null, 2));
      body = full.text || (full.html ? stripHtml(full.html) : "");
    }

    const now = new Date();
    const newEmail = {
      id: `inbound_${Date.now()}`,
      from: name || email,
      fromEmail: email,
      subject,
      body: body.slice(0, 2000),
      time: now.toISOString(),
      timestamp: now.toISOString(),
      read: false,
      label: "Needs Reply",
    };

    await kv.lpush("fraction_inbound_emails", JSON.stringify(newEmail));
    await kv.ltrim("fraction_inbound_emails", 0, 199);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Inbound webhook error:", err);
    return NextResponse.json({ error: "Failed to process email" }, { status: 500 });
  }
}
