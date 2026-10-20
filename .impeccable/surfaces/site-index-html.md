---
version: 1
slug: "site-index-html"
primary_target: "site/index.html"
related_targets: ["site/styles.css","site/app.js","site/guide-data.js","site/map.js","site/extras.js"]
---

Mode: Operate.

Scope: site/index.html, site/styles.css and site/app.js.

Job: Help the traveler find one useful day and its practical transport details
quickly, then manage optional personal planning state.

Confirmed decisions: The user selected plain HTML/CSS/JavaScript and asked for
Japanese-based, playful but clean styling, lightly inspired by Taiko no
Tatsujin. The user explicitly permitted original SVGs. The uploaded German
itinerary is the factual authority, including the Vietnam section.

Direction: Original Japanese summer-festival rhythm-arcade. Oversized red Japan
lettering, blue Vietnam lettering, one original flat-vector Fuji/train/torii/
onigiri scene, four sequential city controls and quiet planning panels.
The pinned brief overrides the direction roll (seed 135a2d75). No raster image
generation or raster comp is used; the exact geometry is authored as SVG.

First viewport: compact masthead, two-column type-and-illustration hero on
desktop, four-stop route selector, then a task-oriented seven-tab planner.
Mobile stacks the hero, groups route stops two by two and presents dates as a
horizontal scroll strip. No budget feature remains.

Interaction: Destination and text filters compose. Day details include the
complete source activity and transport strings. Favorites, checklist progress,
lodging choices persist only in the current browser.
All 30 days export as all-day calendar events.
Each day now has a concrete, editorially proposed sequence, practical ticket
instructions and individually described places with official source links.
The user's later compactness request is binding: three day-local tabs separate
agenda, transport/tickets and alternatives. Every concrete POI has its own
numbered disclosure row, closed by default, with descriptions, official links,
Google Maps and a nested culinary tip directly inside it. Non-place pauses
remain their own chronological rows.
One closed disclosure above the agenda holds the complete day map, at least
340px high, with all planned stops and numbers matching the agenda. POI actions
focus its marker; popup actions open the corresponding POI. An all-stops
control restores the complete map extent. There is no separate places/map tab.
Previous/next-day navigation stays in the day header. Nothing is removed from
calendar exports. Automated checks bound the default Shibuya day-card
height below 950px desktop and 1250px at 390px mobile.
Forty-eight attributed sightseeing and shopping points have matching
coordinate-based Google Maps links and optional interactive OpenStreetMap
background maps. A separate Bases & Shopping panel covers groceries and
leisure shopping for all four bases. Never imply that the exact Tokyo private
apartment address is known.

Ingredient inventory: Page and controls use semantic HTML/CSS. Masthead mark,
landmarks, train, rice character, suitcase and icon system are original flat
SVG with exact countable geometry. The display face is locally hosted Lilita
One under OFL; the body uses the Clawpilot-compatible local UI stack. Content
uses safe DOM text nodes, never source HTML. Leaflet is vendored locally; map
popups also use safe DOM nodes, not imported HTML. Numbered day markers correspond
to accessible inline agenda points; base maps retain their own place lists.
Map errors preserve independent point links.

Constraints: No game assets, game music, fake booking confirmations, invented
prices, analytics or remote storage. External map tiles load only after an
explicit map action; their privacy consequence and OSM attribution are visible.
Label source estimates as
October 2026 planning data. Publishing on GitHub Pages makes the itinerary
public. Selection of a different lodging does not recalculate source transit.
All 253 current external URL targets were checked individually on
19 October 2026. The thirteen originally fetch-restricted pages were then
verified by loaded DOM in visible browser canvases, as the user requested.
One additional fetch-blocked Disney restaurant page was also DOM-verified.
The obsolete lastminute search was opened too and confirms the selected
flight offer is no longer available; the plan does not claim it as confirmed.
The official Kansai Airports route announcement was DOM-verified too: the
VietJet route is announced from 20 December 2026, not confirmed for the exact
July 2027 travel date.
Exact-date SAKURA and Olfea room checks retain their category-specific bedroom
caveats, including SAKURA's contradictory suite title/detail.
The zoo is now the main visit on Wednesday 7 July; Shibuya/Harajuku moves to
Monday 5 July. Existing Shibuya Sky tickets need a deliberate date change.
Visible corrections cover Ueno's regular Monday closure, Nintendo Museum's
no-taxi arrival rule and the actual Tam Tien resort location / Hoi An transfer.
The latest user decision removes all template references, historical-source
UI, budget functionality, print feature, metadata/disclaimer footer and the
entire footer. This supersedes earlier surface notes about source/print.
Keep only the immediately relevant map consent and OSM attribution.
Materially different plans now appear as complete parallel route lanes on a
shared approximate time axis. Named train, metro, bus, taxi, flight and walking
blocks start from the actual preceding stop; pauses and deliberate free time
fill the day rather than reading as missing data. Pacing-only choices remain
compact flex notes instead of duplicate lanes. On phones, only one lane is
visible beside the sticky time axis. Horizontal touch panning is disabled;
the current-route counter and previous/next buttons are the only route switch.
The mobile Reiseplan itself is master/detail: tools and the compact day list
form the first screen, while selecting a date opens a dedicated full-width day
screen with an “Alle Reisetage” action and browser-history support. The
masthead, hero, station strip and global planner tabs leave that detail state.
A compact route switcher with the active drum mark replaces the duplicate
in-board lane header, and the timeline uses the remaining live Visual Viewport,
rendered board top and safe-area inset rather than a fixed device size; summary
and festival context move below it. Selecting a lane block opens a third,
history-backed item screen with “Zur Tagesroute”; its details are not appended
below the mobile lane. Desktop retains
the side-by-side selector and detail. The day map is opened from a
single icon in the day header and appears in a closable modal. Every one of the 48 places
has one of 33 local food recommendations, including why it is worthwhile,
child-aware options/caveats, practical access restrictions, official links
and named Google Maps searches. Food recommendations live as nested
disclosures inside the selected lane detail.

The work surface now carries the hero's festival/rhythm character: destination-
colored double-ring day marks, four equally structured route drum badges,
matching beat-dot tracks, ticket-like activity blocks and four-color heading
bars. No copied game characters or assets are used. Tutorial UI prose is
removed; controls and structure carry interaction, while factual travel,
booking, safety and child guidance remains.

Motion carries the same hierarchy. The original hero scene has one authored
arrival followed by quiet sun/cloud/train/onigiri/suitcase/ticket/rhythm loops
that run only while the illustration is visible. Planner motion is shorter and
functional: tabs, panels, day drums, filters, favorites, route buttons,
disclosures, the map dialog and mobile day/item screens acknowledge their state
or spatial relationship. Reduced Motion removes all authored movement.

Browser behavior is progressively enhanced: live Visual Viewport sizing falls
back to `innerHeight`, JavaScript supplies pixel lane widths when container
units are unavailable, and `vh` fallbacks precede `dvh`. Chromium and WebKit
are automated, with standards-based Gecko fallbacks retained.

Vietnam is intentionally quieter: only Hoi An, Marble Mountains and Ba Na
Hills remain external excursions. All other resort days are simple hotel,
pool and beach days without optional substitute outings.

Current local expansion: compact POI photo thumbnails and larger credited
archive photos inside the opened point. Twenty-nine place mappings use local
licensed Commons photos; original theme-aware illustrations cover missing or
seasonally misleading candidates and are explicitly labeled. The photo
credit/error state and independent links stay available. No copied game or
film character illustration is authored.

Kulinarik is its own main panel: family evening meals in Tokyo, Kyoto and Osaka,
filterable by city, experience/view/casual category and verified walk-in access.
Mandatory booking and our recommendation to book are not the same state.
A per-day dinner shortcut opens the selected Japanese city; the main tab rail
reveals the active tab horizontally without forcing a vertical page jump.
The panel now contains nine options. HIRAKUZA Tokyo and Osaka share the
dedicated Sumo scene but keep separate official links, menus and reservation
rules. Tokyo is a formal Kaiseki route replacing Akihabara on 10 July; Osaka
is the more casual Bento route on 18 July. Both state that they are English
entertainment shows rather than official Grand Sumo, and the family should
choose one location.

UZUMASA Kyoto Village is an alternative replacing Nara on 13 July. Its
dedicated ninja illustration, direct official links, exact map point, park-food
advice, separate attraction-ticket rules and physical maze restrictions sit
inside the expanded alternative; the two distant day trips are never stacked.

Feste & Feuerwerk holds five optional, date-qualified proposals, also linked
from their relevant days. None has an explicitly confirmed 2027 programme.
The 17 July Gion parade replaces Minoh if chosen; Iriya and Hozuki replace or
shorten other optional blocks. No fireworks outside the city stay are inserted.

Later user choice moves DisneySea to Friday 9 July, after four full adjustment
days, and teamLab/Odaiba to Tuesday 6 July without the closed Miraikan stop.
Ghibli is a reserved-ticket alternative to Takao on 8 July, with a booking
checklist item and its own transport/cafe information. The official Pokémon
Center joins Nintendo TOKYO on 5 July; same-building map markers group their
numbers without losing the separate Google destination links.
