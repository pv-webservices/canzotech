import { Icon } from './Icon';
import { company, whatsappLink } from '@/lib/site-data';

/** Floating WhatsApp chat button, linked to the company mobile number. */
export function WhatsAppWidget() {
  return (
    <a className="wa-widget" href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label={`Chat with CanzoTech on WhatsApp (${company.mobile}, opens in a new tab)`}>
      <Icon name="whatsapp" size={26} />
      <span className="wa-widget-label" aria-hidden="true">
        Chat with us
      </span>
    </a>
  );
}
