import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll, login, watchErrors } from "./helpers";
import type { Role } from "./helpers";

test.describe("shared login page", () => {
  test("shows the four sections and fills the demo account for each", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/");
    for (const [label, email] of [
      ["Citizen", "asha.gurung@example.com"],
      ["Driver", "ram.thapa@kathmandu.gov.np"],
      ["Ward staff", "ward17@kathmandu.gov.np"],
      ["KMC staff", "anita.shrestha@kathmandu.gov.np"],
    ]) {
      await page.getByRole("radio", { name: label }).click();
      await expect(page.getByRole("radio", { name: label })).toHaveAttribute("aria-checked", "true");
      await expect(page.getByLabel("Email")).toHaveValue(email);
      await expect(page.getByRole("button", { name: `Sign in as ${label}` })).toBeVisible();
    }
    await expectNoHorizontalScroll(page);
    expect(errors).toEqual([]);
  });

  for (const role of ["citizen", "driver", "ward", "kmc"] as Role[]) {
    test(`signs in as ${role} and lands in that section`, async ({ page }) => {
      const errors = watchErrors(page);
      await login(page, role);
      await expectNoHorizontalScroll(page);
      expect(errors).toEqual([]);
    });
  }

  test("show/hide password and the Enter key submit", async ({ page }) => {
    await page.goto("/?role=ward");
    const password = page.getByLabel("Password", { exact: true });
    await expect(password).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(password).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Hide password" }).click();
    await password.press("Enter");
    await expect(page).toHaveURL(/\/ward\/dashboard$/);
  });

  test("explains a wrong password and a wrong section", async ({ page }) => {
    await page.goto("/?role=kmc");
    await page.getByLabel("Password", { exact: true }).fill("wrong-password");
    await page.getByRole("button", { name: "Sign in as KMC staff" }).click();
    await expect(page.locator("form [role=alert]")).toHaveText("Incorrect email or password");

    await page.getByRole("radio", { name: "Driver" }).click();
    await page.getByLabel("Email").fill("asha.gurung@example.com");
    await page.getByRole("button", { name: "Sign in as Driver" }).click();
    await expect(page.locator("form [role=alert]")).toContainText("citizen section");
  });

  test("a citizen can create an account with ward and phone", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Create an account" }).click();
    await page.getByLabel("Full name").fill("Test Resident");
    await page.getByLabel("Your ward").selectOption("Ward 5");
    await page.getByLabel(/Mobile number/).fill("9811111111");
    await page.getByLabel("Email").fill(`resident-${Date.now()}@example.com`);
    await page.getByLabel("Password", { exact: true }).fill("secret12");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/citizen$/);
    await expect(page.getByText("Ward 5, Kathmandu")).toBeVisible();
  });

  test("sections send signed-out visitors to the login page, and the session survives a reload", async ({ page }) => {
    await page.goto("/driver/route");
    await expect(page).toHaveURL(/\/\?role=driver$/);
    await expect(page.getByRole("radio", { name: "Driver" })).toHaveAttribute("aria-checked", "true");
    await login(page, "driver");
    await page.reload();
    await expect(page).toHaveURL(/\/driver$/);
    await expect(page.getByText("Today's assignment")).toBeVisible();
  });
});
