import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
  try {
    const raw = await kv.lrange("fraction_inbound_emails", 0, 199);
    const emails = raw.map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );
    return NextResponse.json({ emails });
  } catch (err) {
    console.error("Failed to fetch inbound emails:", err);
    return NextResponse.json({ emails: [] });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const raw = await kv.lrange("fraction_inbound_emails", 0, 199);
    const emails = raw.map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );
    const filtered = emails.filter((e: { id: string }) => e.id !== id);
    await kv.del("fraction_inbound_emails");
    if (filtered.length > 0) {
      await kv.rpush("fraction_inbound_emails", ...filtered.map((e: object) => JSON.stringify(e)));
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete email:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
