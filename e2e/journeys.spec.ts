import { expect, test, type Page } from "@playwright/test";

const KEEPSAKES = "embe-keepsakes-v1";

/** Records everything that signals a broken page: console errors/warnings (incl. CSP violations), uncaught errors, failed requests. */
function watch(page: Page) {
  const problems: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") problems.push(`console.${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) => problems.push(`requestfailed: ${r.url()} (${r.failure()?.errorText})`));
  return problems;
}
async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(60);
  }
}

test.describe("health of the page", () => {
  test("loads, hydrates and scrolls with no console errors, CSP violations or failed requests", async ({ page }) => {
    const problems = watch(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("To my favorite");
    await scrollThrough(page);
    await page.waitForLoadState("networkidle");
    expect(problems).toEqual([]);
  });

  test("never scrolls sideways", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await scrollThrough(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  });

  test("sends the security headers", async ({ request }) => {
    const headers = (await request.get("/")).headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-powered-by"]).toBeUndefined();
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the story is still readable: hero, timeline, memory list", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("opacity", "1");
    const firstChapter = page.locator(".timeline-item").first();
    await expect(firstChapter).toBeVisible();
    await expect(firstChapter).toHaveCSS("opacity", "1");
    await expect(page.locator(".explorer-item")).toHaveCount(4);
  });
});

test.describe("soundtrack", () => {
  test("is not downloaded until Play is pressed", async ({ page }) => {
    const mp3: string[] = [];
    page.on("request", (r) => r.url().includes(".mp3") && mp3.push(r.url()));
    await page.goto("/", { waitUntil: "networkidle" });
    await scrollThrough(page);
    await page.waitForTimeout(500);
    expect(mp3).toEqual([]);
    const requested = page.waitForRequest(/birthday-song\.mp3/);
    await page.getByRole("button", { name: "Phát nhạc" }).scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Phát nhạc" }).click();
    await requested;
  });

  test("explains a missing file instead of failing silently", async ({ page }) => {
    await page.route("**/birthday-song.mp3", (route) => route.fulfill({ status: 404, body: "" }));
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Phát nhạc" }).scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Phát nhạc" }).click();
    await expect(page.locator(".music-error")).toContainText("chưa sẵn sàng");
  });
});

test.describe("find a memory", () => {
  test("finds Vietnamese typed without diacritics or in decomposed form", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const search = page.getByRole("searchbox");
    await search.scrollIntoViewIfNeeded();
    for (const query of ["hen ho", "hẹn hò".normalize("NFD")]) {
      await search.fill(query);
      await expect(page.locator(".explorer-item")).toHaveCount(1);
      await expect(page.locator(".explorer-item")).toContainText("Buổi hẹn đầu tiên");
    }
    await search.fill("");
    await expect(page.locator(".explorer-item")).toHaveCount(4);
  });

  test("filters by category, which only lists categories that have memories", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const select = page.getByRole("combobox", { name: "Lọc theo nhóm" });
    await expect(select.locator("option")).toHaveText(["Tất cả", "Những buổi hẹn", "Ngày thường"]);
    await select.selectOption("dates");
    await expect(page.locator(".explorer-item")).toHaveCount(1);
  });
});

test.describe("photo lightbox", () => {
  test("is keyboard friendly: focus stays inside, Escape closes, focus returns, scrolling is restored", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const thumb = page.getByRole("button", { name: /^Mở ảnh:/ }).first();
    await thumb.scrollIntoViewIfNeeded();
    await thumb.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Xem ảnh kỷ niệm" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Đóng" })).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(thumb).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  });

  test("arrow keys move between photos", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const thumb = page.getByRole("button", { name: /^Mở ảnh:/ }).first();
    await thumb.scrollIntoViewIfNeeded();
    await thumb.click();
    const caption = page.getByRole("dialog").locator("figcaption");
    const first = await caption.textContent();
    await page.keyboard.press("ArrowRight");
    await expect(caption).not.toHaveText(first ?? "");
    await page.keyboard.press("ArrowLeft");
    await expect(caption).toHaveText(first ?? "");
  });

  test("a broken photo shows a placeholder and keeps its box", async ({ page }) => {
    await page.route(/_next\/image.*photo-3/, (route) => route.fulfill({ status: 404, body: "" }));
    await page.goto("/", { waitUntil: "networkidle" });
    const card = page.locator(".photo-card-3");
    await card.scrollIntoViewIfNeeded();
    const fallback = card.locator(".image-fallback");
    await expect(fallback).toBeVisible();
    expect((await card.boundingBox())?.height ?? 0).toBeGreaterThan(150);
  });
});

test.describe("keepsakes", () => {
  test("a note survives a reload, and can be backed up", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const box = page.getByLabel("Điều muốn lưu giữ");
    await box.scrollIntoViewIfNeeded();
    await box.fill("một điều nhỏ");
    await page.getByRole("button", { name: /Cất vào hộp/ }).click();
    await expect(page.locator(".keepsake-note")).toContainText("một điều nhỏ");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator(".keepsake-note")).toContainText("một điều nhỏ");

    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: /Sao lưu thành tệp/ }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/^embe-keepsakes-\d{4}-\d{2}-\d{2}\.json$/);
  });

  test("notes saved by the previous version of the site are still there", async ({ page }) => {
    await page.addInitScript((key) => {
      if (!window.localStorage.getItem(key)) {
        window.localStorage.setItem(key, JSON.stringify([{ id: "legacy-1", text: "ghi chú từ bản cũ", date: "2025-12-24T10:00:00.000Z" }]));
      }
    }, KEEPSAKES);
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".keepsake-note")).toContainText("ghi chú từ bản cũ");
  });

  test("corrupt data in storage never takes the page down", async ({ page }) => {
    const problems = watch(page);
    await page.addInitScript((key) => window.localStorage.setItem(key, '{"hello":"world"}'), KEEPSAKES);
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Chiếc hộp vẫn đang chờ điều đầu tiên.")).toBeAttached();
    expect(problems.filter((p) => p.startsWith("pageerror"))).toEqual([]);
  });
});

test.describe("quiet mode", () => {
  test("calms the page, and remembers the choice after a reload", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Chế độ dịu nhẹ/ }).click();
    await expect(page.locator("html")).toHaveClass(/quiet-mode/);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveClass(/quiet-mode/);
    await expect(page.getByRole("button", { name: /Chế độ bình thường/ })).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("routes", () => {
  test("an unknown page shows the friendly 404 with a way home", async ({ page }) => {
    const response = await page.goto("/no-such-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Trang này đi lạc mất rồi." })).toBeVisible();
    await page.getByRole("link", { name: /Về trang chính/ }).click();
    await expect(page).toHaveURL("/");
  });
});
