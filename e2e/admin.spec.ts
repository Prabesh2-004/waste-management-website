import { expect, test } from "@playwright/test";
import { api, createCitizenReport, expectNoHorizontalScroll, login, sweepButtons, watchErrors } from "./helpers";

const WARD_PAGES = ["dashboard", "collection", "awareness", "updates", "reports", "sms", "settings"];
const KMC_PAGES = ["dashboard", "collection", "awareness", "updates", "reports", "identify", "sms", "wards", "settings"];

test.describe("ward portal", () => {
  test.beforeEach(async ({ page }) => login(page, "ward"));

  test("every page loads and every button works without errors", async ({ page }, info) => {
    test.setTimeout(300_000);
    const errors = watchErrors(page);
    for (const p of WARD_PAGES) {
      const clicked = await sweepButtons(page, `/ward/${p}`);
      if (info.project.name === "mobile") await expectNoHorizontalScroll(page);
      expect(clicked.length, `buttons on /ward/${p}`).toBeGreaterThan(0);
    }
    expect(errors).toEqual([]);
  });

  test("sidebar links reach every page", async ({ page }, info) => {
    for (const label of ["Collection Management", "Awareness Programs", "Updates & Information", "Reports & Complaints", "SMS Alerts", "Profile & Settings", "Dashboard"]) {
      if (info.project.name === "mobile") await page.getByRole("button", { name: "Open menu" }).click();
      await page.getByRole("link", { name: label, exact: true }).click();
      await expect(page.locator("aside a[aria-current=page]")).toHaveText(label);
    }
  });

  test("dashboard shows the live collection map with trucks", async ({ page }) => {
    await page.goto("/ward/dashboard");
    await expect(page.locator(".leaflet-container").first()).toBeVisible();
    await expect(page.locator(".leaflet-marker-icon").first()).toBeVisible();
  });

  test("a status change on a citizen report reaches the citizen's timeline", async ({ page }) => {
    const created = await createCitizenReport("E2E: bin overflowing near the school");
    await page.goto("/ward/reports");
    await page.getByText(created.ref).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("E2E: bin overflowing near the school")).toBeVisible();
    await dialog.getByRole("combobox").first().selectOption("In Progress");
    await dialog.getByRole("button", { name: /save/i }).click();
    await expect
      .poll(async () => (await api<{ reports: { id: number; history: { status: string }[] }[] }>("/api/v1/citizen/state", "citizen")).reports.find((r) => r.id === created.id)?.history.map((h) => h.status))
      .toEqual(["Pending", "In Progress"]);
  });
});

test.describe("KMC portal", () => {
  test.beforeEach(async ({ page }) => login(page, "kmc"));

  test("every page loads and every button works without errors", async ({ page }, info) => {
    test.setTimeout(300_000);
    const errors = watchErrors(page);
    for (const p of KMC_PAGES) {
      const clicked = await sweepButtons(page, `/kmc/${p}`);
      if (info.project.name === "mobile") await expectNoHorizontalScroll(page);
      expect(clicked.length, `buttons on /kmc/${p}`).toBeGreaterThan(0);
    }
    expect(errors).toEqual([]);
  });

  test("city-wide live map and go-to-ward", async ({ page }) => {
    await page.goto("/kmc/collection");
    await expect(page.locator(".leaflet-container").first()).toBeVisible();
    await page.getByPlaceholder(/Go to ward/).fill("12");
    await page.getByPlaceholder(/Go to ward/).press("Enter");
    await expect(page).toHaveURL(/\/kmc\/wards$/);
  });
});
