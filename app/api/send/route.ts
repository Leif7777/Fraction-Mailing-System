import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { to, cc, bcc, subject, html } = await req.json();

    if (!to?.length) {
      return NextResponse.json({ error: "No recipients" }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: "Leif <leif@fraction.life>",
      to,
      cc: cc?.length ? cc : undefined,
      bcc: bcc?.length ? bcc : undefined,
      subject: subject || "(no subject)",
      html,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    console.error("Send error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
