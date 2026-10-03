// Generates every favicon / app icon from the brand mark on a solid white square.
// Run: npm run icons   (outputs to public/, which Next serves from the site root)
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const MARK = 'public/images/brand/canzotech-mark.webp';
const BACKGROUND = '#ffffff';
// The mark is wide and short, so it fills most of the width to stay legible at 16px.
const MARK_WIDTH_RATIO = 0.86;

async function icon(size) {
  const mark = await sharp(MARK)
    .resize({ width: Math.round(size * MARK_WIDTH_RATIO), height: Math.round(size * MARK_WIDTH_RATIO), fit: 'inside' })
    .png()
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: BACKGROUND } })
    .composite([{ input: mark, gravity: 'center' }])
    .png({ compressionLevel: 9, palette: true, quality: 95 })
    .toBuffer();
}

/** Packs PNG images into one .ico container (PNG-in-ICO is supported by every current browser). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

const outputs = {
  'favicon-48x48.png': 48,
  'favicon-96x96.png': 96,
  'icon-192x192.png': 192,
  'icon-512x512.png': 512,
  'apple-touch-icon.png': 180,
};
for (const [file, size] of Object.entries(outputs)) {
  await writeFile(`public/${file}`, await icon(size));
}

const icoSizes = [16, 32, 48];
await writeFile('public/favicon.ico', ico(await Promise.all(icoSizes.map(async (size) => ({ size, data: await icon(size) })))));

// The mark only exists as a raster, so the SVG favicon wraps a crisp 128px PNG on the same white square.
const svgPng = (await icon(128)).toString('base64');
await writeFile(
  'public/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 128 128" width="128" height="128"><image width="128" height="128" href="data:image/png;base64,${svgPng}" xlink:href="data:image/png;base64,${svgPng}"/></svg>\n`,
);
console.log('Icons written to public/');
