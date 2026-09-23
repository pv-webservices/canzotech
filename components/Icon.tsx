export type IconName =
  | 'code'
  | 'web'
  | 'mobile'
  | 'automation'
  | 'cloud'
  | 'design'
  | 'test'
  | 'consulting'
  | 'arrow'
  | 'arrowUpRight'
  | 'play'
  | 'check'
  | 'menu'
  | 'close'
  | 'mail'
  | 'phone'
  | 'pin'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronDown'
  | 'spark'
  | 'layers'
  | 'users'
  | 'target'
  | 'rocket'
  | 'shield'
  | 'clock'
  | 'quote'
  | 'plus'
  | 'minus';

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
  };

  const paths: Record<IconName, React.ReactNode> = {
    code: <><path d="m8 9-3 3 3 3"/><path d="m16 9 3 3-3 3"/><path d="m14 5-4 14"/></>,
    web: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8h18"/><path d="M8 12h3M8 16h8"/></>,
    mobile: <><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M10 5h4M11 19h2"/></>,
    automation: <><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="4"/><path d="m5.6 5.6 2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/></>,
    cloud: <><path d="M7 18h10a4 4 0 0 0 .8-7.9A6 6 0 0 0 6.4 9.1 4.5 4.5 0 0 0 7 18Z"/><path d="m9.5 13 2 2 3.5-4"/></>,
    design: <><path d="M4 18.5V7a2 2 0 0 1 2-2h8l6 6v7.5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 18.5Z"/><path d="M14 5v6h6"/><path d="m8 16 5-5"/></>,
    test: <><path d="M9 3h6v4l4 7a4 4 0 0 1-3.5 6h-7A4 4 0 0 1 5 14l4-7V3Z"/><path d="M8 13h8"/></>,
    consulting: <><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/><path d="m18 4 1.5-1.5M6 4 4.5 2.5"/></>,
    arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
    arrowUpRight: <><path d="M7 17 17 7"/><path d="M8 7h9v9"/></>,
    play: <path d="m9 7 8 5-8 5V7Z"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    phone: <path d="M7 3h3l2 5-2 1a15 15 0 0 0 5 5l1-2 5 2v3c0 2-1 3-3 3C10 20 4 14 4 6c0-2 1-3 3-3Z"/>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></>,
    chevronLeft: <path d="m15 6-6 6 6 6"/>,
    chevronRight: <path d="m9 6 6 6-6 6"/>,
    chevronDown: <path d="m6 9 6 6 6-6"/>,
    spark: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m12 8 1.6 2.4L16 12l-2.4 1.6L12 16l-1.6-2.4L8 12l2.4-1.6L12 8Z"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/></>,
    users: <><circle cx="9" cy="8" r="3.4"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.5a3.4 3.4 0 0 1 0 6.6M17.5 20a6 6 0 0 0-2.2-4.6"/></>,
    target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></>,
    rocket: <><path d="M12 3c3.5 2 5.5 5.5 5.5 9.5L15 15H9l-2.5-2.5C6.5 8.5 8.5 5 12 3Z"/><circle cx="12" cy="10" r="1.6"/><path d="M9 15c-1.6 1-2.4 2.6-2.5 4.5 1.9-.1 3.5-.9 4.5-2.5M15 15c1.6 1 2.4 2.6 2.5 4.5-1.9-.1-3.5-.9-4.5-2.5"/></>,
    shield: <><path d="M12 3 5 6v5.5c0 4.2 2.9 7.6 7 9.5 4.1-1.9 7-5.3 7-9.5V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    clock: <><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.2 2"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    minus: <path d="M5 12h14"/>,
    quote: <><path d="M9.5 6C7 7.4 5.5 9.8 5.5 12.6V18h5.4v-5.4H8.2c0-1.9.8-3.4 2.4-4.4L9.5 6Z"/><path d="M18 6c-2.5 1.4-4 3.8-4 6.6V18h5.4v-5.4h-2.7c0-1.9.8-3.4 2.4-4.4L18 6Z"/></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}
