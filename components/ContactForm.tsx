'use client';

import { FormEvent, useState } from 'react';
import { Icon } from './Icon';
import { services } from '@/lib/site-data';
import { type Enquiry, sendEnquiry, validateEnquiry } from '@/lib/enquiry';
import { countryCodes, DEFAULT_COUNTRY_ISO, findCountry } from '@/lib/country-codes';

const initial: Enquiry = { name: '', email: '', countryCode: DEFAULT_COUNTRY_ISO, phone: '', company: '', service: '', budget: '', details: '', website: '' };

export function ContactForm() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');
    const invalid = validateEnquiry(form);
    if (invalid) {
      setStatus('error');
      setMessage(invalid);
      return;
    }
    try {
      await sendEnquiry(form);
      setStatus('success');
      setMessage('Thanks — your enquiry has been received. We will get back to you shortly.');
      setForm(initial);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to submit your enquiry.');
    }
  }

  function update(field: keyof typeof initial, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
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
          <input required minLength={2} autoComplete="name" value={form.name} onChange={(event) => update('name', event.target.value)} />
        </label>
        <label>
          <span className="field-label">Business Email <em>*</em></span>
          <input required type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} />
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
              id="enquiry-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
            />
          </div>
        </div>
        <label>
          <span className="field-label">Company</span>
          <input autoComplete="organization" value={form.company} onChange={(event) => update('company', event.target.value)} />
        </label>
        <label>
          <span className="field-label">Service Interested In</span>
          <select value={form.service} onChange={(event) => update('service', event.target.value)}>
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.slug}>{service.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Estimated Budget</span>
          <select value={form.budget} onChange={(event) => update('budget', event.target.value)}>
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
          required
          minLength={20}
          rows={6}
          value={form.details}
          onChange={(event) => update('details', event.target.value)}
          placeholder="What are you trying to build or improve? What does success look like?"
        />
      </label>

      <button disabled={status === 'loading'} className="btn btn-solid submit-button" type="submit">
        <span>{status === 'loading' ? 'Sending…' : 'Send Enquiry'}</span>
        <Icon name="arrowUpRight" size={14} />
      </button>

      {message ? (
        <p className={`form-status ${status}`} role="status">
          <Icon name={status === 'success' ? 'check' : 'close'} size={16} /> {message}
        </p>
      ) : null}
    </form>
  );
}
