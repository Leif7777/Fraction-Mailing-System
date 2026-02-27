import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const resend = new Resend(process.env.RESEND_API_KEY!);

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
      const { data: full, error } = await resend.emails.get(emailId);
      console.log("Resend API fetch:", JSON.stringify({ full, error }, null, 2));
      if (full) {
        body = full.text ?? (full.html ? stripHtml(full.html) : "");
      }
    }

    const newEmail = {
      id: `inbound_${Date.now()}`,
      from: name || email,
      fromEmail: email,
      subject,
      body: body.slice(0, 2000),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
