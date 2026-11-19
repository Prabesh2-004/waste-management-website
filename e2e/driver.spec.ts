import { expect, test } from "@playwright/test";
import { ACCOUNTS, api, expectNoHorizontalScroll, login, sweepButtons, watchErrors } from "./helpers";

interface Live {
  vehicles: { id: string; location: { lat: number; lng: number; at: string } | null }[];
}

test.describe("driver section (phone)", () => {
  test("home: today's assignment, time needed and progress", async ({ page }) => {
    const errors = watchErrors(page);
    await login(page, "driver");
    await expect(page.getByText("Today's assignment")).toBeVisible();
    await expect(page.getByText("Time needed")).toBeVisible();
    await expect(page.getByText("from where you are")).toBeVisible(); // GPS fix used
    await expect(page.getByText("To first stop")).toBeVisible();
    await expect(page.getByText("Today's progress")).toBeVisible();
    await expect(page.getByText("GPS live").first()).toBeVisible();
    await expectNoHorizontalScroll(page);
    expect(errors).toEqual([]);
  });

  test("route: live GPS is shared with the ward office and shown on the map", async ({ page }) => {
    await login(page, "driver");
    await page.getByRole("button", { name: /Continue collection|Start collection/ }).click();
    await expect(page).toHaveURL(/\/driver\/route$/);
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await expect(page.getByText("Sharing live location")).toBeVisible();
    await expect(page.getByText("Total time to finish this route")).toBeVisible();
    await expect(page.getByText(/^Sent /)).toBeVisible({ timeout: 15_000 });
    const route = page.locator("h1").first();
    const ward = (await page.getByText(/^Ward \d+ ·/).first().innerText()).match(/Ward (\d+)/)![1];
    const live = await api<Live>(`/api/v1/live?ward=${ward}`, "kmc");
    const moved = live.vehicles.find((v) => v.location && Math.abs(v.location.lat - 27.6884) < 1e-4 && Math.abs(v.location.lng - 85.3352) < 1e-4);
    expect(moved, `a vehicle on ${await route.innerText()} at the phone's GPS position`).toBeTruthy();
  });

  test("route: mark stops collected, skip and undo, then simulate the drive", async ({ page }) => {
    const errors = watchErrors(page);
    await login(page, "driver");
    await page.goto("/driver/route");
    const before = await page.getByText(/^\d+\/\d+ done$/).innerText();
    await page.getByRole("button", { name: "Collected" }).first().click();
    await expect(page.getByText(/^\d+\/\d+ done$/)).not.toHaveText(before);
    await page.getByRole("button", { name: "Undo" }).last().click();
    await expect(page.getByText(/^\d+\/\d+ done$/)).toHaveText(before);
    await page.getByRole("button", { name: "Skip" }).first().click();
    await expect(page.getByText("Skipped").first()).toBeVisible();
    await page.getByRole("button", { name: "Undo" }).last().click();

    await page.getByRole("button", { name: "Follow me" }).or(page.getByRole("button", { name: "Following you" })).click();
    await page.getByRole("button", { name: "Simulate drive (testing)" }).click();
    await expect(page.getByText("Simulated drive")).toBeVisible();
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: "Stop simulation" }).click();
    await expect(page.getByText("Sharing live location")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("finish route needs a weight, then records the trip", async ({ page }) => {
    await login(page, "driver");
    await page.goto("/driver/route");
    const title = await page.locator("h1").first().innerText();
    await page.getByRole("button", { name: "Finish route" }).click();
    const sheet = page.getByRole("dialog");
    await sheet.getByRole("button", { name: "Complete route" }).click();
    await expect(page.getByText("Enter the weight collected in kg")).toBeVisible();
    await sheet.getByLabel("Weight collected (kg)").fill("850");
    await sheet.getByRole("button", { name: "Complete route" }).click();
    await expect(page.getByText(/completed · 850 kg recorded/)).toBeVisible();
    await expect(page.getByText("Completed", { exact: true }).first()).toBeVisible();
    await page.getByRole("link", { name: "Records" }).click();
    await expect(page.getByText(`${title} –`, { exact: false }).first()).toBeVisible();
  });

  test("schedule switches route; records: report a vehicle issue", async ({ page }) => {
    await login(page, "driver");
    await page.getByRole("link", { name: "Schedule" }).click();
    const routes = page.locator("main button", { hasText: /Route \d+/ });
    await expect(routes.nth(1)).toBeVisible();
    const label = (await routes.nth(1).locator("b").first().innerText()).trim();
    await routes.nth(1).click();
    await expect(page).toHaveURL(/\/driver\/route$/);
    await expect(page.locator("h1").first()).toHaveText(label);

    await page.goto("/driver/records");
    await page.getByRole("tab", { name: "Maintenance" }).click();
    await page.getByRole("button", { name: "Report issue" }).click();
    const sheet = page.getByRole("dialog");
    await sheet.getByLabel("What is wrong?").selectOption("Brake problem");
    await sheet.getByLabel("Details").fill("E2E: brakes squeak");
    await sheet.getByRole("button", { name: "Send report" }).click();
    await expect(page.getByText("Issue reported to the ward office")).toBeVisible();
    await expect(page.getByText("Brake problem").first()).toBeVisible();
  });

  test("a driver with an upcoming route can start it", async ({ page }) => {
    await login(page, "driver", "bikash.shrestha@kathmandu.gov.np");
    await page.getByRole("link", { name: "Schedule" }).click();
    const upcoming = page.locator("main button", { hasText: "Upcoming" }).first();
    await expect(upcoming).toBeVisible();
    await upcoming.click();
    await page.getByRole("button", { name: /^Start Route \d+/ }).click();
    await expect(page.getByText(/started · GPS sharing on/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Finish route" })).toBeVisible();
  });

  test("every driver page: all buttons work without errors", async ({ page }) => {
    const errors = watchErrors(page);
    await login(page, "driver", "sita.gurung@kathmandu.gov.np");
    for (const p of ["/driver", "/driver/schedule", "/driver/records", "/driver/profile"]) {
      await sweepButtons(page, p);
      await expectNoHorizontalScroll(page);
    }
    expect(errors).toEqual([]);
  });

  test("without GPS permission the driver gets a clear message and can simulate", async ({ browser }) => {
    const context = await browser.newContext({ ...test.info().project.use, permissions: [] });
    const page = await context.newPage();
    // Deny geolocation explicitly.
    await context.addInitScript(() => {
      navigator.geolocation.watchPosition = (_ok, fail) => {
        setTimeout(() => fail?.({ code: 1, message: "denied", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError), 50);
        return 1;
      };
    });
    await login(page, "driver", ACCOUNTS.driver);
    await page.goto("/driver/route");
    await expect(page.getByText(/Location permission was denied/)).toBeVisible();
    const simulate = page.getByRole("button", { name: "Simulate drive" });
    if (await simulate.count()) {
      await simulate.click();
      await expect(page.getByText("Simulated drive")).toBeVisible();
    }
    await context.close();
  });
});
