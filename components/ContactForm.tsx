'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { services } from '@/lib/site-data';
import { sendEnquiry } from '@/lib/enquiry';
import {
  type Enquiry,
  type EnquiryErrors,
  type EnquiryField,
  FIELD_LIMITS,
  FIELD_ORDER,
  hasErrors,
  MIN_DETAILS_LENGTH,
  validateEnquiry,
} from '@/lib/enquiry-validation';
import { countryCodes, DEFAULT_COUNTRY_ISO, findCountry } from '@/lib/country-codes';

const initial: Enquiry = { name: '', email: '', countryCode: DEFAULT_COUNTRY_ISO, phone: '', company: '', service: '', budget: '', details: '', website: '' };

// Stops accidental double sends and simple flooding from one browser tab.
const RESEND_COOLDOWN_MS = 60_000;

type Status = 'idle' | 'loading' | 'success' | 'error';

function FieldError({ field, message }: { field: EnquiryField; message?: string }) {
  if (!message) return null;
  return (
    <span className="field-error" id={`enquiry-${field}-error`}>
      {message}
    </span>
  );
}

export function ContactForm() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const startedAt = useRef(0);
  const lastSentAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // After the first submit attempt, errors update live as the visitor corrects each field.
  useEffect(() => {
    if (attempted) setErrors(validateEnquiry(form));
  }, [attempted, form]);

  function focusFirstInvalid(found: EnquiryErrors) {
    const first = FIELD_ORDER.find((field) => found[field]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'loading') return;
    setAttempted(true);

    const found = validateEnquiry(form);
    setErrors(found);
    if (hasErrors(found)) {
      setStatus('idle');
      setMessage('');
      focusFirstInvalid(found);
      return;
    }

    if (Date.now() - lastSentAt.current < RESEND_COOLDOWN_MS) {
      setStatus('error');
      setMessage('Your enquiry was just sent. Please wait a minute before sending another.');
      return;
    }

    setStatus('loading');
    setMessage('');
    try {
      await sendEnquiry(form, startedAt.current);
      lastSentAt.current = Date.now();
      startedAt.current = Date.now();
      setStatus('success');
      setMessage('Thanks — your enquiry has been received. We will get back to you shortly.');
      setAttempted(false);
      setErrors({});
      setForm(initial);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to submit your enquiry.');
    }
  }

  function update(field: keyof Enquiry, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  /** Accessibility wiring shared by every validated input. */
  function a11y(field: EnquiryField) {
    return {
      name: field,
      'aria-invalid': errors[field] ? true : undefined,
      'aria-describedby': errors[field] ? `enquiry-${field}-error` : undefined,
    };
  }

  const showSummary = attempted && hasErrors(errors);

  return (
    <form ref={formRef} className="contact-form" onSubmit={submit} noValidate aria-busy={status === 'loading'}>
      <header className="form-header">
        <h2>Project enquiry</h2>
        <p>Fields marked * are required.</p>
      </header>

      <div className="honeypot" aria-hidden="true">
        <label>
          <span>Website</span>
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update('website', event.target.value)} />
        </label>
      </div>

      <div className="form-grid">
        <label>
          <span className="field-label">Full Name <em>*</em></span>
          <input
            {...a11y('name')}
            required
            minLength={2}
            maxLength={FIELD_LIMITS.name}
            autoComplete="name"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
          />
          <FieldError field="name" message={errors.name} />
        </label>
        <label>
          <span className="field-label">Business Email <em>*</em></span>
          <input
            {...a11y('email')}
            required
            type="email"
            inputMode="email"
            maxLength={FIELD_LIMITS.email}
            autoComplete="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
          />
          <FieldError field="email" message={errors.email} />
        </label>
        <div className="phone-field">
          <label className="field-label" htmlFor="enquiry-phone">Phone</label>
          <div className="phone-row">
            {/* The native select stays on top (transparent) so it keeps full keyboard and mobile picker support. */}
            <div className="phone-code">
              <span className="phone-code-value" aria-hidden="true">
                {form.countryCode} {findCountry(form.countryCode).dial}
                <Icon name="chevronDown" size={14} />
              </span>
              <select
                aria-label="Country code"
                value={form.countryCode}
                onChange={(event) => update('countryCode', event.target.value)}
              >
                {countryCodes.map((country) => (
                  <option key={country.iso} value={country.iso}>
                    {country.name} ({country.dial})
                  </option>
                ))}
              </select>
            </div>
            <input
              {...a11y('phone')}
              id="enquiry-phone"
              type="tel"
              inputMode="tel"
              maxLength={FIELD_LIMITS.phone}
              autoComplete="tel-national"
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
            />
          </div>
          <FieldError field="phone" message={errors.phone} />
        </div>
        <label>
          <span className="field-label">Company</span>
          <input
            {...a11y('company')}
            maxLength={FIELD_LIMITS.company}
            autoComplete="organization"
            value={form.company}
            onChange={(event) => update('company', event.target.value)}
          />
          <FieldError field="company" message={errors.company} />
        </label>
        <label>
          <span className="field-label">Service Interested In</span>
          <select name="service" value={form.service} onChange={(event) => update('service', event.target.value)}>
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.slug}>{service.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Estimated Budget</span>
          <select name="budget" value={form.budget} onChange={(event) => update('budget', event.target.value)}>
            <option value="">Select a range</option>
            <option>To be discussed</option>
            <option>₹1L–₹3L</option>
            <option>₹3L–₹8L</option>
            <option>₹8L+</option>
          </select>
        </label>
      </div>

      <label className="full-field">
        <span className="field-label">Project Details <em>*</em></span>
        <textarea
          {...a11y('details')}
          required
          minLength={MIN_DETAILS_LENGTH}
          maxLength={FIELD_LIMITS.details}
          rows={6}
          value={form.details}
          onChange={(event) => update('details', event.target.value)}
          placeholder="What are you trying to build or improve? What does success look like?"
        />
        <FieldError field="details" message={errors.details} />
      </label>

      <button disabled={status === 'loading'} className="btn btn-solid submit-button" type="submit">
        <span>{status === 'loading' ? 'Sending…' : 'Send Enquiry'}</span>
        <Icon name="arrowUpRight" size={14} />
      </button>

      {showSummary ? (
        <p className="form-status error" role="alert">
          <Icon name="close" size={16} /> Please correct the highlighted fields.
        </p>
      ) : message ? (
        <p className={`form-status ${status}`} role={status === 'error' ? 'alert' : 'status'}>
          <Icon name={status === 'success' ? 'check' : 'close'} size={16} /> {message}
        </p>
      ) : null}
    </form>
  );
}
