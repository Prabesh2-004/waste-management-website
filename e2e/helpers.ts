import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { API } from "../playwright.config";

export type Role = "citizen" | "driver" | "ward" | "kmc";

export const ACCOUNTS: Record<Role, string> = {
  citizen: "asha.gurung@example.com",
  driver: "ram.thapa@kathmandu.gov.np",
  ward: "ward17@kathmandu.gov.np",
  kmc: "anita.shrestha@kathmandu.gov.np",
};

const LABEL: Record<Role, string> = { citizen: "Citizen", driver: "Driver", ward: "Ward staff", kmc: "KMC staff" };
const LANDING: Record<Role, RegExp> = {
  citizen: /\/citizen$/,
  driver: /\/driver$/,
  ward: /\/ward\/dashboard$/,
  kmc: /\/kmc\/dashboard$/,
};

/** Sign in through the shared login page, as a user would. */
export async function login(page: Page, role: Role, email = ACCOUNTS[role]) {
  await page.goto("/");
  await page.getByRole("radio", { name: LABEL[role] }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("demo1234");
  await page.getByRole("button", { name: `Sign in as ${LABEL[role]}` }).click();
  await expect(page).toHaveURL(LANDING[role], { timeout: 20_000 });
  await expect(page.getByText("Loading…")).toHaveCount(0);
}

/** Collect uncaught exceptions and React/console errors. Network noise (map tiles, aborted fetches) is ignored. */
export function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const text = m.text();
    if (/Failed to load resource|net::ERR|tile|cartocdn|favicon|ERR_ABORTED|status of 4\d\d|status of 503/i.test(text)) return;
    errors.push(`console: ${text}`);
  });
  return errors;
}

/** Fails when the page scrolls sideways (a common phone layout bug). */
export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "page is wider than the screen").toBeLessThanOrEqual(1);
}

const SKIP = /log ?out|sign out|delete|remove|cancel my registration/i;

/**
 * Click every visible button in the page body once (re-opening the page when a click
 * navigates away), dismiss whatever opens, and report the buttons it clicked.
 * Errors are collected by watchErrors.
 */
/** Open a page and wait until it has rendered (pages with live maps poll, so "network idle" never comes). */
async function open(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("main").first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Loading…")).toHaveCount(0);
  await page.waitForTimeout(400);
}

export async function sweepButtons(page: Page, path: string, root = "main"): Promise<string[]> {
  await open(page, path);
  const clicked: string[] = [];
  const total = await page.locator(`${root} button:visible`).count();
  for (let i = 0; i < total; i++) {
    if (new URL(page.url()).pathname !== path.split("?")[0]) await open(page, path);
    const button = page.locator(`${root} button:visible`).nth(i);
    if (!(await button.count())) break;
    const label = ((await button.getAttribute("aria-label")) ?? (await button.innerText().catch(() => ""))).trim().replace(/\s+/g, " ");
    if (SKIP.test(label) || (await button.isDisabled())) continue;
    await button.click({ timeout: 2000 }).catch(() => undefined);
    clicked.push(label || `button #${i}`);
    await page.waitForTimeout(200);
    // Close any drawer or modal it opened.
    if (await page.getByRole("dialog").count()) {
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }
  }
  return clicked;
}

/** Call the API directly (to check what the UI saved). */
export async function api<T>(path: string, role: Role, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const auth = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ACCOUNTS[role], password: "demo1234", portal: role }),
  });
  const { access_token } = await auth.json();
  const res = await fetch(`${API}${path}`, {
    method: init.method ?? "GET",
    headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  return res.json() as Promise<T>;
}

async function token(role: Role): Promise<string> {
  const auth = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ACCOUNTS[role], password: "demo1234", portal: role }),
  });
  return (await auth.json()).access_token;
}

/** File a report as the demo citizen (multipart, like the citizen section does). */
export async function createCitizenReport(description: string): Promise<{ id: number; ref: string }> {
  const form = new FormData();
  form.append("type", "Overflowing waste or litter");
  form.append("category", "Waste");
  form.append("description", description);
  form.append("location", "Near school");
  const res = await fetch(`${API}/api/v1/citizen/reports`, { method: "POST", headers: { Authorization: `Bearer ${await token("citizen")}` }, body: form });
  return res.json();
}
