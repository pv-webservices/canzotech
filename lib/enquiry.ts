// Browser side of the enquiry form: posts JSON to our own endpoint (app/api/enquiry), which sends the email
// through the client's Zoho mailbox. No third-party form service is involved and the visitor never leaves the site.
import type { Enquiry, EnquiryErrors } from './enquiry-validation';

export const ENQUIRY_ENDPOINT = '/api/enquiry';
export const REQUEST_TIMEOUT_MS = 20_000;

export type SubmitResult =
  | { kind: 'success'; redirect: string }
  | { kind: 'invalid'; errors: EnquiryErrors; message: string }
  | { kind: 'offline' }
  | { kind: 'timeout' }
  | { kind: 'failed'; message: string };

type ApiResponse = { ok?: boolean; redirect?: string; code?: string; message?: string; errors?: EnquiryErrors };

const GENERIC_FAILURE = 'Your enquiry could not be delivered just now.';

export async function submitEnquiry(enquiry: Enquiry): Promise<SubmitResult> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return { kind: 'offline' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(ENQUIRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(enquiry),
      signal: controller.signal,
    });
  } catch {
    if (controller.signal.aborted) return { kind: 'timeout' };
    // fetch only rejects on network failure; distinguish "no connection" from "server unreachable".
    return navigator.onLine === false ? { kind: 'offline' } : { kind: 'failed', message: GENERIC_FAILURE };
  } finally {
    clearTimeout(timer);
  }

  const data = (await response.json().catch(() => ({}))) as ApiResponse;
  if (response.ok && data.ok) return { kind: 'success', redirect: data.redirect ?? '/thank-you' };
  if (data.code === 'invalid' && data.errors) return { kind: 'invalid', errors: data.errors, message: data.message ?? '' };
  return { kind: 'failed', message: data.message ?? GENERIC_FAILURE };
}
