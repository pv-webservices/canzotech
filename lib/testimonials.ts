// Client testimonials for the quote pop-up slider.
//
// Only entries with `approved: true` are ever published. Publishing a review that a real client did not give is
// prohibited under India's Consumer Protection (fake reviews) guidance and Google's review policies, so the
// entries below are DRAFTS that show the expected shape and tone. Replace each with a real client's words, name,
// role and company (with their written permission), then set `approved: true`.
//
// While no testimonial is approved, the slider shows CanzoTech's published delivery commitments instead.

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  approved: boolean;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      'They mapped our order workflow before writing any code, and the portal they delivered replaced three spreadsheets our team had relied on for years. Demos every two weeks meant there were no surprises at launch.',
    name: 'Client name',
    role: 'Operations Head',
    company: 'Client company (replace)',
    approved: false,
  },
  {
    quote:
      'Clear estimates, honest trade-offs and a team that picked up the phone. Our mobile app shipped on both stores and the handover documentation means our own developers can now extend it.',
    name: 'Client name',
    role: 'Founder',
    company: 'Client company (replace)',
    approved: false,
  },
  {
    quote:
      'CanzoTech automated the reporting our analysts used to assemble by hand every Monday. The security review they ran alongside the build caught issues our previous vendor had missed.',
    name: 'Client name',
    role: 'CTO',
    company: 'Client company (replace)',
    approved: false,
  },
];

export const approvedTestimonials = testimonials.filter((item) => item.approved);
