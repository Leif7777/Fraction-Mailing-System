import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

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
