import { Icon, type IconName } from './Icon';
import { company, socials, whatsappLink } from '@/lib/site-data';

type Item = { icon: IconName; label: string; text: string; href?: string; external?: boolean };

const items: Item[] = [
  ...company.emails.map((email) => ({ icon: 'mail' as const, label: 'Email', text: email, href: `mailto:${email}` })),
  { icon: 'mobile', label: 'Mobile', text: company.mobile, href: company.mobileHref },
  { icon: 'phone', label: 'Landline', text: company.landline, href: company.landlineHref },
  { icon: 'whatsapp', label: 'WhatsApp', text: 'Chat on WhatsApp', href: whatsappLink(), external: true },
  { icon: 'pin', label: 'Office', text: company.location },
];

/** Every way to reach CanzoTech, each with an icon and an accessible label. Used on the contact page, footer and menu. */
export function ContactDetails({ tone = 'paper', showSocials = true }: { tone?: 'paper' | 'ink'; showSocials?: boolean }) {
  return (
    <div className={`contact-list contact-list-${tone}`}>
      <ul>
        {items.map((item) => (
          <li key={`${item.label}-${item.text}`}>
            <Icon name={item.icon} size={17} />
            <span className="sr-only">{item.label}: </span>
            {item.href ? (
              <a href={item.href} {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {item.text}
              </a>
            ) : (
              <span>{item.text}</span>
            )}
          </li>
        ))}
      </ul>
      {showSocials ? <SocialLinks /> : null}
    </div>
  );
}

export function SocialLinks() {
  return (
    <ul className="social-links" aria-label="CanzoTech on social media">
      {socials.map((social) => (
        <li key={social.label}>
          <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`CanzoTech on ${social.label} (opens in a new tab)`}>
            <Icon name={social.icon} size={18} />
          </a>
        </li>
      ))}
    </ul>
  );
}
