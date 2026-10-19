# Japan & Vietnam 2027

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Plain HTML, CSS and JavaScript, explicitly selected by the user. The published
site must not require a framework, a server, an account or a build step.

## Product purpose

Turn the supplied German travel itinerary into a usable interactive travel
planner, published on GitHub Pages.

## Users

The people planning and taking the trip described in the supplied itinerary.

## Capabilities and constraints

- Preserve the source itinerary's dates, destinations, daily activities,
  transport instructions, accommodation alternatives, booking links, budget
  estimates and booking deadlines.
- Later user-directed simplification removes all budget UI, references to the
  input template, the historical-source tab, the print feature and the entire
  footer from the user-facing site. This overrides the initial presentation
  scope; factual source data may remain internally for provenance.
- The source includes Vietnam as well as Japan; retain both countries.
- Keep the itinerary in German.
- Distinguish source estimates and suggestions from confirmed bookings or
  independently verified travel information.
- Personal selections and checklist progress belong to the current browser;
  there is no shared account or remote storage.
- GitHub Pages is a public publishing target, not a private travel vault.
- The user requested concrete daily sequences, official information links,
  plain-language explanations of JR, rail operators and where to buy tickets.
- Show individual sightseeing and shopping locations on OpenStreetMap, with
  matching coordinate-based Google Maps links.
- Include both grocery / everyday shopping and souvenir / leisure shopping
  around the planned bases. Do not invent the private Tokyo apartment address.
- Check every external link individually and disclose access restrictions
  rather than presenting a blocked booking page as verified.
- The user requested visually distinct daily points with less scrolling.
  Keep an immediately scannable day overview, with full detail, maps and
  transport in clearly labeled on-demand areas rather than one long column.
- Map tiles may contact OpenStreetMap only after an explicit map-loading action.
- Every day needs optional alternatives, without expanding the default view.
- The user explicitly chose a culinary recommendation for every individual
  sightseeing place or district, not only one per city. Explain what makes it
  worthwhile, what may suit children, practical access restrictions and links.
- Previously fetch-blocked published links must be checked in a visible
  browser canvas and its loaded DOM, not declared unavailable from fetch alone.

## Brand commitments

The user requested styling inspired by the game Taiko no Tatsujin. Use an
original Japanese rhythm-arcade visual language, without copying game
characters, logos, artwork, music or other proprietary assets.
The user clarified: Japanese-based, playful, but clean. Original SVG artwork
is an explicitly permitted asset medium.

## Evidence on hand

The uploaded `reiseplan.html` is the content authority. It is a planning document
dated October 2026, not proof of current prices, availability or opening hours.
