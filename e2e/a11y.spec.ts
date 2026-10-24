import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function settle(page: Page) {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1600); // entrance animations finish, so contrast is measured on final colours
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(600);
}

/** Readable failure output: rule, impact and the first offending elements. */
function summarize(violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"]) {
  return violations.map((v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
}

test("the page has no WCAG 2.2 A/AA violations", async ({ page }) => {
  await settle(page);
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(summarize(violations)).toEqual([]);
});

test("the open photo lightbox has no WCAG 2.2 A/AA violations", async ({ page }) => {
  await settle(page);
  const thumb = page.getByRole("button", { name: /^Mở ảnh:/ }).first();
  await thumb.scrollIntoViewIfNeeded();
  await thumb.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.waitForTimeout(500);
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(summarize(violations)).toEqual([]);
});

test("quiet mode still passes", async ({ page }) => {
  await settle(page);
  await page.getByRole("button", { name: /Chế độ dịu nhẹ/ }).click();
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(summarize(violations)).toEqual([]);
});
