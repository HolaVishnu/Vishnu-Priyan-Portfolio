import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
}

/**
 * Receives contact transmissions. Currently logs to the server console —
 * swap the marked block for an email provider (Resend, SES, SendGrid)
 * when a sending domain is configured.
 */
export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !message || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Name, valid email and message are required" },
      { status: 422 }
    );
  }
  if (name.length > 200 || email.length > 320 || message.length > 5000) {
    return NextResponse.json({ ok: false, error: "Payload too large" }, { status: 422 });
  }

  // --- email provider integration point -----------------------------------
  // await resend.emails.send({ to: "vishnupriyan1708@gmail.com", ... })
  console.log(`[transmission] from ${name} <${email}>: ${message.slice(0, 400)}`);
  // -------------------------------------------------------------------------

  return NextResponse.json({ ok: true });
}
