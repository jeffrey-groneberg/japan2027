# Japan & Vietnam 2027

A playful, build-free travel planner based on the supplied German itinerary.
Original Japanese festival and rhythm-arcade SVG artwork, with no copied game
assets, hosted JavaScript dependencies, analytics or backend. Leaflet is
vendored locally; optional background maps come from OpenStreetMap.

**Site:** https://jeffrey-groneberg.github.io/japan2027/

## Using the planner

- Browse all 30 days, filter by destination, search activities and transport
  instructions, and keep favorite days.
- Read concrete daily sequences, booking tips and plain-language train and
  ticket instructions instead of having to interpret rail abbreviations.
- Scan separated, numbered points and open descriptions, official links,
  Google Maps and culinary advice directly at the corresponding stop.
  A collapsible, complete day map sits in the agenda, with matching numbers,
  point-to-map and popup-to-point navigation, plus an all-stops reset.
  Three day-local tabs separate the agenda, travel/tickets and alternatives;
  previous/next-day controls stay at the top.
- Explore 45 sightseeing and shopping points with official information,
  individual Google Maps links and an interactive OpenStreetMap view.
- Find supermarkets, everyday shopping and souvenir / gaming destinations for
  each planned base, without inventing a private apartment's exact address.
- Browse ten Japan accommodation options and retain a personal selection.
  Bedroom-category problems found during the browser check are called out.
- Find alternatives for every day and a nearby culinary recommendation at
  every mapped place, with an explanation, child-aware choices and access rules.
- Track seven booking tasks and export the detailed days as an `.ics` calendar.
- Switch between light and dark themes. Keyboard navigation, reduced motion
  and small screens are supported.

Selections and checklist progress use this browser's
`localStorage`. They are not synchronized between devices or people. No actual
bookings are made. Deleting website data clears the saved preferences.

The published itinerary is **public**. Do not add passport numbers, booking
references, contact details or other private information. Travel details,
prices, scores, entry rules and booking windows are planning information from
**October 2026**, not live-verified facts.

At the user's request, the budget feature, original-template/source panel,
repetitive disclaimer paragraphs, print button and entire footer are removed.
Link evidence stays in the data and documentation, not as a large page footer.
The small, relevant map-loading privacy notice and required OSM attribution
remain next to the map.

## Maps, sources and link verification

Map tiles load only after the visitor chooses to load a map or show a point.
This sends the IP address and page referrer to OpenStreetMap. No geolocation,
account, runtime geocoding or external map script is required. Ordinary browser
tile caching is preserved; there is no tile prefetch or offline downloading.
The map visibly credits OpenStreetMap. Automated browser tests intercept tile
requests and use local fixtures rather than burdening community tile servers.

Coordinates were checked against operator location data, Wikidata and named
OpenStreetMap objects. Every location records its coordinate evidence. Broad
districts, mountains and festival areas are explicitly orientation points, not
guaranteed entrances or current walking / transit routes.

On **19 October 2026**, all **166 distinct published external URL targets** were
checked individually, including **45 coordinate-based sightseeing Google Maps
links** and **31 named culinary map searches**. HTTP responses, redirects,
source identity and map queries were reviewed. The original thirteen
fetch-restricted pages were then opened in visible browser canvases and
their loaded DOM inspected: all nine Expedia properties, both Booking.com
properties, JR East's Suica page and DisneySea. DisneySea's restaurant page
was also verified in the browser after fetch timed out. The newly added
Kansai Airports route announcement was DOM-verified after a blocked fetch.

The exact-date recheck confirmed material room-category issues: for
11–15 July, Stay SAKURA's available apartments have one bedroom. Its
two-bedroom suite is marked unavailable, and its detail line contradicts
the title by also saying one bedroom. For 15–20 July, Olfea/Orphear offers
one bedroom with two double beds; its Expedia two-bedroom balcony suite is
unavailable. Two beds do not establish two separate bedrooms. These findings
appear next to the affected options and do not claim the properties never
have two-bedroom accommodation. No
availability, price or future menu is promised by a successful link check.

The old lastminute.de search was also inspected in the browser: it explicitly
says the selected flight is no longer available. The UI therefore replaces it
with the official VietJet website. Kansai Airports' release of 25 August 2026
announces four weekly round trips from 20 December 2026; it does not confirm
seats or times on 20 July 2027. The UI distinguishes this announcement from
the expired offer and does not claim a booked or confirmed dated connection.
The original flight fields remain internal for provenance.
Incorrect candidate links and insecure redirects
were not adopted as official attraction resources.

The schedule now puts Shibuya/Harajuku on Monday, **5 July**, and Ueno Zoo on
Wednesday, **7 July**, avoiding the zoo's regular Monday closure. The zoo
comes first; Asakusa afterward is optional. DisneySea stays on 6 July.
The plan warns that an existing Shibuya Sky ticket would need changing,
not silently transferring dates.

Other material corrections are visible on the relevant days: Nintendo Museum's explicit public-transport-only
arrival guidance (not taxi), and ROBINSON's actual Tam Tien location, about
50 km / 60 minutes from Hoi An. Historical source data remains internal; the
traveler-facing plan uses the corrected guidance.

## Local preview

Serve `site/` with any static HTTP server. For example, with Python 3:

```sh
python3 scripts/serve.py
```

Open http://127.0.0.1:4177/. Use HTTP rather than double-clicking `index.html`:
the JavaScript modules must be served by a web server.

There is no production installation or build step. Node.js is only needed for
development checks and the optional publishing helper.

## Content and development

| File | Purpose |
| --- | --- |
| `site/index.html` | Semantic page, theme bootstrap and original SVG artwork |
| `site/styles.css` | Responsive styling, compact disclosure layout and dark mode |
| `site/app.js` | Interaction and safe text-only rendering |
| `site/lib.js` | Filtering, dates, preference migration and calendar export |
| `site/trip-data.js` | Imported itinerary and booking links, with user-directed daily rescheduling |
| `site/guide-data.js` | Concrete daily plans, official sources, 45 attributed points and shopping bases |
| `site/extras.js` | Per-day alternatives and 31 local culinary recommendations mapped to every place |
| `site/map.js` | Consent-triggered Leaflet loading, numbered markers and explicit tile-error fallback |
| `site/link-audit.js` | Individual external-link verification snapshot and retired search link |
| `site/vendor/leaflet/` | Locally served Leaflet 1.9.4 assets and BSD license |
| `scripts/import-itinerary.py` | Standard-library importer for the original HTML format |
| `scripts/check-links.py` | Bounded HTTPS link checks without bypassing access restrictions |
| `scripts/link-manifest.mjs` | Complete external URL inventory, including generated coordinate links |
| `scripts/publish-link-audit.mjs` | Merge HTTP evidence and optional browser-DOM evidence into the verification data |
| `scripts/publish-pages.mjs` | Non-force GitHub Pages publication of committed `site/` content |

To reimport a copy of the original itinerary:

```sh
python3 scripts/import-itinerary.py /path/to/reiseplan.html site/trip-data.js
```

Reimporting overwrites the manual 5/7 July schedule revision. Preserve or
reapply it deliberately, keeping the guides, alternatives, day metadata
and calendar export consistent.

The importer extracts plain text and HTTPS links rather than executing or
inserting the source HTML. Changes to the import schema may need corresponding
updates to the app. Transition days are assigned to the destination reached
that day. The source contains 30 dates, despite one paragraph calling it
29 days; the interface uses the actual date count.

Saved version-1 preferences are migrated to version 2: favorites, checklist
progress, accommodation choices and theme survive; obsolete budget data is
not retained.

Development checks require Node.js 22 or newer:

```sh
npm ci
npm run check
npm test
npx playwright install chromium
npm run test:browser
```

The browser suite covers interactions, persistence and storage failures,
calendar export, keyboard controls, light/dark
accessibility, responsive layouts, map consent, numbered points, popups, map
failures and shopping bases. It also captures desktop and mobile
previews under the ignored `test-results/previews/` directory.

Culinary tips distinguish an individual restaurant from an explicitly labeled
food area or seasonal stand. Children's suitability is practical guidance,
not a certified allergen-free or guaranteed children's-menu claim. Museum and
theme-park food requires the appropriate admission. Matcha's caffeine, hot
food and sticky mochi have place-specific caveats.

To refresh link evidence, first export the inventory, run the checker, then
**review the actual destination and source identity** before publishing a new
snapshot. An HTTP 200 on a soft-404, wrong attraction or generic homepage is not
evidence of a correct attraction link:

```sh
node scripts/link-manifest.mjs /tmp/japan-links.json
python3 scripts/check-links.py /tmp/japan-links.json /tmp/japan-link-report.json
node scripts/publish-link-audit.mjs /tmp/japan-link-report.json
```

The snapshot generator refuses known soft-404s, HTTPS downgrades and Google
redirects that lose the exact coordinate query. It does not bypass CAPTCHA,
rate limits or access controls, and does not infer bookability from a response.

## GitHub Pages

Pages serves the root of the **`gh-pages`** branch. That branch contains only
`site/`, not development files or dependencies. `.nojekyll` keeps the plain
HTML, CSS, font and ES modules unchanged. Relative paths support the repository
project URL.

To publish a new version, first commit the source changes, then run:

```sh
npm run deploy
```

This requires Git and GitHub CLI, authenticated with write access to this
repository and permission to configure Pages. The helper makes a publishing
commit from the committed `site/` tree, parenting it to the current remote
`gh-pages` commit when present. It does not require the optional Git subtree
extension, switch checkouts, or force-push. It enables Pages for a new site,
but refuses to overwrite a
different existing Pages configuration. GitHub completes the deployment
asynchronously; pushing the source branch alone does not republish the site.

## Artwork and font

All illustrations and icons are original SVG geometry. The design takes broad
inspiration from Japanese festivals and rhythm arcades; it is not affiliated
with Taiko no Tatsujin and uses none of its characters, logos, graphics or
music.

The self-hosted **Lilita One** display font is distributed under the SIL Open
Font License; its license is in `site/assets/OFL-Lilita-One.txt`. Body text uses
locally installed UI fonts. No font requests go to third-party services.

Leaflet is distributed with its BSD 2-Clause license in
`site/vendor/leaflet/LICENSE`. OpenStreetMap data is credited to its contributors
and governed by the [OpenStreetMap copyright and license](https://www.openstreetmap.org/copyright).