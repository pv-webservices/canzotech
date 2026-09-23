// Solution blueprints: the product types CanzoTech builds, shown with concept visuals.
// Add verified client case studies here (or alongside) once approved for publication.

export type SolutionCategory = 'Web Applications' | 'Mobile Apps' | 'Commerce' | 'Enterprise';

export type Solution = {
  slug: string;
  name: string;
  type: string;
  categories: SolutionCategory[];
  image: string;
  summary: string;
  problem: string;
  approach: string[];
  features: string[];
  stack: string[];
  serviceSlug: string;
};

export const solutionCategories: SolutionCategory[] = ['Web Applications', 'Mobile Apps', 'Commerce', 'Enterprise'];

export const solutions: Solution[] = [
  {
    slug: 'saas-analytics-platform',
    name: 'SaaS Analytics Platform',
    type: 'Web Application',
    categories: ['Web Applications', 'Enterprise'],
    image: '/images/case-saas.webp',
    summary: 'Multi-tenant analytics dashboards that turn scattered operational data into real-time KPIs, reports and alerts.',
    problem:
      'Growing businesses often run on spreadsheets exported from five different tools. Decisions lag behind reality and nobody trusts the numbers.',
    approach: [
      'Map the metrics that actually drive decisions before designing a single chart',
      'Build a secure multi-tenant data model with role-based access',
      'Stream data from existing tools through reliable, monitored integrations',
      'Ship dashboards iteratively, validating each view with real users',
    ],
    features: ['Real-time KPI dashboards', 'Role-based access control', 'Scheduled and exportable reports', 'Threshold alerts and notifications', 'Third-party data connectors', 'Audit logs'],
    stack: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'AWS'],
    serviceSlug: 'web-development',
  },
  {
    slug: 'ecommerce-solution',
    name: 'E-Commerce Solution',
    type: 'Web & Mobile',
    categories: ['Commerce', 'Mobile Apps', 'Web Applications'],
    image: '/images/case-commerce.webp',
    summary: 'Fast storefronts and companion mobile apps with catalogue, checkout, payments and order management built in.',
    problem:
      'Template stores hit a ceiling quickly: slow pages, rigid checkout flows and no room for the custom logistics or pricing rules a growing brand needs.',
    approach: [
      'Design mobile-first shopping journeys around conversion data',
      'Use a headless architecture so web and app share one commerce backend',
      'Integrate payment gateways, shipping partners and inventory systems',
      'Optimise Core Web Vitals and search visibility from day one',
    ],
    features: ['Headless storefront', 'iOS & Android shopping app', 'Secure payments & UPI', 'Inventory & order management', 'Promotions and coupons', 'Customer accounts & wishlists'],
    stack: ['Next.js', 'React Native', 'Node.js', 'PostgreSQL', 'Payment gateways', 'Vercel'],
    serviceSlug: 'mobile-app-development',
  },
  {
    slug: 'fintech-app',
    name: 'FinTech App',
    type: 'Mobile Application',
    categories: ['Mobile Apps', 'Enterprise'],
    image: '/images/case-fintech.webp',
    summary: 'Secure money-management experiences with account overviews, transactions, insights and bank-grade security.',
    problem:
      'Financial products must feel effortless while meeting strict security, compliance and reliability expectations — a hard balance to strike.',
    approach: [
      'Threat-model sensitive flows before implementation',
      'Design clear, reassuring UX for balances, transfers and alerts',
      'Integrate banking and payment APIs with idempotent, auditable services',
      'Automate regression and security testing in the release pipeline',
    ],
    features: ['Biometric authentication', 'Transaction history & search', 'Spending insights and charts', 'Instant push alerts', 'KYC onboarding flow', 'Encrypted data at rest and in transit'],
    stack: ['React Native', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Playwright'],
    serviceSlug: 'mobile-app-development',
  },
  {
    slug: 'healthcare-portal',
    name: 'Healthcare Portal',
    type: 'Web Application',
    categories: ['Web Applications', 'Enterprise'],
    image: '/images/case-health.webp',
    summary: 'Patient and clinic portals for appointments, health records, vitals tracking and secure communication.',
    problem:
      'Clinics juggle phone bookings, paper records and disconnected systems, while patients expect the convenience of any modern app.',
    approach: [
      'Shadow front-desk and clinical workflows to find real friction',
      'Design accessible interfaces for patients of every age',
      'Protect sensitive health data with strict access controls and audit trails',
      'Integrate with existing practice-management and lab systems',
    ],
    features: ['Online appointment booking', 'Patient health records', 'Vitals and trend charts', 'Secure messaging', 'Prescription and report downloads', 'Clinic admin dashboard'],
    stack: ['Next.js', 'TypeScript', 'Python', 'PostgreSQL', 'Azure', 'Figma'],
    serviceSlug: 'web-development',
  },
];
