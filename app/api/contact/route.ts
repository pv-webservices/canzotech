import { NextResponse } from 'next/server';

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const details = String(body.details || '').trim();
    const honeypot = String(body.website || '').trim();

    if (honeypot) return NextResponse.json({ ok: true });
    if (name.length < 2) return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    if (!validEmail(email)) return NextResponse.json({ error: 'Please enter a valid business email.' }, { status: 400 });
    if (details.length < 20) return NextResponse.json({ error: 'Please provide more detail about the project.' }, { status: 400 });

    // Production integration point:
    // Send to the client's verified email provider / CRM here.
    // Add deployment-level rate limiting or CAPTCHA before launch.

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
