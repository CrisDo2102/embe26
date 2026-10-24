import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against the PRODUCTION build: `npm run build && npm run e2e`.
 * First time on a machine: `npm run e2e:install`.
 * Set PW_CHROMIUM_PATH (and optionally PW_CHROMIUM_ARGS) to reuse an existing Chromium instead of downloading one.
 */
const executablePath = process.env.PW_CHROMIUM_PATH;
const args = process.env.PW_CHROMIUM_ARGS?.split(" ").filter(Boolean);
const port = 3210;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    ...(executablePath ? { launchOptions: { executablePath, args } } : {}),
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run start -- -p ${port}`,
    url: `http://127.0.0.1:${port}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
