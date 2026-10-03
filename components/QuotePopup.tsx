'use client';

import { useEffect, useRef, useState } from 'react';
import { EnquiryForm } from './EnquiryForm';
import { Icon } from './Icon';
import { commitments } from '@/lib/site-data';
import { techLogos } from '@/lib/tech-logos';
import { approvedTestimonials } from '@/lib/testimonials';

const SLIDE_MS = 6000;
const TRUST_MARKS = ['Google Cloud', 'Kubernetes', 'React', 'Next.js', 'PostgreSQL'];

type Slide = { quote: string; name: string; detail: string };

// Real client quotes once approved; until then, the delivery commitments already published on the site.
const slides: Slide[] = approvedTestimonials.length
  ? approvedTestimonials.map((item) => ({ quote: item.quote, name: item.name, detail: `${item.role}, ${item.company}` }))
  : commitments.map((item) => ({ quote: item.text, name: item.title, detail: `Our commitment · ${item.tag}` }));
const slidesAreTestimonials = approvedTestimonials.length > 0;

const assurances = ['You own 100% of the code and IP', 'Working software every two weeks', 'Your details are only used to reply to you'];

function Slider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % slides.length), SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  const go = (step: number) => setActive((index) => (index + step + slides.length) % slides.length);

  return (
    <div
      className="qp-slider"
      role="region"
      aria-roledescription="carousel"
      aria-label={slidesAreTestimonials ? 'What clients say' : 'Our commitments'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="qp-track" style={{ transform: `translateX(calc(${-active} * (100% + var(--qp-gap))))` }}>
        {slides.map((slide, index) => (
          <figure
            className="qp-slide"
            key={slide.name}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
            aria-hidden={index !== active}
          >
            <Icon name="quote" size={26} />
            <blockquote>{slide.quote}</blockquote>
            <figcaption>
              <strong>{slide.name}</strong>
              <span className="mono">{slide.detail}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="qp-controls">
        <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label="Previous">
          <Icon name="chevronLeft" size={18} />
        </button>
        <div className="qp-dots">
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.name}
              aria-label={`Show ${index + 1} of ${slides.length}`}
              aria-current={index === active}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
        <button type="button" className="icon-btn" onClick={() => go(1)} aria-label="Next">
          <Icon name="chevronRight" size={18} />
        </button>
      </div>
    </div>
  );
}

function TrustRow() {
  const marks = TRUST_MARKS.map((label) => techLogos.find((logo) => logo.label === label)).filter((logo) => logo !== undefined);
  return (
    <div className="qp-trust">
      <span className="mono">Engineering on</span>
      <ul>
        {marks.map((logo) => (
          <li key={logo.label} title={logo.label}>
            <svg viewBox="0 0 24 24" role="img" aria-label={logo.label}>
              <path d={logo.path} />
            </svg>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "Get a free quote" dialog: slider and trust marks on the left, the compact enquiry form on the right. */
export function QuotePopup({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // showModal() gives a real modal: focus moves inside, Tab is trapped, Escape closes, the page behind is inert.
    dialog.showModal();
    document.body.classList.add('dialog-open');
    return () => document.body.classList.remove('dialog-open');
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="qp"
      aria-labelledby="qp-title"
      onClose={onClose}
      onKeyDown={(event) => {
        // Chrome may ignore Escape on a dialog opened without a user gesture (this one opens on a timer).
        if (event.key === 'Escape') {
          event.preventDefault();
          dialogRef.current?.close();
        }
      }}
      onClick={(event) => {
        // A click on the backdrop (the dialog element itself, outside the panel) closes it.
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
    >
      <div className="qp-panel">
        <button type="button" className="qp-close" onClick={() => dialogRef.current?.close()} aria-label="Close the free quote form">
          <Icon name="close" size={22} />
        </button>

        <aside className="qp-side" aria-label="Why work with CanzoTech">
          <span className="mono index-label">{slidesAreTestimonials ? 'Client voices' : 'How we work'}</span>
          <Slider />
          <ul className="qp-assure">
            {assurances.map((item) => (
              <li key={item}>
                <Icon name="shield" size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <TrustRow />
        </aside>

        <div className="qp-main">
          <EnquiryForm
            formType="quote"
            compact
            heading={
              <header className="qp-head">
                <h2 id="qp-title" className="display">
                  Get a free <em>quote</em>
                </h2>
                <p>Share your requirements and get a detailed proposal. Fields marked * are required.</p>
              </header>
            }
          />
        </div>
      </div>
    </dialog>
  );
}
