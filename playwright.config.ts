import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * End-to-end tests against the real stack: FastAPI backend + waste classifier + this site.
 *
 *   npm run test:e2e            builds the site and starts everything on spare ports with a fresh database
 *                               (the build fixes where /api/v1 is forwarded, so it is built for API_PORT)
 *   E2E_BASE_URL=http://localhost:3000 E2E_API_URL=http://localhost:8000 npx playwright test
 *                               reuses servers you already run (tests change their data)
 *
 * The backend lives in ../Waste-management (set WM_BACKEND_DIR to change it).
 */
const WEB_PORT = 3010;
const API_PORT = 8010;
const MODEL_PORT = 8001;
const external = process.env.E2E_BASE_URL;
const backendDir = process.env.WM_BACKEND_DIR ?? path.resolve(__dirname, "../Waste-management");
export const runtimeDir = path.resolve(__dirname, "e2e/.runtime");
export const fakeCamera = path.join(runtimeDir, "banana-peel.y4m");

/** Use the installed Chromium for this Playwright version, or else the newest one in the cache. */
function chromiumPath(): string | undefined {
  if (process.env.PW_CHROMIUM) return process.env.PW_CHROMIUM;
  const cache = path.join(os.homedir(), ".cache/ms-playwright");
  try {
    const wanted = JSON.parse(fs.readFileSync(path.resolve(__dirname, "node_modules/playwright-core/browsers.json"), "utf8")).browsers.find(
      (b: { name: string }) => b.name === "chromium"
    ).revision;
    if (fs.existsSync(path.join(cache, `chromium-${wanted}`))) return undefined;
    const dirs = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort();
    const exe = dirs.length ? path.join(cache, dirs[dirs.length - 1], "chrome-linux64/chrome") : "";
    return fs.existsSync(exe) ? exe : undefined;
  } catch {
    return undefined;
  }
}

const launchOptions = {
  executablePath: chromiumPath(),
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-video-capture=${fakeCamera}`],
};

// Ward 17, Route 3 (Baneshwor): close to its first stops, so travel times are short.
const geolocation = { latitude: 27.6884, longitude: 85.3352 };

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e/.report" }]],
  outputDir: "e2e/.results",
  use: {
    baseURL: external ?? `http://localhost:${WEB_PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    geolocation,
    permissions: ["geolocation", "camera"],
    launchOptions,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions }, testIgnore: /(citizen|driver)\.spec/ },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions } },
  ],
  webServer: external
    ? undefined
    : [
        {
          name: "model",
          command: "YOLO_AUTOINSTALL=false .venv/bin/python -m uvicorn app.main:app --port " + MODEL_PORT,
          cwd: path.join(backendDir, "model-service"),
          url: `http://localhost:${MODEL_PORT}/health`,
          reuseExistingServer: true,
          timeout: 120_000,
        },
        {
          name: "backend",
          command: `mkdir -p ${runtimeDir} && rm -rf ${runtimeDir}/e2e.db ${runtimeDir}/uploads && .venv/bin/python -m uvicorn app.main:app --port ${API_PORT} --timeout-keep-alive 75`,
          cwd: path.join(backendDir, "backend"),
          env: {
            DATABASE_URL: `sqlite+aiosqlite:///${runtimeDir}/e2e.db`,
            UPLOAD_DIR: `${runtimeDir}/uploads`,
            MODEL_SERVICE_URL: `http://localhost:${MODEL_PORT}`,
            SEED_ON_STARTUP: "true",
          },
          url: `http://localhost:${API_PORT}/health`,
          reuseExistingServer: false,
          timeout: 60_000,
        },
        {
          name: "web",
          command: `npx next start -p ${WEB_PORT}`,
          env: { BACKEND_URL: `http://localhost:${API_PORT}` },
          url: `http://localhost:${WEB_PORT}`,
          reuseExistingServer: false,
          timeout: 60_000,
        },
      ],
});

export const API = process.env.E2E_API_URL ?? `http://localhost:${API_PORT}`;
