import type { Enquiry } from '../lib/enquiry-validation.ts';

/** A complete, genuine enquiry that passes every check. */
export const validEnquiry: Enquiry = {
  formType: 'contact',
  name: 'Asha Verma',
  email: 'asha@example.com',
  countryCode: 'IN',
  phone: '98765 43210',
  company: 'Example Pvt Ltd',
  service: 'Web Application Development',
  budget: 'To be discussed',
  details: 'We need a customer portal connected to our existing ERP system.',
  consent: true,
  website: '',
  page: 'https://www.canzotech.com/contact',
  startedAt: 1_000_000,
};
