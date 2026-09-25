import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// Shared renderer for the Open Graph / Twitter share cards. The cards are generated at build time.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const INK = '#0a0a0c';
const ON_INK = '#f7f7f8';
const ON_INK_MUTED = '#9797a1';
const GRADIENT = 'linear-gradient(100deg, #7b3fe4, #2563eb 48%, #22d3ee)';

type FontWeight = 400 | 500 | 600 | 700 | 800;
type OgFont = { name: string; data: ArrayBuffer; weight: FontWeight; style: 'normal' };

/**
 * Fetches a TTF subset (only the glyphs in `text`) from Google Fonts, the same families the site uses.
 * Returns null when offline, so the card still renders with the built-in fallback font.
 */
async function loadGoogleFont(family: string, weight: FontWeight, text: string): Promise<OgFont | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const source = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!source) return null;
    const response = await fetch(source);
    if (!response.ok) return null;
    return { name: family, data: await response.arrayBuffer(), weight, style: 'normal' };
  } catch {
    return null;
  }
}

async function loadMark(): Promise<string> {
  const png = await readFile(join(process.cwd(), 'assets/og-mark.png'));
  return `data:image/png;base64,${png.toString('base64')}`;
}

export async function renderOgImage({ label, title }: { label: string; title: string }) {
  const footer = 'canzotech.com';
  const location = 'Noida, India';
  const [mark, display, mono] = await Promise.all([
    loadMark(),
    loadGoogleFont('Archivo', 800, `${title}CanzoTech`),
    loadGoogleFont('JetBrains Mono', 500, `${label}${footer}${location}`.toUpperCase()),
  ]);
  const fonts = [display, mono].filter((font): font is OgFont => font !== null);
  const titleSize = title.length > 60 ? 64 : title.length > 36 ? 76 : 92;

  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: INK, color: ON_INK, padding: '64px 72px', fontFamily: 'Archivo' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
          <img src={mark} width={86} height={48} alt="" />
          <div style={{ display: 'flex', fontSize: 38, fontWeight: 800, letterSpacing: '-0.04em' }}>
            <span>Canzo</span>
            <span style={{ backgroundImage: GRADIENT, backgroundClip: 'text', color: 'transparent' }}>Tech</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', gap: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'JetBrains Mono', fontSize: 22, letterSpacing: '0.16em', textTransform: 'uppercase', color: ON_INK_MUTED }}>
            <div style={{ width: 44, height: 3, borderRadius: 2, backgroundImage: GRADIENT }} />
            {label}
          </div>
          <div style={{ display: 'flex', fontSize: titleSize, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.045em', maxWidth: 1000 }}>{title}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: 20, letterSpacing: '0.16em', textTransform: 'uppercase', color: ON_INK_MUTED }}>
          <span>{footer}</span>
          <span>{location}</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, backgroundImage: GRADIENT }} />
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
