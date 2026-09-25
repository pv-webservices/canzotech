import type { IconName } from '@/components/Icon';

export type Service = {
  slug: string;
  name: string;
  shortName: string;
  icon: IconName;
  description: string;
  intro: string;
  challenges: string[];
  capabilities: string[];
  stack: string[];
  faqs: { question: string; answer: string }[];
};

export const company = {
  name: 'CanzoTech',
  email: 'canzotech@gmail.com',
  mobile: '7651850667',
  phone: '7651850667',
  landline: 'LN-012029644430',
  linkedin: 'https://www.linkedin.com/company/canzotech/home/',
  location: 'BSI Business Park H161 Sector 63 Noida',
  address: 'BSI Business Park H161 Sector 63 Noida',
  description:
    'CanzoTech designs and develops scalable software products for operational, customer-facing and growth-critical business needs.',
};

export const navigation = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Our Work', href: '/work' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
];

export const services: Service[] = [
  {
    slug: 'custom-software-development',
    name: 'Custom Software Development',
    shortName: 'Custom Software',
    icon: 'code',
    description:
      'Tailored platforms, internal tools and digital products built around your workflows and business rules.',
    intro:
      'We design and engineer custom software when packaged products cannot match your workflows, integrations, security requirements or growth plans.',
    challenges: [
      'Manual processes that slow teams down',
      'Legacy systems that are difficult to extend',
      'Disconnected data across departments',
      'Off-the-shelf tools that force poor workflows',
    ],
    capabilities: [
      'Product discovery and technical planning',
      'Business workflow applications',
      'Customer and partner portals',
      'Internal operational platforms',
      'Third-party and legacy integrations',
      'Modernization and staged migration',
    ],
    stack: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'PostgreSQL', 'REST / GraphQL', 'Cloud platforms'],
    faqs: [
      {
        question: 'Can you replace an existing legacy system in phases?',
        answer:
          'Yes. A staged migration is often lower risk than a full replacement. The architecture can be planned so new modules progressively take over existing workflows.',
      },
      {
        question: 'Can the software integrate with our current tools?',
        answer:
          'Where supported APIs or secure integration methods exist, the solution can connect to CRM, ERP, payment, messaging, analytics and internal systems.',
      },
    ],
  },
  {
    slug: 'web-development',
    name: 'Web Application Development',
    shortName: 'Web Development',
    icon: 'web',
    description:
      'Responsive, secure web applications engineered for real operational use, not just presentation.',
    intro:
      'We build web applications that combine clear UX, maintainable frontend architecture and dependable backend systems.',
    challenges: [
      'Slow or fragile web products',
      'Poor mobile usability',
      'Complex multi-role workflows',
      'Scalability and integration constraints',
    ],
    capabilities: [
      'SaaS and B2B web applications',
      'Admin panels and dashboards',
      'Customer self-service portals',
      'API-backed frontend systems',
      'Authentication and permissions',
      'Performance and accessibility improvement',
    ],
    stack: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'REST / GraphQL', 'Vercel / Cloud'],
    faqs: [
      {
        question: 'Do you build both frontend and backend?',
        answer: 'Yes. Projects can include frontend, backend, database, authentication, integrations and deployment architecture.',
      },
      {
        question: 'Can you improve an existing web application?',
        answer: 'Yes. We can work from an existing codebase where the architecture and project access make that practical.',
      },
    ],
  },
  {
    slug: 'mobile-app-development',
    name: 'Mobile App Development',
    shortName: 'Mobile Apps',
    icon: 'mobile',
    description:
      'Mobile products for iOS and Android with focused UX, reliable APIs and scalable product architecture.',
    intro:
      'We develop mobile products around user tasks, business workflows and maintainable release cycles rather than one-off screens.',
    challenges: ['Inconsistent cross-platform experiences', 'Poor app performance', 'Complex backend integration', 'Difficult release and maintenance cycles'],
    capabilities: ['Product UX for mobile', 'Cross-platform app development', 'Native integrations', 'Secure authentication', 'Push notifications', 'Analytics and release support'],
    stack: ['React Native', 'TypeScript', 'iOS / Android APIs', 'Node.js', 'Firebase', 'REST / GraphQL', 'Cloud services'],
    faqs: [
      { question: 'Can one app support both iOS and Android?', answer: 'Yes. Cross-platform development can cover both platforms where the product requirements are suitable.' },
      { question: 'Do you support store submission?', answer: 'Store submission and release support can be included in the delivery scope.' },
    ],
  },
  {
    slug: 'ai-automation',
    name: 'AI & Automation Solutions',
    shortName: 'AI & Automation',
    icon: 'automation',
    description:
      'Practical automation for repetitive workflows, internal knowledge tasks and software-assisted decision processes.',
    intro:
      'We use automation and AI where they can reduce repetitive work, improve response time or support existing teams with better workflow tooling.',
    challenges: ['Repetitive manual operations', 'Slow hand-offs between systems', 'Unstructured internal information', 'High-volume routine support tasks'],
    capabilities: ['Workflow automation', 'AI-assisted internal tools', 'Document and data processing', 'System-to-system orchestration', 'Human-in-the-loop workflows', 'Evaluation and guardrail design'],
    stack: ['Python', 'Node.js', 'LLM APIs', 'Vector databases', 'Webhooks', 'RPA-compatible integrations', 'Cloud functions'],
    faqs: [
      { question: 'Does every automation require AI?', answer: 'No. Deterministic automation is often cheaper and more reliable. AI is used only where the task benefits from language or unstructured-data handling.' },
      { question: 'Can humans approve AI-generated actions?', answer: 'Yes. Human approval steps can be built into workflows where risk or business policy requires them.' },
    ],
  },
  {
    slug: 'cloud-devops',
    name: 'Cloud & DevOps Services',
    shortName: 'Cloud & DevOps',
    icon: 'cloud',
    description:
      'Deployment, infrastructure and release practices designed for stability, security and predictable delivery.',
    intro:
      'We help teams move from manual or fragile deployments to repeatable environments, clearer observability and safer release workflows.',
    challenges: ['Manual deployments', 'Environment drift', 'Unclear production visibility', 'Scaling and reliability issues'],
    capabilities: ['Cloud architecture', 'CI/CD pipelines', 'Infrastructure automation', 'Monitoring and logging', 'Performance tuning', 'Release and rollback planning'],
    stack: ['AWS / Azure / GCP', 'Docker', 'GitHub Actions', 'Terraform-compatible IaC', 'Vercel', 'Monitoring platforms'],
    faqs: [
      { question: 'Can you work with our current cloud provider?', answer: 'Yes. The approach can be adapted to the provider and deployment model already used by the product.' },
      { question: 'Do you handle CI/CD setup?', answer: 'Yes. Automated build, test and deployment pipelines can be part of the scope.' },
    ],
  },
  {
    slug: 'ui-ux-design',
    name: 'UI/UX Design',
    shortName: 'UI/UX Design',
    icon: 'design',
    description:
      'Product interfaces grounded in real user journeys, business rules and implementation constraints.',
    intro:
      'We design interfaces to make complex tasks easier to understand and complete, while keeping implementation practical for engineering teams.',
    challenges: ['Confusing user journeys', 'Inconsistent interfaces', 'High support dependency', 'Designs disconnected from implementation realities'],
    capabilities: ['UX discovery', 'Information architecture', 'Wireframes and flows', 'Interface design', 'Design systems', 'Developer handoff and review'],
    stack: ['Figma', 'Design tokens', 'Responsive systems', 'Accessibility standards', 'Component-based design'],
    faqs: [
      { question: 'Can you redesign an existing product?', answer: 'Yes. Redesign work can start from product review, task analysis and existing analytics or customer feedback where available.' },
      { question: 'Do designers work with developers?', answer: 'Yes. Design and engineering should stay connected so interactions, responsive behavior and edge cases are resolved before release.' },
    ],
  },
  {
    slug: 'qa-testing',
    name: 'QA & Software Testing',
    shortName: 'QA & Testing',
    icon: 'test',
    description:
      'Structured quality assurance for functional behavior, regressions, user flows and release confidence.',
    intro:
      'We add repeatable quality checks around critical workflows so releases are less dependent on ad-hoc manual verification.',
    challenges: ['Recurring regressions', 'Unclear release readiness', 'Incomplete edge-case coverage', 'Manual testing bottlenecks'],
    capabilities: ['Test planning', 'Functional QA', 'Regression testing', 'API testing', 'Automation strategy', 'Release verification'],
    stack: ['Playwright', 'API test tooling', 'CI pipelines', 'Browser/device matrices', 'Issue tracking workflows'],
    faqs: [
      { question: 'Can QA be added to an existing product team?', answer: 'Yes. QA can be introduced as an embedded delivery function without requiring a full rebuild of the product process.' },
      { question: 'Do you automate all tests?', answer: 'No. Automation is most useful for stable, repeatable and high-value flows. Exploratory and usability checks still require human judgment.' },
    ],
  },
  {
    slug: 'cyber-security',
    name: 'Cyber Security Services',
    shortName: 'Cyber Security',
    icon: 'shield',
    description:
      'Security assessments, hardening and secure engineering practices that protect applications, data and infrastructure.',
    intro:
      'We help businesses find and fix security weaknesses across applications, cloud environments and delivery pipelines, and build security into how software is designed and released.',
    challenges: ['Unknown vulnerabilities in live applications', 'Misconfigured cloud and access permissions', 'Sensitive data without clear protection', 'Security checks left until just before release'],
    capabilities: ['Security assessment and threat modelling', 'Vulnerability assessment and penetration testing', 'Secure code review', 'Cloud and infrastructure hardening', 'Identity and access management', 'DevSecOps and security monitoring'],
    stack: ['OWASP ASVS / Top 10', 'Burp Suite', 'OWASP ZAP', 'SAST / DAST tooling', 'Dependency scanning', 'Cloud security controls', 'SIEM / logging platforms'],
    faqs: [
      { question: 'Can you test an application that is already live?', answer: 'Yes. Assessments are scoped and scheduled with you in advance, and testing on production can be limited or moved to a staging environment to avoid disruption.' },
      { question: 'Do you help fix the issues you find?', answer: 'Yes. Findings come with prioritised, practical remediation guidance, and our engineers can implement and verify the fixes if you want us to.' },
    ],
  },
  {
    slug: 'technology-consulting',
    name: 'Technology Consulting',
    shortName: 'Consulting',
    icon: 'consulting',
    description:
      'Practical architecture, modernization and delivery guidance for product and operational technology decisions.',
    intro:
      'We help businesses make technical decisions with clearer trade-offs around architecture, modernization, delivery sequencing and long-term maintainability.',
    challenges: ['Unclear architecture direction', 'Vendor or platform lock-in concerns', 'Modernization risk', 'Delivery teams without a clear technical roadmap'],
    capabilities: ['Architecture assessment', 'Technical discovery', 'Modernization planning', 'Build-vs-buy analysis', 'Delivery roadmap', 'Engineering process review'],
    stack: ['Architecture documentation', 'Cloud and web platforms', 'API ecosystems', 'Delivery tooling', 'Security-aware design'],
    faqs: [
      { question: 'Can consulting be independent from development?', answer: 'Yes. Advisory work can be a standalone engagement when the business only needs technical direction or an implementation plan.' },
      { question: 'Can you review an existing architecture?', answer: 'Yes. Reviews can cover maintainability, performance, security boundaries, deployment and delivery risks.' },
    ],
  },
];

// Delivery-model facts (not client counts). Swap in verified business metrics when available.
export const stats = [
  { value: 9, suffix: '', label: 'Core service capabilities' },
  { value: 4, suffix: '', label: 'Phase delivery framework' },
  { value: 100, suffix: '%', label: 'Code & IP ownership for clients' },
  { value: 2, suffix: ' wk', label: 'Sprint cadence with live demos' },
];

export const techStack = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'React Native', 'PostgreSQL', 'Redis',
  'GraphQL', 'AWS', 'Azure', 'Google Cloud', 'Docker', 'Terraform', 'Firebase', 'Figma', 'Playwright',
];

// Shown instead of testimonials until verified client quotes are supplied.
export const commitments = [
  { title: 'You own everything we build', text: 'Source code, designs, documentation and infrastructure accounts are handed over to you. No lock-in, no hostage repositories.', tag: 'Ownership' },
  { title: 'Working software every sprint', text: 'Every two weeks you see a live demo of real, running features — not slide decks or status percentages.', tag: 'Visibility' },
  { title: 'Trade-offs explained in business terms', text: 'Architecture and scope decisions come with their cost, risk and benefit spelled out so you can decide with confidence.', tag: 'Clarity' },
  { title: 'Quality built in, not bolted on', text: 'Code review, automated tests and release checks run throughout delivery instead of a rushed QA phase at the end.', tag: 'Quality' },
  { title: 'Partnership after launch', text: 'Monitoring, iteration and support plans keep your product improving once real users arrive.', tag: 'Continuity' },
];

export const jobs = [
  // Add verified roles here. Example shape:
  // { role: 'Frontend Engineer', department: 'Engineering', location: 'India / Remote', type: 'Full-time' }
] as { role: string; department: string; location: string; type: string }[];
