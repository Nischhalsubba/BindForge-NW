import { defineConfig, devices } from "@playwright/test";

const productionUrl = process.env.PRODUCTION_URL ?? "https://neverwinterkeybind.netlify.app";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "production-smoke.spec.ts",
  fullyParallel: false,
  forbidOnly: true,
  retries: 2,
  workers: 1,
  reporter: [["html", { open: "never", outputFolder: "production-smoke-report" }], ["list"]],
  use: {
    baseURL: productionUrl,
    browserName: "chromium",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "production-mobile",
      use: { ...devices["iPhone 13"], browserName: "chromium" },
    },
    {
      name: "production-tablet",
      use: { ...devices["iPad (gen 7)"], browserName: "chromium" },
    },
    {
      name: "production-desktop",
      use: { ...devices["Desktop Chrome"], browserName: "chromium" },
    },
  ],
});
