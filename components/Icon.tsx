export type IconName =
  | 'arrowUpRight'
  | 'check'
  | 'close'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronDown'
  | 'plus'
  | 'minus'
  | 'mail'
  | 'phone'
  | 'mobile'
  | 'whatsapp'
  | 'linkedin'
  | 'instagram'
  | 'pin'
  | 'quote'
  | 'shield';

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
  };

  const paths: Record<IconName, React.ReactNode> = {
    arrowUpRight: <><path d="M7 17 17 7"/><path d="M8 7h9v9"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    chevronLeft: <path d="m15 6-6 6 6 6"/>,
    chevronRight: <path d="m9 6 6 6-6 6"/>,
    chevronDown: <path d="m6 9 6 6 6-6"/>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    minus: <path d="M5 12h14"/>,
    mail: <><rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6.5 9 6.5 9-6.5"/></>,
    // Desk / landline handset.
    phone: <path d="M21.5 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1.6 4.2 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.6 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>,
    mobile: <><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/></>,
    whatsapp: <><path d="M3.5 20.5 4.8 16A8.5 8.5 0 1 1 8 19.2z"/><path d="M9 8.6c0 3.4 2.9 6.4 6.4 6.4l1-1.3-1.9-1-1 .7a4 4 0 0 1-2.1-2.1l.7-1-1-1.9z"/></>,
    linkedin: <><rect x="2.5" y="2.5" width="19" height="19" rx="3"/><path d="M7.5 10.5v6M7.5 7.5v.01M11.5 16.5v-6M11.5 13a2.5 2.5 0 0 1 5 0v3.5"/></>,
    instagram: <><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><path d="M17.3 6.7v.01"/></>,
    pin: <><path d="M19.5 10c0 5.5-7.5 11.5-7.5 11.5S4.5 15.5 4.5 10a7.5 7.5 0 0 1 15 0z"/><circle cx="12" cy="10" r="2.6"/></>,
    quote: <><path d="M4 18v-5a6 6 0 0 1 5-6"/><path d="M4 13h5v5H4zM14 18v-5a6 6 0 0 1 5-6"/><path d="M14 13h5v5h-5z"/></>,
    shield: <><path d="M12 2.5 4.5 5.5v6c0 4.7 3.2 8.6 7.5 10 4.3-1.4 7.5-5.3 7.5-10v-6z"/><path d="m8.8 12 2.2 2.2 4.3-4.4"/></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}
