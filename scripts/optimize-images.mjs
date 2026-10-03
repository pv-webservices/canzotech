// Builds the web copies of the team photos from the full-resolution masters in source-files/.
// The masters never ship; only these cropped, compressed WebP files go into public/.
// Run: npm run images
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SOURCE = 'source-files/images/team';
const TARGET = 'public/images/team';
const QUALITY = 80;
const MAX_WIDTH = 1600;

// Crops remove baked-in overlays from the supplied photos ("by Employer" badge, caption text,
// another site's careers card, scan borders) so only the photograph itself is published.
const photos = [
  { from: 'office-floor-original.jpeg', to: 'office-floor.webp', crop: { left: 3, top: 4, width: 760, height: 410 } },
  { from: 'team-collaboration-original.jpeg', to: 'team-collaboration.webp', crop: { left: 0, top: 0, width: 712, height: 421 } },
  { from: 'careers-team-original.jpeg', to: 'careers-team.webp', crop: { left: 905, top: 0, width: 695, height: 620 } },
  { from: 'planning-wall-original.jpeg', to: 'planning-wall.webp', crop: { left: 12, top: 0, width: 479, height: 335 } },
  { from: 'conference-room-original.webp', to: 'conference-room.webp', crop: { left: 0, top: 100, width: 1000, height: 440 } },
];

await mkdir(TARGET, { recursive: true });
for (const photo of photos) {
  const info = await sharp(`${SOURCE}/${photo.from}`)
    .extract(photo.crop)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(`${TARGET}/${photo.to}`);
  console.log(`${photo.to}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
}
