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
desktop, four-stop route selector, then a task-oriented five-tab planner.
Mobile stacks the hero, groups route stops two by two and presents dates as a
horizontal scroll strip. The budget total precedes the inputs on mobile.

Interaction: Destination and text filters compose. Day details include the
complete source activity and transport strings. Favorites, checklist progress,
lodging choices persist only in the current browser.
All 30 days export as all-day calendar events.
Each day now has a concrete, editorially proposed sequence, practical ticket
instructions and individually described places with official source links.
The user's later compactness request is binding: four day-local tabs separate
agenda, places/map, transport/tickets and alternatives. Agenda steps are
visibly separated, numbered disclosure rows, closed by default with their
complete descriptions a click away. Place descriptions also collapse.
Previous/next-day navigation stays in the day header. Nothing is removed from
calendar exports. Automated checks bound the default Shibuya day-card
height below 950px desktop and 1250px at 390px mobile.
Forty-five attributed sightseeing and shopping points have matching
coordinate-based Google Maps links and optional interactive OpenStreetMap
background maps. A separate Bases & Shopping panel covers groceries and
leisure shopping for all four bases. Never imply that the exact Tokyo private
apartment address is known.

Ingredient inventory: Page and controls use semantic HTML/CSS. Masthead mark,
landmarks, train, rice character, suitcase and icon system are original flat
SVG with exact countable geometry. The display face is locally hosted Lilita
One under OFL; the body uses the Clawpilot-compatible local UI stack. Content
uses safe DOM text nodes, never source HTML. Leaflet is vendored locally; map
popups also use safe DOM nodes, not imported HTML. Numbered markers correspond
to an accessible place list. Map errors preserve independent point links.

Constraints: No game assets, game music, fake booking confirmations, invented
prices, analytics or remote storage. External map tiles load only after an
explicit map action; their privacy consequence and OSM attribution are visible.
Label source estimates as
October 2026 planning data. Publishing on GitHub Pages makes the itinerary
public. Selection of a different lodging does not recalculate source transit.
All 165 current external URL targets were requested individually on
19 October 2026. The thirteen originally fetch-restricted pages were then
verified by loaded DOM in visible browser canvases, as the user requested.
One additional fetch-blocked Disney restaurant page was also DOM-verified.
The obsolete lastminute search was opened too and confirms the selected
flight is no longer available; the plan no longer claims it as confirmed.
Visible corrections cover Ueno's regular Monday closure, Nintendo Museum's
no-taxi arrival rule and the actual Tam Tien resort location / Hoi An transfer.
The latest user decision removes all template references, historical-source
UI, budget functionality, print feature, metadata/disclaimer footer and the
entire footer. This supersedes earlier surface notes about source/print.
Keep only the immediately relevant map consent and OSM attribution.
Every day now includes optional alternatives, shown in the local Alternatives
tab rather than appending a long default column. Every one of the45 places
has one of31 local food recommendations, including why it is worthwhile,
child-aware options/caveats, practical access restrictions, official links
and named Google Maps searches. Food recommendations live inside the matching
place disclosure with a direct shortcut from the day plan.
