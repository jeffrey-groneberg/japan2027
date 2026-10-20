import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

const storageKey = "japan-vietnam-2027:planner:v1";
const tabs = {
  home: "Home",
  itinerary: "Reiseplan",
  travel: "Flüge & Anfahrt",
  stays: "Unterkünfte",
  bases: "Basen & Einkaufen",
  dining: "Kulinarik",
  festivals: "Feste & Feuerwerk",
  checklist: /Checkliste/,
};

// Never use community map tile servers for automated test traffic.
test.beforeEach(async ({ page }) => {
  await page.route("https://tile.openstreetmap.org/**", (route) => route.fulfill({
    status: 200,
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><path d="M0 0H256V256H0Z" fill="#f5f5f5"/><path d="M0 128H256M128 0V256" stroke="#dedede"/></svg>',
  }));
});

async function ready(page, url = "/?clawpilotTheme=light#view=itinerary") {
  await page.goto(url);
  await expect(page.locator("#startup-notice")).toBeHidden();
  await expect(page.locator(".day-option")).toHaveCount(30);
}

async function show(page, view) {
  const menu = page.locator("#mobile-menu-toggle");
  if (await menu.isVisible() && await menu.getAttribute("aria-expanded") === "false") await menu.click();
  const tab = page.locator(`#tab-${view}`);
  if (await tab.isVisible()) await tab.click();
  else {
    await page.locator("#nav-more").click();
    await page.locator(`#nav-overflow [data-view="${view}"]`).click();
  }
  await expect(page.locator(`#panel-${view}`)).toBeVisible();
}

async function daySection(page, name) {
  await page.getByRole("tablist", { name: "Bereiche des ausgewählten Reisetags" }).getByRole("tab", { name }).click();
}

async function openDayMap(page) {
  await page.getByRole("button", { name: "Tageskarte öffnen" }).click();
  await expect(page.locator(".day-map-dialog")).toBeVisible();
}

async function openPoint(page, id) {
  await page.locator(`.lane-block-activity[data-place-id="${id}"]`).first().click();
  await expect(page.locator("#lane-detail")).toBeVisible();
  return page.locator("#lane-detail");
}

test("Home owns the banner while task panels open directly below navigation", async ({ page }) => {
  for (const width of [430, 1440]) {
    await page.setViewportSize({ width, height: 932 });
    await ready(page, "/?clawpilotTheme=light");
    await expect(page.locator("#tab-home")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".hero")).toBeVisible();
    await expect(page.locator(".route-area")).toBeVisible();
    await expect(page.locator("#panel-itinerary")).toBeHidden();
    await page.getByRole("link", { name: "Reise entdecken" }).click();
    await expect(page.locator("#panel-itinerary")).toBeVisible();
    await expect(page.locator(".hero")).toBeHidden();
    await expect(page.locator(".route-area")).toBeHidden();
    expect(await page.locator("#panel-itinerary").evaluate((panel) => panel.getBoundingClientRect().top)).toBeLessThan(260);
    await show(page, "stays");
    await expect(page.locator(".hero")).toBeHidden();
    await page.getByRole("link", { name: "Japan und Vietnam 2027, Startseite" }).click();
    await expect(page.locator("#panel-home")).toBeVisible();
    await page.locator('.route-stop[data-destination="kyoto"]').click();
    await expect(page.locator("#panel-home")).toBeHidden();
    await expect(page.locator(".day-option")).toHaveCount(4);
    await expect(page.locator("#panel-itinerary")).toBeVisible();
  }
});

test("mobile menu expands the full sitemap and closes on selection or Escape", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 430, height: 760 });
  await ready(page, "/?clawpilotTheme=light");
  const menu = page.locator("#mobile-menu-toggle");
  const rail = page.locator(".planner-tabs");
  await expect(rail).toBeHidden();
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(rail.getByRole("tab")).toHaveCount(8);
  await expect(rail).toHaveCSS("display", "grid");
  await page.getByRole("tab", { name: "Unterkünfte", exact: true }).click();
  await expect(page.locator("#panel-stays")).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(rail).toBeHidden();
  await expect(menu).toBeFocused();
  await menu.click();
  await page.keyboard.press("Escape");
  await expect(rail).toBeHidden();
  await expect(menu).toBeFocused();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await menu.click();
  await expect(rail).toHaveCSS("animation-name", "none");
});

test("navigation moves only overflowing destinations into More and restores them on resize", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await ready(page, "/?clawpilotTheme=light#view=home");
  await page.evaluate(() => document.fonts.ready);
  const more = page.locator("#nav-more");
  for (const width of [700, 900, 1100, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.locator(".planner-tabs").evaluate((rail) => rail.scrollWidth - rail.clientWidth)).toBeLessThanOrEqual(1);
    if (await more.isVisible()) {
      await more.click();
      const visible = await page.locator('.planner-tabs [role="tab"]:visible').count();
      expect(await page.locator("#nav-overflow button").count()).toBe(8 - visible);
      await page.keyboard.press("Escape");
      await expect(page.locator("#nav-overflow")).toBeHidden();
      await expect(more).toBeFocused();
    }
  }
  await page.setViewportSize({ width: 900, height: 900 });
  await expect(more).toBeVisible();
  await more.click();
  await page.locator('#nav-overflow [data-view="checklist"]').click();
  await expect(page.locator("#panel-checklist")).toBeVisible();
  await expect(page.locator("#nav-overflow")).toBeHidden();
  await expect(more).toBeFocused();
  await expect(more).toHaveClass(/nav-more-selected/);
  await page.setViewportSize({ width: 1600, height: 1000 });
  await expect(more).toBeHidden();
  await expect(page.locator('.planner-tabs [role="tab"]:visible')).toHaveCount(8);
  await expect(page.locator("#tab-checklist")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#tab-checklist")).toBeFocused();
  await page.setViewportSize({ width: 430, height: 844 });
  await expect(more).toBeHidden();
  await page.locator("#mobile-menu-toggle").click();
  await expect(page.locator('.planner-tabs [role="tab"]:visible')).toHaveCount(8);
  await expect(page.locator('.planner-tabs [role="tab"][tabindex="0"]')).toHaveCount(1);
});

test("all destinations, date navigation, practical transport and search work", async ({ page }) => {
  await ready(page);
  await expect(page.locator("#day-title")).toHaveText("Abflug");
  await expect(page.getByRole("button", { name: "Vorheriger Tag" })).toBeDisabled();
  await page.getByRole("button", { name: "Nächster Tag" }).click();
  await expect(page.locator("#day-title")).toHaveText("Ankunft Haneda");
  await expect(page.locator(".transport-box")).toContainText("Keikyu");
  await expect(page.locator(".transport-box")).toContainText("Welches Ticket, wo kaufen?");
  for (const [id, count] of [["tokyo", 7], ["kyoto", 4], ["osaka", 5], ["vietnam", 12]]) {
    await page.locator(`.filter-button[data-destination="${id}"]`).click();
    await expect(page.locator(".day-option")).toHaveCount(count);
    await expect(page.locator(`.filter-button[data-destination="${id}"]`)).toHaveAttribute("aria-pressed", "true");
  }
  await page.getByRole("button", { name: "Alle Tage", exact: true }).click();
  await page.getByRole("searchbox", { name: "Tagesplan durchsuchen" }).fill("Nintendo Museum");
  await expect(page.locator(".day-option")).toHaveCount(1);
  await expect(page.locator("#day-title")).toHaveText("Fushimi Inari & Nintendo Museum");
  await expect(page.locator(".day-date")).toContainText("12. Juli");
  await page.getByRole("searchbox").fill("zz-not-a-place");
  await expect(page.getByRole("heading", { name: "Keine Reisetage gefunden" })).toBeVisible();
  await page.getByRole("button", { name: "Filter zurücksetzen" }).click();
  await expect(page.locator(".day-option")).toHaveCount(30);
});

test("favorites and booking progress persist without a backend", async ({ page }) => {
  await ready(page);
  await page.getByRole("button", { name: "Tag merken: Abflug", exact: true }).click();
  await page.getByRole("button", { name: /Gemerkte/ }).click();
  await expect(page.locator(".day-option")).toHaveCount(1);
  await show(page, "checklist");
  await page.getByRole("checkbox", { name: "Flüge buchen", exact: true }).check();
  await page.getByRole("checkbox", { name: "Ferienwohnungen sichern", exact: true }).check();
  await expect(page.locator("#checklist-progress-text")).toHaveText("2 von 8 erledigt");
  await page.reload();
  await expect(page.locator("#startup-notice")).toBeHidden();
  await expect(page.locator("#checklist-progress")).toHaveAttribute("value", "2");
  await expect(page.locator("#saved-count")).toHaveText("1");
  await show(page, "itinerary");
  await page.getByRole("button", { name: /Gemerkte/ }).click();
  await expect(page.locator(".day-option")).toHaveCount(1);
  await page.getByRole("button", { name: "Tag aus Merkliste entfernen: Abflug", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Keine gemerkten Tage" })).toBeVisible();
});

test("accommodation selections persist and actual bedroom problems are explained", async ({ page }) => {
  await ready(page);
  await show(page, "stays");
  await page.locator("#stay-tokyo-2").check();
  await page.locator("#stay-kyoto-2").check();
  await page.locator("#stay-osaka-1").check();
  await expect(page.locator("#panel-stays")).toContainText("nur ein Schlafzimmer");
  await expect(page.locator("#panel-stays")).toContainText("ausgebucht");
  await expect(page.locator("#panel-stays")).toContainText("widersprüchlich");
  await expect(page.locator("#panel-stays")).toContainText("Zwei Doppelbetten sind nicht zwei getrennte Schlafzimmer");
  await page.reload();
  await show(page, "stays");
  await expect(page.locator("#stay-osaka-1")).toBeChecked();
});

test("calendar downloads all dates, detail and culinary tips without removed metadata", async ({ page }) => {
  await ready(page);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "In den Kalender" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("japan-vietnam-2027.ics");
  const calendar = await readFile(await download.path(), "utf8");
  expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(30);
  const events = calendar.replaceAll("\r\n ", "").split("BEGIN:VEVENT");
  expect(events.find((event) => event.includes("DTSTART;VALUE=DATE:20270705"))).toContain("SUMMARY:Shibuya & Harajuku");
  expect(events.find((event) => event.includes("DTSTART;VALUE=DATE:20270707"))).toContain("SUMMARY:Ueno Zoo & Asakusa");
  expect(calendar.replaceAll("\r\n ", "")).toContain("Kulinarik: AFURI");
  expect(calendar).not.toMatch(/Vorlage|Budget|Planungsstand/);
});

test("deep links, keyboard tabs, theme persistence and external links are correct", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-16");
  await expect(page.locator("#day-title")).toHaveText("USJ & Super Nintendo World");
  await page.getByRole("tab", { name: "Reiseplan", exact: true }).focus();
  await page.keyboard.press("End");
  await expect(page.locator("#tab-checklist").or(page.locator("#nav-more")).filter({ visible: true })).toBeFocused();
  await expect(page.locator("#panel-checklist")).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("#panel-festivals")).toBeVisible();
  await page.getByRole("button", { name: "Dunkle Ansicht aktivieren" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const unsafeLinks = await page.locator('a[target="_blank"]').evaluateAll((links) => links.filter((link) => !link.rel.includes("noopener") || new URL(link.href).protocol !== "https:").length);
  expect(unsafeLinks).toBe(0);
});

test("storage corruption and storage denial have explicit recovery messages", async ({ page, context }) => {
  await context.addInitScript((key) => localStorage.setItem(key, "{broken"), storageKey);
  await ready(page);
  await expect(page.locator("#storage-notice")).toContainText("konnten nicht gelesen");
  await page.getByRole("button", { name: "Verstanden" }).click();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => { throw new DOMException("Storage unavailable", "QuotaExceededError"); };
  });
  await page.getByRole("button", { name: "Tag merken: Abflug", exact: true }).click();
  await expect(page.locator("#storage-notice")).toContainText("nur für diese Sitzung");
  await expect(page.locator("#saved-count")).toHaveText("1");
});

for (const theme of ["light", "dark"]) {
  test(`all seven panels meet automated WCAG checks in ${theme} mode`, async ({ page }) => {
    await ready(page, `/?clawpilotTheme=${theme}`);
    const violations = [];
    for (const view of Object.keys(tabs)) {
      await show(page, view);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      violations.push(...results.violations.map((finding) => ({
        view, rule: finding.id, nodes: finding.nodes.map((node) => ({ target: node.target, reason: node.failureSummary })),
      })));
      if (view === "itinerary") {
        for (const section of ["Anfahrt & Tickets"]) {
          await daySection(page, section);
          const sectionResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
          violations.push(...sectionResults.violations.map((finding) => ({
            view: `itinerary/${section}`, rule: finding.id, nodes: finding.nodes.map((node) => ({ target: node.target, reason: node.failureSummary })),
          })));
        }
      }
    }
    await show(page, "home");
    await page.locator('.route-stop[data-destination="tokyo"]').click();
    const selectedResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    violations.push(...selectedResults.violations.map((finding) => ({
      view: "selected route", rule: finding.id, nodes: finding.nodes.map((node) => ({ target: node.target, reason: node.failureSummary })),
    })));
    expect(violations, theme).toEqual([]);
  });
}

test("all panels fit phone, tablet and desktop widths without page overflow", async ({ page }) => {
  await ready(page);
  for (const width of [320, 390, 640, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const view of Object.keys(tabs)) {
      await show(page, view);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${view} at ${width}px`).toBe(true);
    }
  }
});

test("all 30 day lanes stay separated and visually cover their timeline on desktop and mobile", async ({ page }) => {
  await ready(page);
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (let index = 0; index < 30; index += 1) {
      if (width === 390 && await page.locator("#panel-itinerary").getAttribute("data-mobile-screen") === "day") {
        await page.getByRole("button", { name: "Alle Reisetage" }).click();
        await expect(page.locator("#panel-itinerary")).toHaveAttribute("data-mobile-screen", "list");
      }
      await page.locator(".day-option").nth(index).click();
      await expect(page.locator(".lane-track").first()).toBeVisible();
      const defects = await page.locator(".lane-track").evaluateAll((tracks) => tracks.flatMap((track, laneIndex) => {
        const trackRect = track.getBoundingClientRect();
        const items = [...track.querySelectorAll(".lane-block, .lane-inline-connector")]
          .map((node) => {
            const rect = node.getBoundingClientRect();
            return { top: rect.top, bottom: rect.bottom, label: node.getAttribute("aria-label") ?? node.getAttribute("title") ?? node.textContent.trim() };
          })
          .sort((a, b) => a.top - b.top);
        const issues = [];
        for (const item of items) {
          if (item.top < trackRect.top - 1 || item.bottom > trackRect.bottom + 1) issues.push(`lane ${laneIndex}: outside track ${item.label}`);
        }
        for (let itemIndex = 1; itemIndex < items.length; itemIndex += 1) {
          const gap = items[itemIndex].top - items[itemIndex - 1].bottom;
          if (gap < 5) issues.push(`lane ${laneIndex}: overlap/dense gap ${gap.toFixed(1)}px`);
          if (gap > 12) issues.push(`lane ${laneIndex}: unexplained visual gap ${gap.toFixed(1)}px`);
        }
        return issues;
      }));
      expect(defects, `day ${index + 1} at ${width}px`).toEqual([]);
      if (width === 390) {
        const mobileVisibility = await page.locator(".lane-board-scroll").evaluate((scroll) => {
          const viewport = scroll.getBoundingClientRect();
          const axis = scroll.querySelector(".lane-time-axis").getBoundingClientRect();
          const tracks = [...scroll.querySelectorAll(".lane-track")];
          return {
            laneCount: tracks.length,
            visibleCount: tracks.filter((track) => {
              const rect = track.getBoundingClientRect();
              return Math.min(rect.right, viewport.right) - Math.max(rect.left, axis.right) > 2;
            }).length,
          };
        });
        expect(mobileVisibility.visibleCount, `mobile day ${index + 1}`).toBe(1);
        await expect(page.locator(".lane-mobile-nav")).toBeVisible();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `day ${index + 1} at ${width}px`).toBe(true);
    }
  }
});

test("delivery previews and browser errors", async ({ page }) => {
  test.setTimeout(90_000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await ready(page, "/?clawpilotTheme=light#view=home");
  await page.evaluate(() => document.fonts.ready);
  const previewDirectory = process.env.PREVIEW_DIR ?? "test-results/previews";
  const capture = async (name) => page.screenshot({ path: `${previewDirectory}/${name}.png`, animations: "disabled" });
  const plannerTop = async () => page.locator("#planner").evaluate((node) => window.scrollTo(0, node.getBoundingClientRect().top + window.scrollY - 8));
  await capture("desktop-home");
  await show(page, "itinerary");
  await plannerTop();
  await capture("desktop-itinerary");
  for (const view of ["travel", "stays", "dining", "festivals", "checklist"]) {
    await show(page, view);
    await plannerTop();
    await capture(`desktop-${view}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await show(page, "itinerary");
  await page.goto("/?clawpilotTheme=light#view=home");
  await expect(page.locator("#startup-notice")).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, 0));
  await capture("mobile-home");
  await show(page, "itinerary");
  await plannerTop();
  await capture("mobile-itinerary-list");
  await page.getByRole("button", { name: "Montag, 5. Juli: Shibuya & Harajuku", exact: true }).click();
  await capture("mobile-itinerary");
  await page.locator(".lane-block-activity").first().click();
  await page.locator("#lane-detail").evaluate((node) => window.scrollTo(0, node.getBoundingClientRect().top + window.scrollY - 84));
  await capture("mobile-lane-detail");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/?clawpilotTheme=light#view=itinerary&day=2027-07-05");
  await expect(page.locator("#startup-notice")).toBeHidden();
  await daySection(page, "Tagesrouten");
  await plannerTop();
  await capture("desktop-shibuya-guide");
  await openDayMap(page);
  await page.getByRole("button", { name: "OpenStreetMap-Karte laden" }).click();
  await expect(page.locator("#day-map .place-marker")).toHaveCount(5);
  await capture("desktop-shibuya-map");
  await page.getByRole("button", { name: "Tageskarte schließen" }).click();
  await show(page, "bases");
  await page.locator('[data-base="kyoto"]').click();
  await plannerTop();
  await capture("desktop-bases");
  await page.setViewportSize({ width: 390, height: 844 });
  await show(page, "itinerary");
  await page.goto("/?clawpilotTheme=light#view=itinerary&day=2027-07-05");
  await expect(page.locator("#startup-notice")).toBeHidden();
  await daySection(page, "Tagesrouten");
  await openDayMap(page);
  await page.locator("#day-detail").evaluate((node) => window.scrollTo(0, node.getBoundingClientRect().top + window.scrollY - 80));
  await capture("mobile-shibuya-guide");
  await page.getByRole("button", { name: "Tageskarte schließen" }).click();
  await page.getByRole("button", { name: "Alle Reisetage" }).click();
  await show(page, "bases");
  await plannerTop();
  await capture("mobile-bases");
  await page.goto("/?clawpilotTheme=dark#view=itinerary&day=2027-07-12");
  await expect(page.locator("#startup-notice")).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await plannerTop();
  await capture("dark-itinerary");
  expect(errors).toEqual([]);
});

test("the Shibuya day explains five individual places including the official Pokemon Center", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-05");
  const primary = page.locator(".lane-track").first();
  await expect(primary.locator(".lane-block-activity[data-place-id]")).toHaveCount(5);
  await primary.locator('[data-place-id="nintendoTokyo"]').click();
  await expect(page.locator("#lane-detail")).toContainText("Lieblingssouvenir");
  await expect(page.locator(".transport-box")).toContainText("Yamanote Line");
  await expect(page.locator(".lane-header")).toHaveCount(3);
  await expect(page.locator(".lane-header").nth(1)).toContainText("Dazu: Akihabara");
  await expect(page.locator(".lane-header").nth(1)).toContainText("Entfällt: Shibuya Scramble Crossing, Shibuya Sky");
  await expect(page.getByRole("tab", { name: /Orte & Karte/ })).toHaveCount(0);
  const expected = new Map([
    ["takeshita", "35.67125,139.70481"],
    ["nintendoTokyo", "35.661972,139.698944"],
    ["pokemon", "35.6619997,139.6984094"],
    ["crossing", "35.6595,139.70056"],
    ["sky", "35.658056,139.701389"],
  ]);
  for (const [id, coordinates] of expected) {
    await primary.locator(`[data-place-id="${id}"]`).click();
    const href = await page.locator("#lane-detail .place-actions a").getAttribute("href");
    expect(new URL(href).searchParams.get("query")).toBe(coordinates);
  }
  await daySection(page, "Anfahrt & Tickets");
  await page.getByRole("button", { name: "Was ist JR? Bahn-ABC & Ticketkauf" }).click();
  await expect(page.locator("#panel-travel")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bahnfahren ohne Vorwissen" })).toBeFocused();
  await expect(page.locator(".rail-guide")).toContainText("JR ist ein Betreiber");
});

test("map privacy, numbered markers, popups and day switching work with local tile fixtures", async ({ page }) => {
  let tileRequests = 0;
  page.on("request", (request) => { if (request.url().startsWith("https://tile.openstreetmap.org/")) tileRequests += 1; });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-05");
  expect(tileRequests).toBe(0);
  await openDayMap(page);
  expect(tileRequests).toBe(0);
  await page.getByRole("button", { name: "OpenStreetMap-Karte laden" }).click();
  await expect(page.locator("#day-map .place-marker")).toHaveCount(5);
  await expect(page.locator("#day-map")).toContainText("OpenStreetMap");
  await page.locator("#day-map").getByRole("button", { name: /A2\. Nintendo TOKYO.*A3\. Pokémon Center SHIBUYA/ }).click();
  await expect(page.locator(".leaflet-popup-content")).toContainText("Nintendo TOKYO");
  await expect(page.locator(".leaflet-popup-content a").first()).toHaveAttribute("href", /35\.661972%2C139\.698944/);
  await page.getByRole("button", { name: "Tageskarte schließen" }).click();
  await page.getByRole("button", { name: "Donnerstag, 8. Juli: Wandertag: Mount Takao", exact: true }).click();
  await expect(page.locator("#day-map .place-marker")).toHaveCount(0);
  await openDayMap(page);
  await expect(page.locator("#day-map .place-marker")).toHaveCount(3);
  await page.getByRole("button", { name: "Tageskarte schließen" }).click();
  await page.getByRole("button", { name: "Samstag, 3. Juli: Abflug", exact: true }).click();
  await expect(page.locator("#day-map")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("map tile failures leave clear guidance and working independent target links", async ({ page }) => {
  await page.route("https://tile.openstreetmap.org/**", (route) => route.abort("failed"));
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-05");
  await openDayMap(page);
  await page.getByRole("button", { name: "OpenStreetMap-Karte laden" }).click();
  await expect(page.locator("#day-places .map-status")).toContainText("konnten nicht geladen");
  await page.getByRole("button", { name: "Tageskarte schließen" }).click();
  await page.locator('.lane-track').first().locator('[data-place-id="takeshita"]').click();
  await expect(page.locator("#lane-detail .place-actions a")).toHaveAttribute("href", /35\.67125%2C139\.70481/);
});

test("every base offers real grocery and shopping points and retains the correct map", async ({ page }) => {
  await ready(page);
  await show(page, "bases");
  for (const [base, grocery] of [["tokyo", "Maruetsu"], ["kyoto", "Fresco"], ["osaka", "Super Tamade"], ["vietnam", "Co.opmart"]]) {
    await page.locator(`[data-base="${base}"]`).click();
    await expect(page.locator("#bases-content .place-list")).toContainText(grocery);
    await expect(page.locator("#bases-content")).toContainText("Google Maps");
  }
  await page.locator('[data-base="vietnam"]').click();
  await page.getByRole("button", { name: "OpenStreetMap-Karte laden" }).click();
  await expect(page.locator("#base-map .place-marker")).toHaveCount(3);
  await expect(page.locator("#bases-content")).toContainText("fußläufige Supermarkt- oder Einkaufsmeile ist nicht bestätigt");
});

test("map and daily details remain accessible on a phone after loading the map", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-05");
  await page.setViewportSize({ width: 390, height: 844 });
  await openDayMap(page);
  await page.getByRole("button", { name: "OpenStreetMap-Karte laden" }).click();
  await expect(page.locator("#day-map .place-marker")).toHaveCount(5);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations.map((finding) => ({ id: finding.id, targets: finding.nodes.map((node) => node.target) }))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator(".day-map-dialog").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${process.env.PREVIEW_DIR ?? "test-results/previews"}/mobile-places-map.png`, animations: "disabled" });
});

test("day planning uses complete parallel lanes and reveals details on demand", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-05");
  await expect(page.locator("#day-panel-plan")).toBeVisible();
  await expect(page.locator("#day-panel-places")).toHaveCount(0);
  await expect(page.locator("#day-panel-transit")).toBeHidden();
  await expect(page.getByRole("tablist", { name: "Bereiche des ausgewählten Reisetags" }).getByRole("tab")).toHaveCount(2);
  await expect(page.getByRole("tab", { name: "Alternativen" })).toHaveCount(0);
  await expect(page.locator(".lane-header")).toHaveCount(3);
  await expect(page.locator(".lane-block-travel").first()).toContainText("Unterkunft in Komagome");
  await expect(page.locator("#lane-detail")).toBeHidden();
  await page.locator(".lane-track").first().locator('[data-place-id="nintendoTokyo"]').click();
  await expect(page.locator("#lane-detail")).toBeVisible();
  await expect(page.locator("#lane-detail")).toContainText("Lieblingssouvenir");
  await expect(page.locator("#lane-detail .place-description")).toBeVisible();
  await expect(page.locator("#lane-detail .resource-links a").first()).toBeVisible();
  await daySection(page, "Tagesrouten");
  await expect(page.getByRole("button", { name: "Nächster Tag" })).toBeVisible();
  await page.getByRole("button", { name: "Nächster Tag" }).click();
  await expect(page.locator("#day-title")).toHaveText("teamLab & Odaiba");
  await expect(page.locator("#day-panel-plan")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?clawpilotTheme=light#view=itinerary&day=2027-07-05");
  await expect(page.locator(".lane-board-scroll")).toHaveCSS("overflow-x", "hidden");
  await expect(page.locator(".lane-board-scroll")).toHaveCSS("touch-action", "pan-y");
  expect(await page.locator(".lane-board-scroll").evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await daySection(page, "Anfahrt & Tickets");
  await expect(page.locator("#day-panel-transit .transit-steps")).toBeVisible();
});

test("mobile shows exactly one lane and changes routes only with buttons", async ({ page }) => {
  const visibleLaneCount = () => page.locator(".lane-board-scroll").evaluate((scroll) => {
    const viewport = scroll.getBoundingClientRect();
    const axis = scroll.querySelector(".lane-time-axis").getBoundingClientRect();
    return [...scroll.querySelectorAll(".lane-track")].filter((track) => {
      const rect = track.getBoundingClientRect();
      return Math.min(rect.right, viewport.right) - Math.max(rect.left, axis.right) > 2;
    }).length;
  });
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await ready(page, `/?clawpilotTheme=light&laneWidth=${width}#view=itinerary&day=2027-07-10`);
    const scroll = page.locator(".lane-board-scroll");
    const status = page.locator(".lane-mobile-status");
    await expect(page.locator(".lane-mobile-nav")).toBeVisible();
    await expect(status).toContainText("Route A · Empfohlene Route");
    await expect(status).toContainText("1 von 4");
    await expect(page.locator(".lane-mobile-route-mark")).toHaveText("A");
    await expect(scroll).toHaveCSS("overflow-x", "hidden");
    await expect(scroll).toHaveCSS("scroll-snap-type", "none");
    await expect(scroll).toHaveCSS("touch-action", "pan-y");
    await expect.poll(visibleLaneCount).toBe(1);
    expect(await scroll.evaluate((node) => {
      const viewport = node.getBoundingClientRect();
      const axis = node.querySelector(".lane-time-axis").getBoundingClientRect();
      const track = node.querySelector(".lane-track").getBoundingClientRect();
      return Math.abs(track.width - (node.clientWidth - (axis.right - viewport.left)));
    })).toBeLessThan(2);

    await page.getByRole("button", { name: "Nächste Route" }).click();
    await expect(status).toContainText("Route B · Mehr Markt, weniger Geschäfte");
    await expect(page.locator(".lane-mobile-route-mark")).toHaveText("B");
    await expect.poll(() => scroll.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
    await expect.poll(visibleLaneCount).toBe(1);

    await page.getByRole("button", { name: "Nächste Route" }).click();
    await expect(status).toContainText("Route C · Mehr Gaming, kein Ginza");
    await expect(page.locator(".lane-mobile-route-mark")).toHaveText("C");
    await expect.poll(visibleLaneCount).toBe(1);

    await page.getByRole("button", { name: "Nächste Route" }).click();
    await expect(status).toContainText("Route D · HIRAKUZA Ginza statt Akihabara");
    await expect(page.locator(".lane-mobile-route-mark")).toHaveText("D");
    await expect(page.getByRole("button", { name: "Nächste Route" })).toBeDisabled();
    await expect.poll(visibleLaneCount).toBe(1);
    await page.getByRole("button", { name: "Vorherige Route" }).click();
    await expect(status).toContainText("Route C · Mehr Gaming, kein Ginza");
  }

  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/?clawpilotTheme=light#view=itinerary&day=2027-07-10");
  await expect(page.locator("#startup-notice")).toBeHidden();
  await expect(page.locator(".lane-mobile-nav")).toBeHidden();
});

test("mobile opens lane items as a third-level detail screen", async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 932 });
  await ready(page, "/?clawpilotTheme=light&itemScreen=1#view=itinerary&day=2027-07-05&screen=day");
  const panel = page.locator("#panel-itinerary");
  const block = page.locator('.lane-track').first().locator('[data-place-id="nintendoTokyo"]');
  const blockKey = await block.getAttribute("data-lane-block");

  await block.click();
  await expect(panel).toHaveAttribute("data-mobile-screen", "item");
  await expect(page.locator("body")).toHaveClass(/mobile-item-view/);
  await expect(page).toHaveURL(new RegExp(`screen=item&item=${encodeURIComponent(blockKey)}`));
  await expect(page.getByRole("button", { name: "Zur Tagesroute" })).toBeVisible();
  await expect(page.locator(".lane-board-shell")).toBeHidden();
  await expect(page.locator("#day-title")).toBeHidden();
  await expect(page.locator("#lane-detail")).toBeVisible();
  await expect(page.locator("#lane-detail")).toBeFocused();
  await expect(page.locator("#lane-detail")).toContainText("Nintendo TOKYO");
  await expect(page.locator("#lane-detail .resource-links a").first()).toBeVisible();

  await page.getByRole("button", { name: "Zur Tagesroute" }).click();
  await expect(panel).toHaveAttribute("data-mobile-screen", "day");
  await expect(page.locator("body")).not.toHaveClass(/mobile-item-view/);
  await expect(page).toHaveURL(/screen=day/);
  await expect(page).not.toHaveURL(/item=/);
  await expect(page.locator(".lane-board-shell")).toBeVisible();
  await expect(page.locator("#lane-detail")).toBeHidden();
  await expect(block).toBeFocused();

  await page.goForward();
  await expect(panel).toHaveAttribute("data-mobile-screen", "item");
  await expect(page.locator("#lane-detail")).toContainText("Nintendo TOKYO");
});

test("mobile navigates from the day list into a dedicated day screen and back", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 430, height: 932 });
  await ready(page, "/?clawpilotTheme=light&mobileScreen=1#view=itinerary");
  const panel = page.locator("#panel-itinerary");
  const selectedDay = page.getByRole("button", { name: "Samstag, 10. Juli: Akihabara & Tsukiji", exact: true });
  await expect(panel).toHaveAttribute("data-mobile-screen", "list");
  await expect(page.locator(".day-selector")).toBeVisible();
  await expect(page.locator("#day-detail")).toBeHidden();
  await expect(page.locator(".itinerary-tools")).toBeVisible();
  await expect(page).not.toHaveURL(/day=/);

  await page.evaluate(() => {
    const focus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function patchedFocus(options) {
      focus.call(this, options);
      if (this.classList.contains("mobile-day-back")) window.scrollTo(0, 120);
    };
  });
  await selectedDay.click();
  await expect(panel).toHaveAttribute("data-mobile-screen", "day");
  await expect(page.locator("body")).toHaveClass(/mobile-day-view/);
  for (const selector of [".masthead", ".hero", ".route-area", ".planner-tabs"]) {
    await expect(page.locator(selector)).toBeHidden();
  }
  await expect(page.locator(".day-selector")).toBeHidden();
  await expect(page.locator("#day-detail")).toBeVisible();
  await expect(page.locator(".itinerary-tools")).toBeHidden();
  await expect(page.getByRole("button", { name: "Alle Reisetage" })).toBeVisible();
  await expect(page.locator("#day-title")).toHaveText("Akihabara & Tsukiji");
  await expect(page.getByRole("button", { name: "Alle Reisetage" })).toBeFocused();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThanOrEqual(2);
  await expect(page).toHaveURL(/view=itinerary&day=2027-07-10&screen=day/);
  await expect(page.locator(".lane-intro, .lane-detail-empty-state")).toHaveCount(0);
  await expect(page.locator("#lane-detail")).toBeHidden();
  const compactLayout = await page.evaluate(() => {
    const boardNode = document.querySelector(".lane-board-scroll");
    const board = boardNode.getBoundingClientRect();
    const visualHeight = visualViewport?.height ?? innerHeight;
    return {
      boardTop: board.top,
      boardBottom: board.bottom,
      boardHeight: board.height,
      viewportHeight: visualHeight,
      trackTop: document.querySelector(".lane-track").getBoundingClientRect().top,
      availableHeight: Number.parseFloat(getComputedStyle(boardNode).getPropertyValue("--lane-available-height")),
      expectedHeight: Math.max(240, Math.floor(visualHeight - board.top - 12)),
    };
  });
  expect(compactLayout.boardTop).toBeLessThan(compactLayout.viewportHeight * 0.62);
  expect(compactLayout.boardBottom).toBeLessThanOrEqual(compactLayout.viewportHeight + 4);
  expect(compactLayout.boardHeight).toBeGreaterThan(400);
  expect(compactLayout.trackTop - compactLayout.boardTop).toBeLessThan(16);
  await expect(page.locator(".day-summary")).toHaveCount(0);
  expect(Math.abs(compactLayout.availableHeight - compactLayout.expectedHeight)).toBeLessThanOrEqual(2);
  await expect(page.locator(".lane-header").first()).toBeHidden();
  await expect(page.locator(".lane-corner")).toBeHidden();

  await page.setViewportSize({ width: 430, height: 760 });
  await expect.poll(() => page.locator(".lane-board-scroll").evaluate((board) => board.getBoundingClientRect().bottom)).toBeLessThanOrEqual(764);
  await expect.poll(() => page.locator(".lane-board-scroll").evaluate((board) => board.getBoundingClientRect().height)).toBeGreaterThan(360);
  await page.setViewportSize({ width: 430, height: 932 });

  await page.goBack();
  await expect(panel).toHaveAttribute("data-mobile-screen", "list");
  await expect(page.locator("body")).not.toHaveClass(/mobile-day-view/);
  await expect(page.locator("#mobile-menu-toggle")).toBeVisible();
  await expect(page.locator(".day-selector")).toBeVisible();
  await expect(page.locator("#day-detail")).toBeHidden();
  await expect(selectedDay).toBeFocused();
  await expect(page).not.toHaveURL(/day=/);

  await page.goto("/?clawpilotTheme=light&mobileScreen=direct#view=itinerary&day=2027-07-05");
  await expect(page.locator("#startup-notice")).toBeHidden();
  await expect(panel).toHaveAttribute("data-mobile-screen", "day");
  await expect(page.locator("body")).toHaveClass(/mobile-day-view/);
  await expect(page.locator("#day-title")).toHaveText("Shibuya & Harajuku");
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThanOrEqual(2);
  await expect.poll(() => page.locator(".lane-board-scroll").evaluate((board) => board.getBoundingClientRect().top / innerHeight)).toBeLessThan(0.62);
  await page.getByRole("button", { name: "Alle Reisetage" }).click();
  await expect(panel).toHaveAttribute("data-mobile-screen", "list");
  await expect(page).not.toHaveURL(/day=/);

  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/?clawpilotTheme=light&mobileScreen=desktop#view=itinerary&day=2027-07-10");
  await expect(page.locator("#startup-notice")).toBeHidden();
  await expect(page.locator("body")).not.toHaveClass(/mobile-day-view/);
  await expect(page.locator(".day-selector")).toBeVisible();
  await expect(page.locator("#day-detail")).toBeVisible();
  await expect(page.getByRole("button", { name: "Alle Reisetage" })).toBeHidden();
});

test("mobile lane sizing falls back without Visual Viewport or container-unit assumptions", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "visualViewport", { configurable: true, value: undefined });
  });
  await page.setViewportSize({ width: 430, height: 932 });
  await ready(page, "/?clawpilotTheme=light&fallbackSizing=1#view=itinerary&day=2027-07-10");
  const sizing = await page.locator(".lane-board-scroll").evaluate((scroll) => {
    const board = scroll.querySelector(".lane-board");
    const viewport = scroll.getBoundingClientRect();
    const axis = scroll.querySelector(".lane-time-axis").getBoundingClientRect();
    const visibleLanes = [...scroll.querySelectorAll(".lane-track")].filter((track) => {
      const rect = track.getBoundingClientRect();
      return Math.min(rect.right, viewport.right) - Math.max(rect.left, axis.right) > 2;
    }).length;
    return {
      availableHeight: getComputedStyle(scroll).getPropertyValue("--lane-available-height"),
      laneWidth: getComputedStyle(board).getPropertyValue("--lane-mobile-width"),
      columns: getComputedStyle(board).gridTemplateColumns,
      bottom: viewport.bottom,
      viewportHeight: innerHeight,
      visibleLanes,
    };
  });
  expect(sizing.availableHeight).toMatch(/px$/);
  expect(sizing.laneWidth).toMatch(/px$/);
  expect(sizing.columns).toMatch(/px/);
  expect(sizing.bottom).toBeLessThanOrEqual(sizing.viewportHeight + 4);
  expect(sizing.visibleLanes).toBe(1);
});

test("all lane headers use the same opaque surface in light and dark mode", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await ready(page, "/?clawpilotTheme=light&equalHeaders=1#view=itinerary&day=2027-07-13");
  const headerGeometry = await page.locator(".lane-header").evaluateAll((headers) => headers.map((header) => {
    const rect = header.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, height: rect.height };
  }));
  expect(Math.max(...headerGeometry.map(({ bottom }) => bottom)) - Math.min(...headerGeometry.map(({ bottom }) => bottom))).toBeLessThan(1);
  expect(Math.max(...headerGeometry.map(({ height }) => height)) - Math.min(...headerGeometry.map(({ height }) => height))).toBeLessThan(1);
  const compactBuffer = page.locator(".lane-track").nth(1).locator(".lane-block-buffer").first();
  await expect(compactBuffer).toHaveClass(/lane-block-compact/);
  expect(await compactBuffer.evaluate((block) => {
    const blockRect = block.getBoundingClientRect();
    const titleRect = block.querySelector(".lane-block-title").getBoundingClientRect();
    return titleRect.top >= blockRect.top - 1 && titleRect.bottom <= blockRect.bottom + 1;
  })).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ["light", "dark"]) {
    await ready(page, `/?clawpilotTheme=${theme}&opaqueHeaders=1#view=itinerary&day=2027-07-10`);
    const colors = await page.locator(".lane-header").evaluateAll((headers) => headers.map((header) => getComputedStyle(header).backgroundColor));
    expect(new Set(colors).size, theme).toBe(1);
    expect(colors[0], theme).not.toMatch(/^rgba\([^)]*,\s*(?:0|0?\.\d+)\)$/);
  }
});

test("the planner carries the festival rhythm visual language into its work surfaces", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light&rhythmVisuals=1#view=itinerary&day=2027-07-10");
  await expect(page.locator(".lane-route-mark")).toHaveCount(4);
  const laneStyling = await page.locator(".lane-header").evaluateAll((headers) => ({
    topBorders: headers.map((header) => getComputedStyle(header).borderTopColor),
    backgrounds: headers.map((header) => getComputedStyle(header).backgroundColor),
  }));
  expect(new Set(laneStyling.topBorders).size).toBe(4);
  expect(new Set(laneStyling.backgrounds).size).toBe(1);
  await expect(page.locator(".lane-track").first()).toHaveCSS("background-image", /radial-gradient/);
  await expect(page.locator(".lane-block-activity").first()).toHaveCSS("border-bottom-width", "3px");
  await expect(page.locator(".day-option[aria-pressed='true'] .day-option-date strong")).toHaveCSS("border-top-style", "double");
  const routeMarkAlignment = await page.locator(".lane-route-mark").first().evaluate((mark) => {
    const markRect = mark.getBoundingClientRect();
    const textRange = document.createRange();
    textRange.selectNodeContents(mark);
    const textRect = textRange.getBoundingClientRect();
    return {
      display: getComputedStyle(mark).display,
      horizontalOffset: Math.abs((textRect.left + textRect.width / 2) - (markRect.left + markRect.width / 2)),
      verticalOffset: Math.abs((textRect.top + textRect.height / 2) - (markRect.top + markRect.height / 2)),
    };
  });
  expect(routeMarkAlignment.display).toBe("grid");
  expect(routeMarkAlignment.horizontalOffset).toBeLessThan(1);
  expect(routeMarkAlignment.verticalOffset).toBeLessThan(2);
  const pointNumberAlignment = await page.locator(".lane-block .poi-thumb + .lane-block-number").first().evaluate((number) => {
    const numberRect = number.getBoundingClientRect();
    const imageRect = number.previousElementSibling.getBoundingClientRect();
    return Math.abs(numberRect.left - imageRect.left);
  });
  expect(pointNumberAlignment).toBeLessThan(1);
  expect(await page.locator(".panel-heading h2").first().evaluate((heading) => getComputedStyle(heading, "::after").backgroundImage)).toContain("linear-gradient");
});

test("motion animates the festival world, explains state and respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await ready(page, "/?clawpilotTheme=light&motionSystem=1");
  const hero = page.locator(".hero-art");
  await expect(hero).toHaveClass(/motion-entered/);
  await expect(hero).toHaveClass(/motion-active/);
  await expect(page.locator(".hero-train")).toHaveCSS("animation-name", "hero-train");
  await expect(page.locator(".hero-train")).toHaveCSS("animation-iteration-count", "infinite");
  await expect(page.locator("#motion-toggle")).toHaveCount(0);
  await expect(page.locator(".hero-clouds")).toHaveCSS("animation-name", "hero-clouds");
  await expect(page.locator(".hero-rice-motion")).toHaveCSS("animation-name", "hero-rice");

  await show(page, "travel");
  await expect(page.locator("#panel-travel")).toHaveCSS("animation-name", "panel-arrival");
  await show(page, "home");
  await page.locator('.route-stop[data-destination="kyoto"]').click();
  await expect(page.locator('.route-stop[data-destination="kyoto"] .stop-art')).toHaveCSS("animation-name", "landmark-arrival");
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, document.body.scrollHeight);
  });
  await expect(hero).not.toHaveClass(/motion-active/);

  await page.setViewportSize({ width: 430, height: 760 });
  await page.goto("/?clawpilotTheme=light&motionSystem=mobile#view=itinerary&day=2027-07-10&screen=day");
  await expect(page.locator("#startup-notice")).toBeHidden();
  await page.getByRole("button", { name: "Nächste Route" }).click();
  await expect(page.locator(".lane-mobile-status")).toContainText("Route B");
  expect(await page.locator(".lane-mobile-route-mark").evaluate((mark) => mark.getAnimations().some((animation) => animation.playState === "running"))).toBe(true);
  await page.locator(".lane-track").nth(1).locator(".lane-block-activity").first().click();
  await expect(page.locator("#lane-detail")).toHaveCSS("animation-name", "item-screen-arrival");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?clawpilotTheme=light&motionSystem=reduce");
  await expect(page.locator("#startup-notice")).toBeHidden();
  await expect(page.locator(".hero-train")).toHaveCSS("animation-name", "none");
  await expect(page.locator("#panel-itinerary")).toHaveCSS("animation-name", "none");
});

test("station train preserves all destinations and uses bounded reduced-motion-aware parallax", async ({ page }) => {
  for (const width of [320, 430, 900, 1440]) {
    await page.setViewportSize({ width, height: 932 });
    await ready(page, "/?clawpilotTheme=light#view=home");
    await page.locator(".route-train-scene").scrollIntoViewIfNeeded();
    await expect(page.locator(".route-stop")).toHaveCount(4);
    await expect(page.locator(".train-wheels")).toHaveCount(4);
    await expect(page.locator(".carriage-window")).toHaveCount(4);
    await expect(page.locator(".carriage-window svg, .carriage-window-landscape")).toHaveCount(0);
    await expect(page.locator(".route-train-landscape")).toHaveCount(1);
    await expect(page.locator(".route-strip")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(page.locator(".carriage-window").first()).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    expect(await page.locator(".route-stop").evaluateAll((cars) => cars.every((car) => {
      const window = car.querySelector(".carriage-window").getBoundingClientRect();
      const copy = car.querySelector(".stop-copy").getBoundingClientRect();
      const body = car.getBoundingClientRect();
      return window.left >= body.left && window.right <= body.right && window.bottom <= copy.top;
    }))).toBe(true);
    const alignment = await page.locator(".route-train").evaluate((train) => {
      const body = train.querySelector(".route-strip").getBoundingClientRect();
      const nose = train.querySelector(".train-nose-art").getBoundingClientRect();
      const band = train.querySelector(".train-nose-band").getBoundingClientRect();
      const cars = [...train.querySelectorAll(".route-stop")];
      const last = cars.at(-1);
      const car = last.getBoundingClientRect();
      const stripe = getComputedStyle(last, "::before");
      const stripeBottom = car.bottom - Number.parseFloat(stripe.bottom);
      const rail = train.closest(".route-train-scene").querySelector(".route-train-rails");
      const sleeperTop = rail.getBoundingClientRect().top + Number.parseFloat(getComputedStyle(rail).borderTopWidth);
      return [
        Math.abs(body.top - (nose.top - 1)),
        Math.abs(body.bottom - (nose.bottom + 1)),
        Math.abs(body.left - nose.right),
        Math.abs(band.bottom - stripeBottom),
        Math.abs(band.top - (stripeBottom - Number.parseFloat(stripe.height))),
        ...cars.map((node) => Math.abs(node.getBoundingClientRect().top - cars[0].getBoundingClientRect().top)),
        ...[...train.querySelectorAll(".train-wheels")].flatMap((wheel) => {
          return ["::before", "::after"].map((pseudo) => {
            const style = getComputedStyle(wheel, pseudo);
            const border = style.boxSizing === "border-box" ? 0 : Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth);
            const wheelBottom = wheel.getBoundingClientRect().top + Number.parseFloat(style.top) + Number.parseFloat(style.height) + border;
            return Math.max(0, wheelBottom - sleeperTop);
          });
        }),
      ];
    });
    expect(Math.max(...alignment)).toBeLessThan(1);
    if (width < 840) {
      const window = page.locator(".route-train-window");
      expect(await window.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
      await expect(page.locator(".route-train-nose")).toBeInViewport();
      await window.evaluate((node) => node.scrollLeft = node.scrollWidth);
      await expect(page.locator(".route-stop").last()).toBeInViewport();
      await window.evaluate((node) => node.scrollLeft = 0);
    }
    expect(await page.locator(".route-stop").evaluateAll((nodes) => nodes.map((node) => node.dataset.destination))).toEqual(["tokyo", "kyoto", "osaka", "vietnam"]);
    expect(await page.locator(".stop-copy").evaluateAll((nodes) => nodes.every((node) => node.scrollWidth <= node.clientWidth + 1))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const scene = page.locator(".route-train-scene");
  await expect(scene).toHaveClass(/motion-active/);
  await page.locator("#panel-home").evaluate((node) => Promise.all(node.getAnimations().map((animation) => animation.finished)));
  await expect(page.locator(".train-wheels").first()).toHaveCSS("animation-name", "none");
  const landscape = page.locator(".route-train-landscape");
  const rails = page.locator(".route-train-rails");
  await expect(landscape).toHaveCSS("animation-name", "train-landscape-pass");
  const sleepers = page.locator(".train-sleepers");
  const sleepersStyle = () => sleepers.evaluate((node) => {
    const style = getComputedStyle(node);
    return { name: style.animationName, position: new DOMMatrixReadOnly(style.transform).m41 };
  });
  await expect.poll(async () => (await sleepersStyle()).name).toBe("train-sleepers-pass");
  await expect(rails).toHaveCSS("transform", "none");
  const railGeometry = () => rails.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const scene = node.parentElement.getBoundingClientRect();
    return { left: rect.left - scene.left, bottom: scene.bottom - rect.bottom, width: rect.width, height: rect.height };
  });
  const fixedRails = await railGeometry();
  const initialLandscape = await landscape.evaluate((node) => getComputedStyle(node).transform);
  const initialRails = (await sleepersStyle()).position;
  await expect.poll(() => landscape.evaluate((node) => getComputedStyle(node).transform)).not.toBe(initialLandscape);
  await expect.poll(async () => (await sleepersStyle()).position).not.toBe(initialRails);
  expect(Number.isInteger((await sleepersStyle()).position)).toBe(true);
  expect(await sleepers.evaluate((node) => {
    const animation = node.getAnimations()[0];
    animation.pause();
    const rails = node.parentElement.getBoundingClientRect();
    const widths = [0, 250, 500, 750, 999, 1000].map((time) => {
      animation.currentTime = time;
      const rect = node.getBoundingClientRect();
      if (rect.left > rails.left || rect.right < rails.right) throw new Error("Sleeper strip leaves an edge gap");
      const sleeper = node.querySelector("pattern rect");
      const matrix = node.getScreenCTM();
      return sleeper.width.baseVal.value * Math.hypot(matrix.a, matrix.b);
    });
    animation.play();
    return widths;
  })).toEqual([4, 4, 4, 4, 4, 4]);
  const rect = await scene.boundingBox();
  const carriageGeometry = () => page.locator(".route-train").evaluate((train) => {
    const parent = train.parentElement.getBoundingClientRect();
    return [...train.querySelectorAll(".route-stop")].map((car) => {
      const rect = car.getBoundingClientRect();
      return { left: rect.left - parent.left, top: rect.top - parent.top, width: rect.width, height: rect.height };
    });
  });
  const fixedCarriages = await carriageGeometry();
  await page.mouse.move(rect.x + 10, rect.y + 40);
  const shift = () => scene.evaluate((node) => node.style.getPropertyValue("--train-landscape-x"));
  await expect.poll(shift).not.toBe("");
  const left = await shift();
  await page.mouse.move(rect.x + rect.width - 10, rect.y + 40);
  await expect.poll(shift).not.toBe(left);
  const lastCar = page.locator(".route-stop").last();
  const carRect = await lastCar.boundingBox();
  await page.mouse.move(carRect.x + carRect.width / 2, carRect.y + carRect.height / 2);
  expect(await lastCar.evaluate((node) => node.matches(":hover"))).toBe(true);
  await expect(page.locator(".route-train")).toHaveCSS("transform", "none");
  expect(await carriageGeometry()).toEqual(fixedCarriages);
  expect(Math.abs(Number.parseFloat(await shift()))).toBeLessThanOrEqual(20);
  expect(await railGeometry()).toEqual(fixedRails);
  expect(await rails.evaluate((node) => {
    const rail = node.getBoundingClientRect();
    const scene = node.parentElement.getBoundingClientRect();
    return Math.abs(rail.left - scene.left) < 1 && Math.abs(rail.right - scene.right) < 1;
  })).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".train-wheels").first()).toHaveCSS("animation-name", "none");
  await expect(landscape).toHaveCSS("animation-name", "none");
  await expect.poll(async () => (await sleepersStyle()).name).toBe("none");
  await expect.poll(shift).toBe("");
  await page.locator('.route-stop[data-destination="tokyo"]').click();
  await expect(page.locator("#panel-itinerary")).toBeVisible();
  await expect(page.locator(".day-option")).toHaveCount(7);
  await expect(scene).not.toHaveClass(/motion-active/);
});

test("train scenery fills wide screens and its arrow disappears after the first carriage choice", async ({ page }) => {
  for (const width of [430, 1440, 2560]) {
    await page.setViewportSize({ width, height: 932 });
    await ready(page, "/?clawpilotTheme=light#view=home");
    const geometry = await page.locator(".route-train-scene").evaluate((scene) => {
      const rect = scene.getBoundingClientRect();
      const viewport = scene.querySelector(".route-train-window").getBoundingClientRect();
      const scenery = scene.querySelector(".route-train-scenery").getBoundingClientRect();
      const rails = scene.querySelector(".route-train-rails").getBoundingClientRect();
      return { left: rect.left, right: rect.right, viewportWidth: innerWidth, trainWidth: viewport.width, center: (viewport.left + viewport.right) / 2, sceneryLeft: scenery.left, sceneryRight: scenery.right, railLeft: rails.left, railRight: rails.right };
    });
    expect(geometry.left).toBe(0);
    expect(geometry.right).toBe(geometry.viewportWidth);
    expect(geometry.trainWidth).toBeLessThanOrEqual(1200);
    expect(geometry.center).toBeCloseTo(width / 2, 1);
    expect(geometry.sceneryLeft).toBeLessThanOrEqual(0);
    expect(geometry.sceneryRight).toBeGreaterThanOrEqual(width);
    expect(geometry.railLeft).toBe(0);
    expect(geometry.railRight).toBe(width);
  }
  const arrow = page.locator("#train-cta");
  await expect(arrow).toBeVisible();
  await expect(page.locator(".stop-japanese")).toHaveText(["東京", "京都", "大阪", "ダナン"]);
  await expect(page.locator(".stop-japanese").first()).toHaveAttribute("lang", "ja");
  await expect(page.locator(".stop-target").first()).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  expect(await arrow.evaluate((node) => {
    const arrow = node.getBoundingClientRect();
    const target = node.parentElement.getBoundingClientRect();
    return Math.max(Math.abs(arrow.left + 50 - target.left), Math.abs(arrow.top + 44 - target.bottom));
  })).toBeLessThan(1);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator(".route-train-scene").scrollIntoViewIfNeeded();
  await expect(arrow).toHaveCSS("animation-name", "train-hint-point");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator('.route-stop[data-destination="kyoto"]').click();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).trainHintDismissed, storageKey)).toBe(true);
  await show(page, "home");
  await expect(arrow).toBeHidden();
  await page.reload();
  await expect(page.locator("#startup-notice")).toBeHidden();
  await expect(arrow).toBeHidden();
});

test("culinary recommendations describe the experience, children and actual access rules", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-05");
  let point = await openPoint(page, "takeshita");
  await point.locator(".food-recommendation > summary").click();
  await expect(point.locator(".food-recommendation")).toContainText("AFURI");
  await expect(point.locator(".food-children")).toContainText("Nudeln");
  await expect(point.locator(".food-links a")).toHaveCount(2);
  const previewDirectory = process.env.PREVIEW_DIR ?? "test-results/previews";
  await point.locator(".food-recommendation").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${previewDirectory}/desktop-food-tip.png`, animations: "disabled" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.lane-track').first().locator('[data-place-id="takeshita"]').click();
  point = page.locator("#lane-detail");
  await expect(page.locator("#panel-itinerary")).toHaveAttribute("data-mobile-screen", "item");
  await point.locator(".food-recommendation > summary").click();
  await point.locator(".food-recommendation").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${previewDirectory}/mobile-food-tip.png`, animations: "disabled" });
  await page.goto("/?clawpilotTheme=light#view=itinerary&day=2027-07-12");
  point = await openPoint(page, "museum");
  await expect(point.locator(".food-recommendation")).toContainText("Nur für Museumsticket-Inhaber");
  await page.goto("/?clawpilotTheme=light#view=itinerary&day=2027-07-22");
  point = await openPoint(page, "hoian");
  await expect(point.locator(".food-recommendation")).toContainText("Morning Glory Original");
});

test("removed source, budget and footer blocks no longer occupy any planner panel", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-07");
  await expect(page.locator("footer, #panel-budget, #print-plan, #source-footer, #link-audit")).toHaveCount(0);
  await expect(page.locator(".trip-date, .hero-footnote, .route-caption, .day-summary")).toHaveCount(0);
  for (const view of Object.keys(tabs)) {
    await show(page, view);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/Vorlage|Budget|Planungsstand|Ein Sommer, den wir nicht vergessen|Reiseplan drucken|Jede Spalte ist eine vollständige Route|Wähle einen Block|Route genauer ansehen|Eine Nummer antippen|Alle Routenstopps gemeinsam|Spontan heißt|Schritt für Schritt/);
  }
  await page.goto("/#view=budget&day=2027-07-07");
  await expect(page.locator("#panel-itinerary")).toBeVisible();
});

test("the site works under the GitHub Pages repository prefix, including relative modules and links", async ({ page }) => {
  await page.route("http://127.0.0.1:4177/japan2027/**", async (route) => {
    const url = new URL(route.request().url());
    url.pathname = url.pathname.replace(/^\/japan2027\//, "/");
    const response = await route.fetch({ url: url.href });
    await route.fulfill({ response });
  });
  await page.goto("/japan2027/?clawpilotTheme=light#view=itinerary&day=2027-07-05");
  await expect(page.locator("#startup-notice")).toBeHidden();
  await expect(page.locator("#day-title")).toHaveText("Shibuya & Harajuku");
  await openDayMap(page);
  await page.getByRole("button", { name: "OpenStreetMap-Karte laden" }).click();
  await expect(page.locator("#day-map .place-marker")).toHaveCount(5);
  await page.getByRole("button", { name: "Tageskarte schließen" }).click();
  await page.getByRole("button", { name: "Nächster Tag" }).click();
  await expect(page).toHaveURL(/\/japan2027\/.*day=2027-07-06/);
  await page.getByRole("link", { name: "Japan und Vietnam 2027, Startseite" }).click();
  await expect(page).toHaveURL(/\/japan2027\//);
  await expect(page.locator("#startup-notice")).toBeHidden();
});

test("the day map opens as a modal, fits every stop and links back to the exact lane block", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-05");
  const point = await openPoint(page, "nintendoTokyo");
  await point.getByRole("button", { name: "Auf Tageskarte zeigen" }).click();
  await expect(page.locator(".day-map-dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tageskarte schließen" })).toBeVisible();
  await expect(page.locator("#day-map .place-marker")).toHaveCount(5);
  await page.getByRole("button", { name: "Tageskarte schließen" }).click();
  await page.getByRole("button", { name: "Tageskarte öffnen" }).click();
  expect(await page.locator("#day-map").evaluate((map) => {
    const bounds = map.getBoundingClientRect();
    return [...map.querySelectorAll(".place-marker")].every((marker) => {
      const rect = marker.getBoundingClientRect();
      return rect.left >= bounds.left && rect.right <= bounds.right && rect.top >= bounds.top && rect.bottom <= bounds.bottom;
    });
  })).toBe(true);
  await page.getByRole("button", { name: "A5. Shibuya Sky", exact: true }).click();
  await page.getByRole("button", { name: "Details bei diesem Programmpunkt" }).click();
  await expect(page.locator(".day-map-dialog")).toBeHidden();
  await expect(page.locator(".lane-track").first().locator('[data-place-id="sky"]')).toBeFocused();
  await expect(page.locator("#lane-detail")).toContainText("Shibuya Sky");
  await expect(page.locator("#lane-detail .resource-links a").first()).toBeVisible();
  await expect(page.locator("#day-panel-plan")).toBeVisible();
});

test("the zoo is now Wednesday's main point and the Monday/Wednesday swap appears in the date list", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-07");
  await expect(page.locator("#day-title")).toHaveText("Ueno Zoo & Asakusa");
  await expect(page.locator(".day-date")).toContainText("Mittwoch, 7. Juli");
  await expect(page.locator(".lane-track").first().locator(".lane-block-activity").first()).toHaveAttribute("data-place-id", "zoo");
  const zoo = await openPoint(page, "zoo");
  await expect(zoo).toContainText("09:30");
  await expect(zoo.locator(".food-recommendation")).toContainText("Mihashi");
  await openDayMap(page);
  await page.getByRole("button", { name: "OpenStreetMap-Karte laden" }).click();
  await expect(page.locator("#day-map .place-marker")).toHaveCount(4);
  await expect(page.getByRole("button", { name: "A1. Ueno Zoo", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "A2. Nakamise-Ladenstraße", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Tageskarte schließen" }).click();
  await page.getByRole("button", { name: "Montag, 5. Juli: Shibuya & Harajuku", exact: true }).click();
  await expect(page.locator("#day-title")).toHaveText("Shibuya & Harajuku");
  await expect(page.locator(".day-date")).toContainText("Montag, 5. Juli");
});

test("the expired flight offer is not confused with the announced direct route", async ({ page }) => {
  await ready(page);
  await show(page, "travel");
  const flight = page.locator(".flight-card").nth(1);
  await expect(flight).toContainText("nicht, dass es keine Direktstrecke gibt");
  await expect(flight).toContainText("20. Dezember 2026");
  await expect(flight).toContainText("20. Juli 2027");
  await expect(flight).toContainText("noch nicht bestätigt");
  await expect(flight.locator("a[href*='kansai-airports.co.jp']")).toHaveAttribute("href", "https://www.kansai-airports.co.jp/en/news/e-260825-pressrelease-vj-kix-dad/");
  await expect(page.locator("a[href*='lastminute.de']")).toHaveCount(0);
});

test("Ghibli has conditional booking, its own transport and child-aware cafe details", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-08");
  await expect(page.locator("#day-title")).toHaveText("Wandertag: Mount Takao");
  await expect(page.locator(".day-summary")).toHaveCount(0);
  await expect(page.locator(".lane-header")).toHaveCount(3);
  await expect(page.locator(".lane-header").filter({ hasText: "Ghibli Museum statt Mount Takao" })).toContainText("Entfällt: Mount Takao · Gipfel");
  const option = await openPoint(page, "ghibli");
  await expect(option).toContainText("03:00 Uhr MESZ");
  await expect(option).toContainText("JR Chuo Line");
  await expect(option).toContainText("bis zwölf Jahre");
  await expect(option.getByRole("link", { name: "Ghibli Museum: offizielle Ticketreservierung", exact: true })).toHaveAttribute("href", "https://www.ghibli-museum.jp/en/tickets/");
  await expect(option.locator(".place-actions a")).toHaveAttribute("href", /35\.696238%2C139\.5704317/);
  await option.locator(".food-recommendation > summary").click();
  await expect(option.locator(".food-practical")).toContainText("Nur mit Museumseintritt");
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(axe.violations.map(({ id }) => id)).toEqual([]);
  await show(page, "checklist");
  const row = page.locator(".check-row").filter({ has: page.getByRole("checkbox", { name: "Optional: Ghibli Museum reservieren", exact: true }) });
  await expect(row).toContainText("10.06.2027");
  await expect(row.locator("a")).toHaveAttribute("href", "https://www.ghibli-museum.jp/en/tickets/");
  await show(page, "itinerary");
  await page.getByRole("searchbox").fill("Ghibli");
  await expect(page.locator(".day-option")).toHaveCount(1);
  await expect(page.locator("#day-title")).toHaveText("Wandertag: Mount Takao");
});

test("Pokemon and Nintendo share an accessible building marker without losing their individual links", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-05");
  const point = await openPoint(page, "pokemon");
  await expect(point).toContainText("offizielles Pokémon Center");
  await expect(point.locator(".resource-links a")).toHaveAttribute("href", "https://shop.pokemon.co.jp/en/shop/pokemoncenter-shibuya/");
  await point.getByRole("button", { name: "Auf Tageskarte zeigen" }).click();
  await expect(page.locator("#day-map .place-marker")).toHaveCount(5);
  await expect(page.locator("#day-map").getByRole("button", { name: /A2\. Nintendo TOKYO.*A3\. Pokémon Center SHIBUYA/ })).toHaveText("A2·A3");
  const popup = page.locator(".leaflet-popup-content .place-popup").filter({ hasText: "Pokémon Center SHIBUYA" });
  await expect(popup.locator("a").first()).toHaveAttribute("href", /35\.6619997%2C139\.6984094/);
  await popup.getByRole("button", { name: "Details bei diesem Programmpunkt" }).click();
  await expect(page.locator(".lane-track").first().locator('[data-place-id="pokemon"]')).toBeFocused();
  await expect(page.locator("#lane-detail")).toContainText("Pokémon Center SHIBUYA");
  await expect(page.locator("#lane-detail .lane-inline-arrival")).toContainText("Kurzer Weg vom vorherigen Punkt");
});

test("DisneySea is later, teamLab is Tuesday and Miraikan is not falsely offered that day", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-06");
  await expect(page.locator("#day-title")).toHaveText("teamLab & Odaiba");
  await expect(page.locator('[data-place-id="miraikan"]')).toHaveCount(0);
  await expect(page.locator(".planning-correction")).toContainText("dienstags geschlossen");
  await page.getByRole("button", { name: "Freitag, 9. Juli: DisneySea", exact: true }).click();
  await expect(page.locator("#day-title")).toHaveText("DisneySea");
  await expect(page.locator(".day-date")).toContainText("9. Juli");
  await page.locator(".day-booking-note > summary").click();
  await expect(page.locator(".day-booking-note")).toContainText("bisherigen 6. Juli");
  await expect(page.locator(".day-booking-note")).toContainText("nicht automatisch gültig");
});

test("the dining rubric filters city, experience and verified spontaneous options", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=dining&day=2027-07-05");
  await expect(page.locator("#dining-list .dining-option")).toHaveCount(9);
  await expect(page.locator("#dining-destinations")).not.toContainText("Vietnam");
  await page.getByRole("checkbox", { name: "Nur spontan versuchbar", exact: true }).check();
  await expect(page.locator("#dining-list .dining-option")).toHaveCount(3);
  await expect(page.locator("#dining-pokemon-cafe-tokyo")).toHaveCount(0);
  await page.locator('[data-dining-destination="kyoto"]').click();
  await expect(page.locator("#dining-list .dining-option")).toHaveCount(1);
  await page.locator("#dining-kyoto-ramen-koji > summary").click();
  await expect(page.locator("#dining-kyoto-ramen-koji .dining-body")).toContainText("Kindergeschirr");
  await expect(page.locator("#dining-kyoto-ramen-koji .dining-body")).toContainText("keine Sitzplatzreservierungen");
  await page.locator('[data-dining-destination="tokyo"]').click();
  await expect(page.locator(".dining-empty")).toBeVisible();
  await page.getByRole("button", { name: "Alle Buchungsarten anzeigen" }).click();
  await expect(page.getByRole("checkbox", { name: "Nur spontan versuchbar" })).not.toBeChecked();
  await page.locator('[data-dining-category="view"]').click();
  await expect(page.locator("#dining-list .dining-option")).toHaveCount(1);
  await page.locator("#dining-musashi-asakusa > summary").click();
  await expect(page.locator("#dining-musashi-asakusa .dining-body")).toContainText("Kinderzugang");
  await expect(page.locator("#dining-musashi-asakusa .dining-body")).toContainText("Kein zusätzliches Skytree");
  await page.locator('[data-dining-category="all"]').click();
  await page.locator("#dining-pokemon-cafe-tokyo > summary").click();
  await expect(page.locator("#dining-pokemon-cafe-tokyo")).toContainText("Nur mit Vorbuchung");
  await expect(page.locator("#dining-pokemon-cafe-tokyo .dining-body")).toContainText("NICHT im Pokémon Center SHIBUYA");
});

test("festival proposals are connected to the right day and never promise 2027 fireworks", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-07");
  await page.getByRole("button", { name: "Festoption: Iriya Asagao-matsuri · Prunkwinden-Markt", exact: true }).click();
  await expect(page.locator("#panel-festivals")).toBeVisible();
  await expect(page.locator("#festival-iriya-asagao")).toHaveAttribute("open", "");
  await expect(page.locator("#festival-iriya-asagao > summary")).toBeFocused();
  await expect(page.locator("#festival-iriya-asagao .festival-status")).toContainText("2027 noch prüfen");
  await expect(page.locator("#festival-iriya-asagao")).toContainText("Nicht Zoo, Asakusa und Iriya");
  await page.locator("#festival-gion-parade > summary").click();
  await expect(page.locator("#festival-gion-parade")).toContainText("ERSATZ für Minoh");
  await expect(page.locator("#festival-gion-parade")).toContainText("ab Osaka");
  await page.locator("#festival-disney-believe > summary").click();
  await expect(page.locator("#festival-disney-believe")).toContainText("kein zugesagtes klassisches Feuerwerk");
  await page.locator(".fireworks-context-note > summary").click();
  await expect(page.locator("#fireworks-context")).toContainText("20. Juli weiter");
  await expect(page.locator("#fireworks-context")).toContainText("Tokyo bereits am 11. Juli verlasst");
});

test("inline POIs show credited local photographs and clearly labeled original illustrations", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-05");
  let point = await openPoint(page, "takeshita");
  const photo = point.locator(".poi-figure img");
  await photo.scrollIntoViewIfNeeded();
  await expect.poll(() => photo.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
  expect(await photo.evaluate((image) => new URL(image.src).origin === location.origin)).toBe(true);
  await expect(point.locator(".poi-credit")).toContainText("Archivfoto");
  await expect(point.locator(".poi-credit a")).toHaveCount(2);
  const preview = process.env.PREVIEW_DIR ?? "test-results/previews";
  await point.screenshot({ path: `${preview}/desktop-poi-postcard.png`, animations: "disabled" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.lane-track').first().locator('[data-place-id="takeshita"]').click();
  point = page.locator("#lane-detail");
  await point.screenshot({ path: `${preview}/mobile-poi-postcard.png`, animations: "disabled" });
  await page.getByRole("button", { name: "Zur Tagesroute" }).click();
  const crossing = await openPoint(page, "crossing");
  await expect(crossing.locator(".poi-figure")).toContainText("keine Ortsaufnahme");
  await expect(crossing.locator(".poi-figure svg use")).toHaveAttribute("href", /poi-illustrations\.svg#scene-crossing$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("photo failures are explained without hiding the point details or independent links", async ({ page }) => {
  await page.route("**/assets/poi/takeshita.jpg", (route) => route.abort("failed"));
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-05");
  const point = await openPoint(page, "takeshita");
  await point.locator(".poi-figure").scrollIntoViewIfNeeded();
  await expect(point.locator(".poi-credit")).toContainText("Foto konnte nicht geladen werden");
  await expect(point.locator(".poi-figure svg")).toHaveAttribute("role", "img");
  await expect(point.locator(".place-description")).toBeVisible();
  await expect(point.locator(".place-actions a")).toBeVisible();
});

test("the dinner shortcut opens ideas for the selected Japanese city", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-05");
  await page.getByRole("button", { name: "Abendideen in Tokyo", exact: true }).click();
  await expect(page.locator("#panel-dining")).toBeVisible();
  await expect(page.locator('[data-dining-destination="tokyo"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#dining-list .dining-option")).toHaveCount(4);
  await expect(page.locator("#mobile-menu-toggle")).toBeFocused();
  await expect(page.locator("#mobile-menu-label")).toHaveText("Menü · Kulinarik");
});

test("UZUMASA appears as a full-day ninja replacement rather than an addition to Nara", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-13");
  await expect(page.locator("#day-title")).toContainText("Nara");
  await expect(page.locator(".day-summary")).toHaveCount(0);
  await expect(page.locator(".lane-header").filter({ hasText: "UZUMASA Ninja-Haus statt Nara" })).toContainText("Entfällt: Nara-Park");
  const option = await openPoint(page, "uzumasa");
  await expect(option).toContainText("Nicht anschließend noch nach Nara");
  await expect(option).toContainText("Geheimtüren");
  await expect(option).toContainText("Uzumasa Tenjingawa");
  await expect(option.locator(".place-actions a")).toHaveAttribute("href", /35\.016452%2C135\.708023/);
  await expect(option.locator(".poi-figure svg use")).toHaveAttribute("href", /poi-illustrations\.svg#scene-ninja$/);
  await expect(option.getByRole("link", { name: "UZUMASA: Ninja Escape Room & versteckte Mechanismen" })).toHaveAttribute("href", "https://en.eigamura.com/attraction/karakuri/");
});

test("the July 18 sumo dinner alternative opens HIRAKUZA with honest family booking rules", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-18");
  const block = page.locator(".lane-block-activity").filter({ hasText: "Sumo-Show mit Abendessen" });
  await block.click();
  const option = page.locator("#lane-detail");
  await expect(option).toContainText("kein offizielles Profi-Turnier");
  await option.getByRole("button", { name: "Sumo-Essen in Kulinarik öffnen" }).click();
  await expect(page.locator("#panel-dining")).toBeVisible();
  await expect(page.locator("#dining-hirakuza-osaka")).toHaveAttribute("open", "");
  await expect(page.locator("#dining-hirakuza-osaka > summary")).toBeFocused();
  await expect(page.locator("#dining-hirakuza-osaka")).toContainText("Kinder-Bento");
  await expect(page.locator("#dining-hirakuza-osaka")).toContainText("keine offizielle Sumo-Veranstaltung");
  await expect(page.locator("#dining-hirakuza-osaka .poi-figure svg use")).toHaveAttribute("href", /poi-illustrations\.svg#scene-sumo$/);
  await expect(page.locator("#dining-hirakuza-osaka").getByRole("link", { name: "Offizielle Tischreservierung" })).toHaveAttribute("href", "https://ars-hirakuza.triplabo.com/home?lang=en");
});

test("the July 10 Tokyo sumo route replaces Akihabara and opens HIRAKUZA Ginza", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-10");
  const route = page.locator(".lane-header").filter({ hasText: "HIRAKUZA Ginza statt Akihabara" });
  await expect(route).toContainText("Dazu: HIRAKUZA · Ginza Tokyo");
  await expect(route).toContainText("Entfällt: Akihabara");
  const block = page.locator(".lane-block-activity").filter({ hasText: "HIRAKUZA Ginza statt Akihabara" });
  await block.click();
  const detail = page.locator("#lane-detail");
  await expect(detail).toContainText("wählt eine der beiden HIRAKUZA-Shows, nicht beide");
  await expect(detail.locator(".lane-inline-arrival")).toContainText("Prime Ginza Yanagidori Building");
  await detail.getByRole("button", { name: "Sumo-Essen in Kulinarik öffnen" }).click();
  await expect(page.locator("#panel-dining")).toBeVisible();
  await expect(page.locator("#dining-hirakuza-tokyo")).toHaveAttribute("open", "");
  await expect(page.locator("#dining-hirakuza-tokyo > summary")).toBeFocused();
  await expect(page.locator("#dining-hirakuza-tokyo")).toContainText("Kinder-Set im Schlossdesign");
  await expect(page.locator("#dining-hirakuza-tokyo")).toContainText("kein offizielles Profi-Sumo-Turnier");
  await expect(page.locator("#dining-hirakuza-tokyo .poi-figure svg use")).toHaveAttribute("href", /poi-illustrations\.svg#scene-sumo$/);
  await expect(page.locator("#dining-hirakuza-tokyo").getByRole("link", { name: "Offizielle Tischreservierung" })).toHaveAttribute("href", "https://ars-hirakuzat.triplabo.com/home?lang=en");
});
