import nodemailer from 'nodemailer';
import { handleEnquiry, type HandlerDeps, type MailEnv } from '@/lib/server/enquiry-handler';
import { createRateLimiter } from '@/lib/server/rate-limit';

// Reads SMTP credentials from the host's environment at request time; never prerendered or cached.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };
const rateLimiter = createRateLimiter(RATE_LIMIT);
// Kept under the browser's 20-second request timeout so the visitor always gets a clear answer.
const SMTP_TIMEOUT_MS = 12_000;

const sendMail: HandlerDeps['sendMail'] = async (message, smtp) => {
  const port = Number(smtp.SMTP_PORT);
  const transport = nodemailer.createTransport({
    host: smtp.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: smtp.SMTP_USER, pass: smtp.SMTP_PASS },
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
  });
  return transport.sendMail(message);
};

/** Only the mail settings are handed to the handler, read fresh on every request. */
function mailEnv(): MailEnv {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO, MAIL_FROM, ALLOWED_ORIGINS } = process.env;
  return { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO, MAIL_FROM, ALLOWED_ORIGINS };
}

export async function POST(request: Request) {
  return handleEnquiry(request, {
    env: mailEnv(),
    sendMail,
    rateLimiter,
    log: (message, detail) => console.error(`[enquiry] ${message}`, detail ?? ''),
  });
}
