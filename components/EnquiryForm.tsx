'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useId, useRef, useState } from 'react';
import { Icon } from './Icon';
import { company, whatsappLink } from '@/lib/site-data';
import { submitEnquiry } from '@/lib/enquiry';
import {
  BUDGET_OPTIONS,
  type Enquiry,
  type EnquiryErrors,
  type EnquiryField,
  FIELD_LIMITS,
  FIELD_ORDER,
  type FormType,
  hasErrors,
  MIN_DETAILS_LENGTH,
  MIN_NAME_LENGTH,
  SERVICE_OPTIONS,
  validateEnquiry,
} from '@/lib/enquiry-validation';
import { countryCodes, DEFAULT_COUNTRY_ISO, findCountry } from '@/lib/country-codes';

type Draft = Pick<Enquiry, 'name' | 'email' | 'countryCode' | 'phone' | 'company' | 'service' | 'budget' | 'details' | 'consent'>;

const EMPTY: Draft = { name: '', email: '', countryCode: DEFAULT_COUNTRY_ISO, phone: '', company: '', service: '', budget: '', details: '', consent: false };

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'invalid'; count: number }
  | { kind: 'offline' }
  | { kind: 'timeout' }
  | { kind: 'failed'; message: string };

const draftKey = (formType: FormType) => `canzotech-enquiry-draft-${formType}`;

/** Saves typing in this tab so a reload, a failed send or the Back button never loses it. */
function loadDraft(formType: FormType): Draft | null {
  try {
    const raw = sessionStorage.getItem(draftKey(formType));
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Draft>) } : null;
  } catch {
    return null;
  }
}

function saveDraft(formType: FormType, draft: Draft | null) {
  try {
    if (draft) sessionStorage.setItem(draftKey(formType), JSON.stringify(draft));
    else sessionStorage.removeItem(draftKey(formType));
  } catch {
    // Storage can be unavailable (private mode); the form still works without it.
  }
}

function AltContacts() {
  return (
    <span className="alt-contacts">
      <a href={company.mobileHref}>
        <Icon name="mobile" size={14} /> {company.mobile}
      </a>
      <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
        <Icon name="whatsapp" size={14} /> WhatsApp
      </a>
      <a href={`mailto:${company.email}`}>
        <Icon name="mail" size={14} /> {company.email}
      </a>
    </span>
  );
}

function StatusMessage({ status }: { status: Status }) {
  if (status.kind === 'idle' || status.kind === 'sending') return null;
  const text: Record<Exclude<Status['kind'], 'idle' | 'sending'>, string> = {
    invalid: `Please correct the ${status.kind === 'invalid' && status.count > 1 ? `${status.count} highlighted fields` : 'highlighted field'} below.`,
    offline: 'You appear to be offline. Your message is saved on this page — reconnect and press Send again.',
    timeout: 'The server took too long to respond. Your message is still here — please try again, or reach us directly:',
    failed: status.kind === 'failed' ? status.message : '',
  };
  const showAlternatives = status.kind === 'timeout' || status.kind === 'failed';
  return (
    <p className="form-status error" role="alert">
      <Icon name="close" size={16} />
      <span>
        {text[status.kind]}
        {showAlternatives ? <AltContacts /> : null}
      </span>
    </p>
  );
}

export function EnquiryForm({ formType, compact = false, heading }: { formType: FormType; compact?: boolean; heading?: React.ReactNode }) {
  const router = useRouter();
  const uid = useId();
  const id = (field: string) => `${uid}-${field}`;
  const [form, setForm] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const formRef = useRef<HTMLFormElement>(null);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    const draft = loadDraft(formType);
    if (draft) setForm(draft);
    // Returning with the Back button can restore a page frozen mid-send; make the button usable again.
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setStatus({ kind: 'idle' });
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [formType]);

  // After the first submit attempt, errors update live as the visitor corrects each field.
  useEffect(() => {
    if (attempted) setErrors(validateEnquiry(toEnquiry(form)));
  }, [attempted, form]);

  function toEnquiry(draft: Draft): Enquiry {
    return { ...draft, formType, website: honeypotValue(), page: window.location.href, startedAt: startedAt.current };
  }

  function honeypotValue() {
    return formRef.current?.querySelector<HTMLInputElement>('input[name="website"]')?.value ?? '';
  }

  function update<K extends keyof Draft>(field: K, value: Draft[K]) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      saveDraft(formType, next);
      return next;
    });
  }

  function focusFirstInvalid(found: EnquiryErrors) {
    const first = FIELD_ORDER.find((field) => found[field]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === 'sending') return;
    setAttempted(true);

    const enquiry = toEnquiry(form);
    const found = validateEnquiry(enquiry);
    setErrors(found);
    if (hasErrors(found)) {
      setStatus({ kind: 'invalid', count: Object.keys(found).length });
      focusFirstInvalid(found);
      return;
    }

    setStatus({ kind: 'sending' });
    const result = await submitEnquiry(enquiry);
    if (result.kind === 'success') {
      saveDraft(formType, null);
      router.push(result.redirect);
      return;
    }
    if (result.kind === 'invalid') {
      setErrors(result.errors);
      setStatus({ kind: 'invalid', count: Object.keys(result.errors).length });
      focusFirstInvalid(result.errors);
      return;
    }
    // The form keeps every value on failure; nothing is cleared until the enquiry is delivered.
    setStatus(result.kind === 'failed' ? { kind: 'failed', message: result.message } : { kind: result.kind });
  }

  /** WhatsApp alternative: opens a chat with the message pre-filled. Not subject to the time trap. */
  function sendViaWhatsApp() {
    const lines = [
      `Hi CanzoTech, I'm ${form.name || '…'}${form.company ? ` from ${form.company}` : ''}.`,
      form.service ? `Service: ${form.service}` : '',
      form.details,
      form.email ? `Email: ${form.email}` : '',
    ].filter(Boolean);
    window.open(whatsappLink(lines.join('\n')), '_blank', 'noopener,noreferrer');
  }

  /** Accessibility wiring shared by every validated control. */
  function a11y(field: EnquiryField) {
    return {
      id: id(field),
      name: field,
      'aria-invalid': errors[field] ? true : undefined,
      'aria-describedby': errors[field] ? id(`${field}-error`) : undefined,
    };
  }

  function fieldError(field: EnquiryField) {
    return errors[field] ? (
      <span className="field-error" id={id(`${field}-error`)}>
        {errors[field]}
      </span>
    ) : null;
  }

  const sending = status.kind === 'sending';

  return (
    <form
      ref={formRef}
      className={`contact-form ${compact ? 'contact-form-compact' : ''}`}
      action="/api/enquiry"
      method="POST"
      onSubmit={submit}
      noValidate
      aria-busy={sending}
    >
      {heading ?? (
        <header className="form-header">
          <h2>Project enquiry</h2>
          <p>Fields marked * are required.</p>
        </header>
      )}

      <input type="hidden" name="formType" value={formType} />
      <input type="hidden" name="startedAt" value={startedAt.current ?? ''} />
      <div className="honeypot" aria-hidden="true">
        <label>
          <span>Website</span>
          <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="form-grid">
        <div className="field">
          <label className="field-label" htmlFor={id('name')}>Full name <em>*</em></label>
          <input {...a11y('name')} required minLength={MIN_NAME_LENGTH} maxLength={FIELD_LIMITS.name} autoComplete="name" value={form.name} onChange={(event) => update('name', event.target.value)} />
          {fieldError('name')}
        </div>
        <div className="field">
          <label className="field-label" htmlFor={id('email')}>Email <em>*</em></label>
          <input {...a11y('email')} required type="email" inputMode="email" maxLength={FIELD_LIMITS.email} autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} />
          {fieldError('email')}
        </div>
        <div className="field phone-field">
          <label className="field-label" htmlFor={id('phone')}>Phone <em>*</em></label>
          <div className="phone-row">
            {/* The native select stays on top (transparent) so it keeps full keyboard and mobile picker support. */}
            <div className="phone-code">
              <span className="phone-code-value" aria-hidden="true">
                {form.countryCode} {findCountry(form.countryCode).dial}
                <Icon name="chevronDown" size={14} />
              </span>
              <select name="countryCode" aria-label="Country code" value={form.countryCode} onChange={(event) => update('countryCode', event.target.value)}>
                {countryCodes.map((country) => (
                  <option key={country.iso} value={country.iso}>
                    {country.name} ({country.dial})
                  </option>
                ))}
              </select>
            </div>
            <input {...a11y('phone')} required type="tel" inputMode="tel" maxLength={FIELD_LIMITS.phone} autoComplete="tel-national" value={form.phone} onChange={(event) => update('phone', event.target.value)} />
          </div>
          {fieldError('phone')}
        </div>
        {compact ? null : (
          <div className="field">
            <label className="field-label" htmlFor={id('company')}>Company</label>
            <input {...a11y('company')} maxLength={FIELD_LIMITS.company} autoComplete="organization" value={form.company} onChange={(event) => update('company', event.target.value)} />
            {fieldError('company')}
          </div>
        )}
        <div className="field">
          <label className="field-label" htmlFor={id('service')}>Service interested in</label>
          <select {...a11y('service')} value={form.service} onChange={(event) => update('service', event.target.value)}>
            <option value="">Select a service</option>
            {SERVICE_OPTIONS.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          {fieldError('service')}
        </div>
        {compact ? null : (
          <div className="field">
            <label className="field-label" htmlFor={id('budget')}>Estimated budget</label>
            <select {...a11y('budget')} value={form.budget} onChange={(event) => update('budget', event.target.value)}>
              <option value="">Select a range</option>
              {BUDGET_OPTIONS.map((range) => (
                <option key={range}>{range}</option>
              ))}
            </select>
            {fieldError('budget')}
          </div>
        )}
      </div>

      <div className="field full-field">
        <label className="field-label" htmlFor={id('details')}>{compact ? 'Message' : 'Project details'} <em>*</em></label>
        <textarea
          {...a11y('details')}
          required
          minLength={MIN_DETAILS_LENGTH}
          maxLength={FIELD_LIMITS.details}
          rows={compact ? 3 : 6}
          value={form.details}
          onChange={(event) => update('details', event.target.value)}
          placeholder="What are you trying to build or improve? What does success look like?"
        />
        {fieldError('details')}
      </div>

      <div className="field consent-field">
        <label className="consent" htmlFor={id('consent')}>
          <input {...a11y('consent')} type="checkbox" value="yes" required checked={form.consent} onChange={(event) => update('consent', event.target.checked)} />
          <span>
            I agree that CanzoTech may use these details to reply to my enquiry, as described in the{' '}
            <Link href="/privacy-policy" target={compact ? '_blank' : undefined}>privacy policy</Link>. <em>*</em>
          </span>
        </label>
        {fieldError('consent')}
      </div>

      <StatusMessage status={status} />

      <div className="form-actions">
        <button disabled={sending} className="btn btn-solid submit-button" type="submit">
          <span>{sending ? 'Sending…' : compact ? 'Get my free quote' : 'Send enquiry'}</span>
          <Icon name="arrowUpRight" size={14} />
        </button>
        <button type="button" className="btn btn-outline whatsapp-button" onClick={sendViaWhatsApp}>
          <span>Send via WhatsApp</span>
          <Icon name="whatsapp" size={16} />
        </button>
      </div>
    </form>
  );
}
