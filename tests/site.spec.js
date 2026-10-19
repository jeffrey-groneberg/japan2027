import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

const storageKey = "japan-vietnam-2027:planner:v1";
const tabs = {
  itinerary: "Reiseplan",
  travel: "Flüge & Anfahrt",
  stays: "Unterkünfte",
  bases: "Basen & Einkaufen",
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

async function ready(page, url = "/?clawpilotTheme=light") {
  await page.goto(url);
  await expect(page.locator("#startup-notice")).toBeHidden();
  await expect(page.locator(".day-option")).toHaveCount(30);
}

async function show(page, view) {
  await page.getByRole("tab", { name: tabs[view], exact: typeof tabs[view] === "string" }).click();
  await expect(page.locator(`#panel-${view}`)).toBeVisible();
}

async function daySection(page, name) {
  await page.getByRole("tablist", { name: "Bereiche des ausgewählten Reisetags" }).getByRole("tab", { name }).click();
}

test("all destinations, date navigation, practical transport and search work", async ({ page }) => {
  await ready(page);
  await expect(page.locator("#day-title")).toHaveText("Abflug");
  await expect(page.getByRole("button", { name: "Vorheriger Tag" })).toBeDisabled();
  await page.getByRole("button", { name: "Nächster Tag" }).click();
  await expect(page.locator("#day-title")).toHaveText("Ankunft Haneda");
  await expect(page.locator(".transport-box")).toContainText("Keikyu");
  await expect(page.locator(".transport-box")).toContainText("Welches Ticket, wo kaufen?");
  for (const [id, count] of [["tokyo", 7], ["kyoto", 4], ["osaka", 5], ["vietnam", 12]]) {
    await page.locator(`.route-stop[data-destination="${id}"]`).click();
    await expect(page.locator(".day-option")).toHaveCount(count);
    await expect(page.locator(`.filter-button[data-destination="${id}"]`)).toHaveAttribute("aria-pressed", "true");
  }
  await page.getByRole("button", { name: "Alle Tage", exact: true }).click();
  await page.getByRole("searchbox", { name: "Tagesplan durchsuchen" }).fill("Nintendo Museum");
  await expect(page.locator(".day-option")).toHaveCount(1);
  await expect(page.locator("#day-title")).toHaveText("Fushimi Inari & Nintendo Museum");
  await expect(page.locator(".day-date")).toContainText("12. Juli");
  await page.getByRole("searchbox").fill("zz-not-a-place");
  await expect(page.getByRole("heading", { name: "Hier ist gerade kein Reisetag." })).toBeVisible();
  await page.getByRole("button", { name: "Alle Tage anzeigen" }).click();
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
  await expect(page.locator("#checklist-progress-text")).toHaveText("2 von 7 erledigt");
  await page.reload();
  await expect(page.locator("#startup-notice")).toBeHidden();
  await expect(page.locator("#checklist-progress")).toHaveAttribute("value", "2");
  await expect(page.locator("#saved-count")).toHaveText("1");
  await show(page, "itinerary");
  await page.getByRole("button", { name: /Gemerkte/ }).click();
  await expect(page.locator(".day-option")).toHaveCount(1);
  await page.getByRole("button", { name: "Tag aus Merkliste entfernen: Abflug", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Deine Merkliste wartet noch." })).toBeVisible();
});

test("accommodation selections persist and actual bedroom problems are explained", async ({ page }) => {
  await ready(page);
  await show(page, "stays");
  await page.locator("#stay-tokyo-2").check();
  await page.locator("#stay-kyoto-2").check();
  await page.locator("#stay-osaka-1").check();
  await expect(page.locator("#panel-stays")).toContainText("nur ein Schlafzimmer");
  await expect(page.locator("#panel-stays")).toContainText("ausgebucht");
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
  expect(calendar.replaceAll("\r\n ", "")).toContain("Kulinarik: AFURI");
  expect(calendar).not.toMatch(/Vorlage|Budget|Planungsstand/);
});

test("deep links, keyboard tabs, theme persistence and external links are correct", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-16");
  await expect(page.locator("#day-title")).toHaveText("USJ & Super Nintendo World");
  await page.getByRole("tab", { name: "Reiseplan", exact: true }).focus();
  await page.keyboard.press("End");
  await expect(page.locator("#tab-checklist")).toBeFocused();
  await expect(page.locator("#panel-checklist")).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("#panel-bases")).toBeVisible();
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
  test(`all five panels meet automated WCAG checks in ${theme} mode`, async ({ page }) => {
    await ready(page, `/?clawpilotTheme=${theme}`);
    const violations = [];
    for (const view of Object.keys(tabs)) {
      await show(page, view);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      violations.push(...results.violations.map((finding) => ({
        view, rule: finding.id, nodes: finding.nodes.map((node) => ({ target: node.target, reason: node.failureSummary })),
      })));
      if (view === "itinerary") {
        for (const section of ["Orte & Karte", "Anfahrt & Tickets", "Alternativen"]) {
          await daySection(page, section === "Orte & Karte" ? /Orte & Karte/ : section);
          const sectionResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
          violations.push(...sectionResults.violations.map((finding) => ({
            view: `itinerary/${section}`, rule: finding.id, nodes: finding.nodes.map((node) => ({ target: node.target, reason: node.failureSummary })),
          })));
        }
      }
    }
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

test("delivery previews and browser errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await ready(page);
  await page.evaluate(() => document.fonts.ready);
  const previewDirectory = process.env.PREVIEW_DIR ?? "test-results/previews";
  const capture = async (name) => page.screenshot({ path: `${previewDirectory}/${name}.png`, animations: "disabled" });
  const plannerTop = async () => page.locator("#planner").evaluate((node) => window.scrollTo(0, node.getBoundingClientRect().top + window.scrollY - 8));
  await capture("desktop-home");
  await plannerTop();
  await capture("desktop-itinerary");
  for (const view of ["travel", "stays", "checklist"]) {
    await show(page, view);
    await plannerTop();
    await capture(`desktop-${view}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await show(page, "itinerary");
  await page.evaluate(() => window.scrollTo(0, 0));
  await capture("mobile-home");
  await plannerTop();
  await capture("mobile-itinerary");
  await daySection(page, "Alternativen");
  await page.locator("#day-panel-alternatives .alternative-option > summary").first().click();
  await page.locator("#day-panel-alternatives").evaluate((node) => window.scrollTo(0, node.getBoundingClientRect().top + window.scrollY - 84));
  await capture("mobile-alternatives");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/?clawpilotTheme=light#view=itinerary&day=2027-07-07");
  await expect(page.locator("#startup-notice")).toBeHidden();
  await plannerTop();
  await capture("desktop-shibuya-guide");
  await daySection(page, /Orte & Karte/);
  await page.getByRole("button", { name: "OpenStreetMap-Karte laden" }).click();
  await expect(page.locator("#day-map .place-marker")).toHaveCount(4);
  await page.locator("#day-places").evaluate((node) => window.scrollTo(0, node.getBoundingClientRect().top + window.scrollY - 90));
  await capture("desktop-shibuya-map");
  await show(page, "bases");
  await page.locator('[data-base="kyoto"]').click();
  await plannerTop();
  await capture("desktop-bases");
  await page.setViewportSize({ width: 390, height: 844 });
  await show(page, "itinerary");
  await daySection(page, "Tagesablauf");
  await page.locator("#day-detail").evaluate((node) => window.scrollTo(0, node.getBoundingClientRect().top + window.scrollY - 80));
  await capture("mobile-shibuya-guide");
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

test("the Shibuya day explains what to do and gives four exact place links", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-07");
  await expect(page.locator(".day-agenda > li")).toHaveCount(3);
  await expect(page.locator(".day-agenda")).toContainText("Lieblingssouvenir");
  await expect(page.locator(".transport-box")).toContainText("Yamanote Line");
  await expect(page.locator(".place-item")).toHaveCount(4 + 3);
  await daySection(page, /Orte & Karte/);
  const links = page.locator("#day-places .place-actions a");
  await expect(links).toHaveCount(4);
  const queries = await links.evaluateAll((nodes) => nodes.map((node) => new URL(node.href).searchParams.get("query")));
  expect(queries).toEqual(["35.67125,139.70481", "35.661972,139.698944", "35.6595,139.70056", "35.658056,139.701389"]);
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
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-07");
  expect(tileRequests).toBe(0);
  await daySection(page, /Orte & Karte/);
  await page.getByRole("button", { name: "OpenStreetMap-Karte laden" }).click();
  await expect(page.locator("#day-map .place-marker")).toHaveCount(4);
  await expect(page.locator("#day-map")).toContainText("OpenStreetMap");
  await page.getByRole("button", { name: "2. Nintendo TOKYO · Shibuya PARCO", exact: true }).click();
  await expect(page.locator(".leaflet-popup-content")).toContainText("Nintendo TOKYO");
  await expect(page.locator(".leaflet-popup-content a").first()).toHaveAttribute("href", /35\.661972%2C139\.698944/);
  await page.getByRole("button", { name: "Donnerstag, 8. Juli: Wandertag: Mount Takao", exact: true }).click();
  await daySection(page, /Orte & Karte/);
  await expect(page.locator("#day-map .place-marker")).toHaveCount(1);
  await page.getByRole("button", { name: "Samstag, 3. Juli: Abflug", exact: true }).click();
  await expect(page.locator("#day-map")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("map tile failures leave clear guidance and working independent target links", async ({ page }) => {
  await page.route("https://tile.openstreetmap.org/**", (route) => route.abort("failed"));
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-07");
  await daySection(page, /Orte & Karte/);
  await page.getByRole("button", { name: "OpenStreetMap-Karte laden" }).click();
  await expect(page.locator("#day-places .map-status")).toContainText("konnten nicht geladen");
  await expect(page.locator("#day-places .place-actions a")).toHaveCount(4);
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
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-07");
  await page.setViewportSize({ width: 390, height: 844 });
  await daySection(page, /Orte & Karte/);
  await page.getByRole("button", { name: "OpenStreetMap-Karte laden" }).click();
  await expect(page.locator("#day-map .place-marker")).toHaveCount(4);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations.map((finding) => ({ id: finding.id, targets: finding.nodes.map((node) => node.target) }))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator("#day-places").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${process.env.PREVIEW_DIR ?? "test-results/previews"}/mobile-places-map.png`, animations: "disabled" });
});

test("day planning separates content, keeps the overview short and reveals every detail on demand", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-07");
  await expect(page.locator(".day-agenda .agenda-disclosure")).toHaveCount(3);
  await expect(page.locator(".day-agenda .agenda-disclosure[open]")).toHaveCount(0);
  await expect(page.locator("#day-panel-plan")).toBeVisible();
  await expect(page.locator("#day-panel-places")).toBeHidden();
  await expect(page.locator("#day-panel-transit")).toBeHidden();
  expect(await page.locator("#day-detail").evaluate((node) => node.getBoundingClientRect().height)).toBeLessThan(950);
  await page.locator(".agenda-disclosure > summary").nth(1).click();
  await expect(page.locator(".agenda-disclosure[open]")).toContainText("Lieblingssouvenir");
  await page.locator(".agenda-disclosure > summary").first().click();
  await expect(page.locator(".agenda-disclosure[open]")).toHaveCount(1);
  await page.getByRole("button", { name: "Takeshita Street · Harajuku", exact: true }).click();
  await expect(page.locator("#day-panel-places")).toBeVisible();
  await expect(page.locator("#day-place-takeshita .place-disclosure")).toHaveAttribute("open", "");
  await expect(page.locator("#day-place-takeshita .place-description")).toBeVisible();
  await daySection(page, "Tagesablauf");
  await expect(page.getByRole("button", { name: "Nächster Tag" })).toBeVisible();
  await page.getByRole("button", { name: "Nächster Tag" }).click();
  await expect(page.locator("#day-title")).toHaveText("Wandertag: Mount Takao");
  await expect(page.locator("#day-panel-plan")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?clawpilotTheme=light#view=itinerary&day=2027-07-07");
  expect(await page.locator("#day-detail").evaluate((node) => node.getBoundingClientRect().height)).toBeLessThan(1250);
  await daySection(page, "Anfahrt & Tickets");
  await expect(page.locator("#day-panel-transit .transit-steps")).toBeVisible();
  await daySection(page, "Alternativen");
  await expect(page.locator("#day-panel-alternatives")).toContainText("Gaming statt weiterer Shoppingstraßen");
});

test("culinary recommendations describe the experience, children and actual access rules", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-07");
  await page.getByRole("button", { name: "Kulinarik-Tipps für unsere Stopps" }).click();
  await expect(page.locator("#day-place-takeshita .food-recommendation")).toContainText("AFURI");
  await expect(page.locator("#day-place-takeshita .food-children")).toContainText("Nudeln");
  await expect(page.locator("#day-place-takeshita .food-links a")).toHaveCount(2);
  const previewDirectory = process.env.PREVIEW_DIR ?? "test-results/previews";
  await page.locator("#day-place-takeshita .food-recommendation").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${previewDirectory}/desktop-food-tip.png`, animations: "disabled" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#day-place-takeshita .food-recommendation").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${previewDirectory}/mobile-food-tip.png`, animations: "disabled" });
  await page.goto("/?clawpilotTheme=light#view=itinerary&day=2027-07-12");
  await daySection(page, /Orte & Karte/);
  await page.locator("#day-place-museum summary").click();
  await expect(page.locator("#day-place-museum .food-recommendation")).toContainText("Nur für Museumsticket-Inhaber");
  await page.goto("/?clawpilotTheme=light#view=itinerary&day=2027-07-22");
  await daySection(page, /Orte & Karte/);
  await page.locator("#day-place-hoian summary").click();
  await expect(page.locator("#day-place-hoian .food-recommendation")).toContainText("Morning Glory Original");
});

test("removed source, budget and footer blocks no longer occupy any planner panel", async ({ page }) => {
  await ready(page, "/?clawpilotTheme=light#view=itinerary&day=2027-07-07");
  await expect(page.locator("footer, #panel-budget, #print-plan, #source-footer, #link-audit")).toHaveCount(0);
  for (const view of Object.keys(tabs)) {
    await show(page, view);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/Vorlage|Budget|Planungsstand|Ein Sommer, den wir nicht vergessen|Reiseplan drucken/);
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
  await page.goto("/japan2027/?clawpilotTheme=light#view=itinerary&day=2027-07-07");
  await expect(page.locator("#startup-notice")).toBeHidden();
  await expect(page.locator("#day-title")).toHaveText("Shibuya & Harajuku");
  await daySection(page, /Orte & Karte/);
  await page.getByRole("button", { name: "OpenStreetMap-Karte laden" }).click();
  await expect(page.locator("#day-map .place-marker")).toHaveCount(4);
  await page.getByRole("button", { name: "Nächster Tag" }).click();
  await expect(page).toHaveURL(/\/japan2027\/.*day=2027-07-08/);
  await page.getByRole("link", { name: "Japan und Vietnam 2027, Startseite" }).click();
  await expect(page).toHaveURL(/\/japan2027\//);
  await expect(page.locator("#startup-notice")).toBeHidden();
});
