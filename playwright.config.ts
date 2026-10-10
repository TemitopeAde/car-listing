import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./src/tests/e2e",
  globalSetup: "./src/tests/e2e/setup.ts",
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:4322",
    headless: true,
    screenshot: "only-on-failure",
  },
  webServer: {
    command:
      "CAR_LISTING_DEMO=1 CAR_LISTING_DEMO_DATA=.data/e2e.json npx astro dev --host 127.0.0.1 --port 4322",
    url: "http://127.0.0.1:4322/preview",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
