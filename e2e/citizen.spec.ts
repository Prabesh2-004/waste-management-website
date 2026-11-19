import path from "node:path";
import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll, login, sweepButtons, watchErrors } from "./helpers";

test.describe("citizen section (phone)", () => {
  test.beforeEach(async ({ page }) => login(page, "citizen"));

  test("home shows next collection, quick actions and navigation", async ({ page }) => {
    const errors = watchErrors(page);
    await expect(page.getByText("Next collection")).toBeVisible();
    await expect(page.getByRole("link", { name: /Track collection/ })).toBeVisible();
    for (const [link, url, heading] of [
      ["Collection", /\/citizen\/collection$/, "Collection"],
      ["Waste Help", /\/citizen\/identify$/, "Waste Help"],
      ["Community", /\/citizen\/community$/, "Community"],
      ["Reports", /\/citizen\/reports$/, "Reports"],
      ["Home", /\/citizen$/, null],
    ] as const) {
      await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: link }).click();
      await expect(page).toHaveURL(url);
      if (heading) await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      await expectNoHorizontalScroll(page);
    }
    expect(errors).toEqual([]);
  });

  test("every citizen page: all buttons work without errors", async ({ page }) => {
    const errors = watchErrors(page);
    for (const p of ["/citizen", "/citizen/collection", "/citizen/community", "/citizen/reports", "/citizen/profile"]) {
      await sweepButtons(page, p);
      await expectNoHorizontalScroll(page);
    }
    expect(errors).toEqual([]);
  });

  test("collection: live truck map, ETA to stops and nearest stop from GPS", async ({ page }) => {
    await page.goto("/citizen/collection");
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await expect(page.locator(".leaflet-marker-icon").first()).toBeVisible();
    await expect(page.getByText("New Baneshwor Chowk").first()).toBeVisible();
    await page.getByRole("button", { name: "Route 4" }).click();
    await expect(page.getByText("Gaushala Chowk").first()).toBeVisible();
    await page.getByRole("button", { name: "Use my location" }).click();
    await expect(page.getByText(/Nearest stop: New Baneshwor Chowk/)).toBeVisible();
  });

  test("collection reminder turns SMS alerts on and off", async ({ page }) => {
    await page.goto("/citizen/collection");
    const toggle = page.getByRole("switch", { name: "Collection reminder" });
    const initial = await toggle.getAttribute("aria-checked");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", initial === "true" ? "false" : "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", initial ?? "false");
  });

  test("identify: live scan shows a verdict on the camera view", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/citizen/identify");
    await expect(page.getByText("LIVE", { exact: true })).toBeVisible({ timeout: 15_000 });
    // The fake camera shows a banana peel.
    await expect(page.locator("[aria-live=polite]").getByText("Biodegradable")).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Save result" }).click();
    await expect(page.getByText(/^Saved: Biodegradable/)).toBeVisible();
    await page.getByRole("button", { name: "Pause live scan" }).click();
    await expect(page.getByText("PAUSED")).toBeVisible();
    await page.getByRole("button", { name: "Resume live scan" }).click();
    await page.getByRole("tab", { name: "Photo" }).click();
    await page.getByRole("button", { name: "Take photo" }).click();
    await expect(page.getByRole("button", { name: "Retake" })).toBeVisible({ timeout: 20_000 });
    await page.getByRole("tab", { name: "Upload" }).click();
    await page.locator("input[type=file]:not([capture])").setInputFiles(path.join(__dirname, "fixtures/plastic-bottle.jpg"));
    await expect(page.getByText(/confident/).first()).toBeVisible({ timeout: 20_000 });
    expect(errors).toEqual([]);
  });

  test("ask: suggested and typed questions get answers", async ({ page }) => {
    await page.goto("/citizen/identify?tab=ask");
    await page.getByRole("button", { name: /Where should I dispose of batteries/ }).click();
    await expect(page.getByText(/Batteries and e-waste must not go in regular bins/)).toBeVisible();
    await page.getByLabel("Your question").fill("When is my next collection?");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText(/Ward 17's next collection is/)).toBeVisible();
    await page.getByRole("button", { name: "Helpful" }).first().click();
  });

  test("community: register for a program and cancel", async ({ page }) => {
    await page.goto("/citizen/community");
    await page.getByRole("button", { name: /View program details|You're registered/ }).click();
    const sheet = page.getByRole("dialog");
    const register = sheet.getByRole("button", { name: "Register now" });
    if (await register.count()) {
      await register.click();
      await expect(sheet.getByRole("button", { name: "Cancel my registration" })).toBeVisible();
    }
    await sheet.getByRole("button", { name: "Cancel my registration" }).click();
    await expect(sheet.getByRole("button", { name: "Register now" })).toBeVisible();
    await sheet.getByRole("button", { name: "Close" }).click();
    await page.getByRole("tab", { name: "News & Progress" }).click();
    await expect(page.getByText("Latest updates")).toBeVisible();
  });

  test("report wizard with photo, reference number and timeline", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/citizen/reports");
    await page.getByRole("button", { name: "Report an issue" }).last().click();
    await expect(page.locator("main").getByRole("button", { name: "Next", exact: true })).toBeDisabled();
    await page.getByRole("radio", { name: /Missed waste collection/ }).click();
    await page.locator("main").getByRole("button", { name: "Next", exact: true }).click();
    await page.getByLabel("Route").selectOption({ label: "Route 3 – Baneshwor" });
    await page.getByRole("button", { name: "Use my location" }).click();
    await expect(page.getByLabel("Specific location")).toHaveValue(/Near New Baneshwor Chowk/);
    await page.locator("main").getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByText("Describe what happened")).toBeVisible(); // description is required
    await page.getByLabel("Describe the issue *").fill("E2E: truck did not come this morning.");
    await page.locator("input[type=file]").setInputFiles(path.join(__dirname, "fixtures/banana-peel.jpg"));
    await expect(page.getByAltText("Your photo")).toBeVisible();
    await page.locator("main").getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByText("E2E: truck did not come this morning.")).toBeVisible();
    await page.getByRole("button", { name: "Submit report" }).click();
    await expect(page.getByText("Report submitted!")).toBeVisible();
    const ref = await page.locator("b", { hasText: /^WR-\d{5}$/ }).innerText();
    await page.getByRole("button", { name: "View my report" }).click();
    await expect(page.getByText(ref)).toBeVisible();
    await expect(page.getByText("Status history")).toBeVisible();
    await expect(page.getByAltText("Photo evidence")).toBeVisible();
    expect(await page.getByAltText("Photo evidence").evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    await page.getByRole("button", { name: "My reports" }).click(); // back link in the report view
    await page.getByRole("button", { name: "Open", exact: true }).click(); // filter chip
    await expect(page.getByRole("tab", { name: "My reports" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText(ref).first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("profile: change ward, then change it back", async ({ page }) => {
    await page.goto("/citizen/profile");
    await page.getByLabel("My ward").selectOption("Ward 5");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Ward 5, Kathmandu")).toBeVisible();
    await page.getByLabel("My ward").selectOption("Ward 17");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Ward 17, Kathmandu")).toBeVisible();
  });

  test("log out returns to the login page", async ({ page }) => {
    await page.goto("/citizen/profile");
    await page.getByRole("button", { name: "Log out" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto("/citizen");
    await expect(page).toHaveURL(/role=citizen/);
  });
});
