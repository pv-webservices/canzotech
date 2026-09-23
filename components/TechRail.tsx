import { techLogos } from '@/lib/tech-logos';

/** Continuous marquee of the real brand marks we build with. */
export function TechRail() {
  const row = [...techLogos, ...techLogos];

  return (
    <div className="logo-rail" aria-label="Technologies we build with">
      <div className="logo-track">
        {row.map((logo, index) => (
          <span className="logo-chip" key={`${logo.label}-${index}`} aria-hidden={index >= techLogos.length}>
            <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
              <path d={logo.path} />
            </svg>
            <span>{logo.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
