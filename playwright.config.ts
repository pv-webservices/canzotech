import { defineConfig } from '@playwright/test';

// Browser tests run against the production build (`npm run build` first) using the locally installed Chrome,
// so no browser download is needed. The enquiry endpoint is intercepted in every test: nothing is ever sent.
const PORT = 3100;

export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  // The whole-site sweeps are heavy; two workers keep the local server responsive.
  workers: 2,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `node node_modules/next/dist/bin/next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
