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
- Compare complete daily routes side by side on a shared time axis. Activity
  height reflects approximate duration; named train, metro, bus, taxi, flight
  and walking blocks start from the actual preceding stop. Meals, recovery and
  deliberate free time are visible instead of looking like missing plan data.
- On phones, the time axis stays fixed beside exactly one route. Horizontal
  touch panning is disabled; the visible previous/next buttons are the only
  way to change lanes.
- The mobile itinerary uses a list/detail flow: the Reiseplan tab first shows
  search, filters and the compact day list. Selecting a day opens a dedicated
  full-width day screen with an “Alle Reisetage” back action. Browser Back and
  direct day links preserve the same navigation model. That detail screen hides
  the global masthead, hero, station strip and planner tabs; its compact route
  switcher replaces the duplicate lane header so the timeline receives the
  remaining live Visual Viewport. Safari chrome, rotation and safe-area changes
  are reflected without device-model detection. Selecting a lane item opens a
  third, history-backed item screen with a “Zur Tagesroute” action.
- The planner carries the original festival/rhythm identity beyond the hero:
  route drums, four festival lane colors, beat dots, ticket-like activity
  blocks and destination-colored day marks replace a spreadsheet-like surface.
- The original banner scene is animated as a small festival performance:
  clouds drift, the train travels, the onigiri friend and suitcase move, and
  rhythm marks pulse. Across the planner, short transitions acknowledge tabs,
  filters, selected days, routes, disclosures, favorites and mobile screens.
  Banner loops pause when offscreen or when the tab is hidden; Reduce Motion
  disables every authored animation.
- Hero metadata, station captions and editorial day summaries are omitted.
  Original ring patterns and stronger route outlines reference the supplied
  game screenshots without embedding their sprites, logos or characters.
- Select a numbered stop to open descriptions, official links, Google Maps and
  culinary advice inline on desktop or on its own mobile detail screen.
  Compact photo thumbnails and larger, credited local photos make places
  recognizable; original Japanese-style illustrations fill clearly labeled
  gaps rather than pretending to be photographs.
  A map-pin icon opens the complete day map in a modal with a clear close
  action, matching route numbers and point-to-map / popup-to-point navigation.
  Two day-local tabs separate the route board from general ticket guidance;
  previous/next-day controls stay at the top.
- Explore 48 sightseeing and shopping points with official information,
  individual Google Maps links and an interactive OpenStreetMap view.
- Find supermarkets, everyday shopping and souvenir / gaming destinations for
  each planned base, without inventing a private apartment's exact address.
- Browse ten Japan accommodation options and retain a personal selection.
  Bedroom-category problems found during the browser check are called out.
- Materially different plans receive their own full route lane. Pacing-only
  choices appear as flex notes instead of duplicate lanes. Every mapped place
  retains a nearby culinary recommendation with child-aware access rules.
- Vietnam contains only the three chosen excursions (Hoi An, Marble Mountains
  and Ba Na Hills); all other resort days are intentionally simple hotel,
  pool and beach days without invented replacement outings.
- Open the general **Kulinarik** section for nine family-oriented dinner
  ideas in Tokyo, Kyoto and Osaka, including interactive meals and skyline
  buffets. City/category filters compose with an evidence-based
  “Nur spontan versuchbar” filter; reservation-only cafés are excluded from it.
- Find five optional festival/show proposals in **Feste & Feuerwerk** and
  through links on the matching dates. Traditional dates are explicitly
  unconfirmed for 2027, never presented as purchased tickets or guaranteed shows.
- Track eight booking tasks, including optional Ghibli reservations, and
  export the detailed days as an `.ics` calendar.
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

On **20 October 2026**, all **259 distinct published external URL targets** were
checked individually, including **48 coordinate-based sightseeing Google Maps
links**, **33 per-place culinary map searches**, the separate dinner/festival
targets, and every displayed photo-source/license link. HTTP responses, redirects,
source identity and map queries were reviewed. The original thirteen
fetch-restricted pages were then opened in visible browser canvases and
their loaded DOM inspected: all nine Expedia properties, both Booking.com
properties, JR East's Suica page and DisneySea. DisneySea's restaurant page
was also verified in the browser after fetch timed out. The newly added
Kansai Airports route announcement was DOM-verified after a blocked fetch.
The DisneySea evening-show page was also DOM-verified after a timeout.
Loaded browser FAQ answers resolved previously incomplete evidence for
Pokémon Café, SKY BUFFET 51 and Kyoto Ramen Koji; absence of a reservation
button alone was not treated as proof of a walk-in policy.

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
comes first; Asakusa afterward is optional. At the user's explicit choice,
**DisneySea moves to Friday, 9 July**, after four full days of adjustment.
teamLab/Odaiba moves to Tuesday, 6 July; Miraikan is not proposed that day
because of its regular Tuesday closure.
The plan warns that an existing Shibuya Sky ticket would need changing,
not silently transferring dates.
The same caveat applies to existing DisneySea/teamLab tickets.

UZUMASA Kyoto Village is an explicit **alternative instead of Nara on
13 July**, not another stop after Nara. The park entry and paid Ninja Escape
Room / 3D Ninja Fort are separate products. The alternative records the
hidden mechanisms/passages, physical maze restrictions, transit via Uzumasa
Tenjingawa, child-aware food break and official calendar/ticket sources.

HIRAKUZA is included in **Tokyo and Osaka** as entertainment Sumo, not a claim
of professional tournament attendance. The 10 July Tokyo route replaces
Akihabara with a two-hour English show and formal Kaiseki in Ginza; the 18 July
Osaka route keeps the more casual Bento version after Den Den Town. Both have
child rates and child meals. The planner explicitly recommends choosing only
one location and keeps each venue's separate booking rules and official links.

Ghibli Museum is a **reserved-ticket alternative** to Mount Takao on 8 July,
not an additional excursion or spontaneously available rainy-day substitute.
The current rule would put July ticket sales on 10 June at 10:00 JST /
03:00 CEST; the relevant 2027 calendar and sales policy still need checking.
Its entry contains transport, age-limited Cat Bus guidance and Straw Hat Café
access restrictions. Pokémon Center SHIBUYA joins Nintendo TOKYO on 5 July;
they share a building marker while retaining distinct verified Google targets.

The festival proposals are Iriya's morning-glory market (7 July), the
potential DisneySea harbour show (9 July), Senso-ji's Hozuki market
(10 July), a short Gion lantern/float evening (14 July), and the Gion parade
as an **alternative instead of Minoh** from Osaka (17 July). No specific
2027 edition/show has been confirmed. Senso-ji replaces part of the busy
shopping/packing day; Iriya does not become a third mandatory excursion
after the zoo and Asakusa. Sumida and Tenjin fireworks are explained as
normally outside the respective city stays, not falsely assigned to them.

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
| `site/guide-data.js` | Concrete daily plans, official sources, 48 attributed points and shopping bases |
| `site/extras.js` | Per-day alternatives and 33 local culinary recommendations mapped to every place |
| `site/dining-data.js` | Eight family dinner highlights, explicit booking/access rules and operator evidence |
| `site/festival-data.js` | Five date-qualified festival/show proposals and out-of-window fireworks context |
| `site/poi-photos.js` | Local photo paths, Commons source, author and license for each adopted photograph |
| `site/poi-visuals.js` | Shared photo/illustration treatment, attribution and explicit image-error states |
| `site/assets/poi/` | Locally served, size-bounded real photos and small thumbnails |
| `site/assets/poi-illustrations.svg` | Original theme-aware scenes; no copied game/film character graphics |
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

Reimporting overwrites the manual 5/7 July and 6/9 July revisions, Pokémon
addition and optional Ghibli checklist item. Preserve or reapply them
deliberately, keeping guides, alternatives, day metadata, festival placements
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
npx playwright install chromium webkit
npm run test:browser
npm run test:browser:webkit
```

The browser suites cover Chromium plus WebKit (Safari and iPhone browsers such
as Brave). Firefox-compatible fallbacks avoid relying on Visual Viewport,
container units or dynamic viewport units alone; Gecko can additionally be run
with `npx playwright test --browser=firefox` on hosts supported by the bundled
Firefox runner. The suite covers interactions, persistence and storage failures,
calendar export, keyboard controls, light/dark
accessibility, responsive layouts, map consent, numbered points, popups, map
failures and shopping bases. It also captures desktop and mobile
previews under the ignored `test-results/previews/` directory.

Interface copy stays terse: controls, statuses and factual travel/safety
information remain; tutorial prose explaining how to operate lanes, maps or
filters is intentionally omitted.

Culinary tips distinguish an individual restaurant from an explicitly labeled
food area or seasonal stand. Children's suitability is practical guidance,
not a certified allergen-free or guaranteed children's-menu claim. Museum and
theme-park food requires the appropriate admission. Matcha's caffeine, hot
food and sticky mochi have place-specific caveats. General dinner highlights
are not all spontaneous: operator-confirmed walk-ins are distinct from our
recommendation to reserve and from a mandatory reservation.

The 29 per-place photo mappings use Wikimedia Commons images with verified
CC0 / CC BY / CC BY-SA metadata, downloaded as local large/thumbnail variants.
Two places in PARCO deliberately share the same building exterior photo;
it does not imply a photograph of either shop's interior. Visible figure
captions identify archive photos, attribution, source, license and cropping.
Images whose candidates showed cherry blossoms, Halloween or winter were
rejected in favor of original, clearly labeled illustrations. Image loading
errors are surfaced without breaking the itinerary or its independent links.

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
project URL. GitHub Pages caches assets for ten minutes, so `site/index.html`
uses one shared `?v=` value for `styles.css` and `app.js`; update that value
whenever either core asset changes.

Home (`#view=home`, also the default URL) owns the animated banner and station
overview. The other seven panels omit both and begin below the shared menu.
Its destination selector is an original Shinkansen-style train: four clickable
carriages, window illustrations, wheels, rails and a decorative mountain layer.
Small scroll/pointer parallax offsets move only the landscape; the train and
its clickable carriages remain fixed, including on hover. The nose
faces left and the labels retain their normal reading order. Rails span the
full scene with no transform or wheel bounce; only the sleepers move in
whole-pixel steps toward the right, matching leftward travel. The sleepers are
fixed-width SVG rectangles, not a shifting CSS gradient, with overscan at both edges.
Each carriage has a transparent panoramic window: the same single mountain
landscape is visible behind the train and through all windows, with no
separate miniature scenes or independent window animation.
Seamlessly passing scenery and faster-moving sleepers create continuous
forward travel without moving the clickable carriages. The train never wraps:
small screens scroll the single row horizontally, including its nose.
All motion stops offscreen, in background tabs or with Reduce Motion. The train
is a visual trip selector, not a claim of rail service to Vietnam.
When the desktop/tablet menu cannot fit, measured overflow destinations move
into “Mehr” instead of creating a horizontal scrollbar. They return as space
becomes available; an active overflow destination marks the “Mehr” button.
On phones, the compact menu button opens an animated two-column sitemap;
Escape, selection or an outside click closes it. Existing day/item deep links
still open the focused mobile detail screens.

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