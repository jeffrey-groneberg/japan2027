import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.js",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4177",
    browserName: "chromium",
    viewport: { width: 1440, height: 1000 },
    colorScheme: "light",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:4177",
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
});
