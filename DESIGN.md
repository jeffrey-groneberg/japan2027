---
name: "Japan & Vietnam 2027"
description: "A playful, clean Japanese summer-festival travel planner with quiet, compact daily detail."
colors:
  cp-danger: "#dc2626"
  cp-danger-dark: "#f87171"
  cp-accent: "#b11f4b"
  cp-accent-dark: "#fd8ea1"
  cp-accent-hover: "#9a1a41"
  cp-accent-hover-dark: "#fb7b91"
  cp-accent-soft: "rgba(177, 31, 75, 0.08)"
  cp-accent-soft-dark: "rgba(253, 142, 161, 0.14)"
  cp-highlight: "rgba(177, 31, 75, 0.12)"
  cp-highlight-dark: "rgba(253, 142, 161, 0.12)"
  cp-link: "#0078d4"
  cp-link-dark: "#4da6ff"
  cp-warning: "#f59e0b"
  cp-warning-dark: "#fbbf24"
  cp-success: "#16a34a"
  cp-success-dark: "#4ade80"
  cp-bg: "#f7f4ef"
  cp-bg-dark: "#3d3b3a"
  cp-bg-elevated: "#fcfbf8"
  cp-bg-elevated-dark: "#343231"
  cp-surface: "#ffffff"
  cp-surface-dark: "#292929"
  cp-surface-soft: "#f5f5f5"
  cp-surface-soft-dark: "#2e2e2e"
  cp-border: "#dedede"
  cp-border-dark: "#474747"
  cp-border-strong: "#919191"
  cp-border-strong-dark: "#5f5f5f"
  cp-text: "#242424"
  cp-text-dark: "#dedede"
  cp-text-soft: "#6f6f6f"
  cp-text-soft-dark: "#b0b0b0"
  cp-accent-fg: "#ffffff"
  cp-accent-fg-dark: "#1a1a1a"
typography:
  display:
    fontFamily: '"Lilita One", "Hiragino Maru Gothic ProN", sans-serif'
    fontWeight: 400
  headline:
    fontFamily: '"Lilita One", "Hiragino Maru Gothic ProN", sans-serif'
    fontSize: "clamp(1.8rem, 3.2vw, 2.3rem)"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: '"Lilita One", "Hiragino Maru Gothic ProN", sans-serif'
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.2
  body:
    fontFamily: '"Segoe UI", Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-detail:
    fontFamily: '"Segoe UI", Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: ".9rem"
    fontWeight: 400
    lineHeight: 1.85
  label:
    fontFamily: '"Segoe UI", Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize: ".9rem"
    fontWeight: 700
rounded:
  control: "10px"
  disclosure: "12px"
  inset: "14px"
  card: "16px"
  panel: "20px"
  pill: "30px"
  circle: "50%"
spacing:
  small: "8px"
  related: "12px"
  medium: "16px"
  group: "20px"
  inset: "24px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.cp-danger}"
    textColor: "{colors.cp-accent-fg}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "15px 23px"
  button-primary-hover:
    backgroundColor: "{colors.cp-accent}"
    textColor: "{colors.cp-accent-fg}"
  button-secondary:
    backgroundColor: "{colors.cp-surface}"
    textColor: "{colors.cp-text}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  button-secondary-hover:
    backgroundColor: "{colors.cp-bg-elevated}"
    textColor: "{colors.cp-text}"
  button-text:
    textColor: "{colors.cp-accent}"
    padding: "10px 0"
  button-icon:
    backgroundColor: "{colors.cp-surface}"
    textColor: "{colors.cp-text}"
    rounded: "{rounded.circle}"
    padding: "10px"
    height: "44px"
  field-search:
    backgroundColor: "{colors.cp-surface}"
    textColor: "{colors.cp-text}"
    rounded: "{rounded.control}"
    padding: "0 16px"
  navigation-tab:
    textColor: "{colors.cp-text-soft}"
    typography: "{typography.label}"
    padding: "12px 2px 14px"
  navigation-tab-selected:
    textColor: "{colors.cp-text}"
  filter-chip:
    backgroundColor: "{colors.cp-surface}"
    textColor: "{colors.cp-text}"
    rounded: "{rounded.pill}"
    padding: "7px 16px"
  filter-chip-selected:
    backgroundColor: "{colors.cp-text}"
    textColor: "{colors.cp-surface}"
  panel:
    backgroundColor: "{colors.cp-surface}"
    textColor: "{colors.cp-text}"
    rounded: "{rounded.panel}"
    padding: "28px 32px"
  agenda-step:
    backgroundColor: "{colors.cp-bg-elevated}"
    textColor: "{colors.cp-text}"
    rounded: "{rounded.disclosure}"
    padding: "{spacing.medium}"
  place-disclosure:
    textColor: "{colors.cp-text}"
    padding: "16px 0"
---

# Design System: Japan & Vietnam 2027

## Overview

**Creative North Star: "Japanese summer-festival rhythm-arcade"**

“Playful, but clean” is expressed through rounded display lettering, festival red, blue and amber, and original outlined SVG scenery. Fuji, the train, torii, onigiri and suitcase belong to the same flat-vector world. The reference is a Japanese summer festival with a light rhythm-arcade influence, not copied game characters, logos or artwork.

The working interface is deliberately quieter than its illustration. Neutral surfaces, thin dividers, clear labels and compact disclosures make practical detail readable. Expression lives in lettering, drawn geometry and a few purposeful accents; it does not turn every planning row into decorative artwork.

Location detail pairs compact, numbered thumbnails with larger photo postcards on expansion. Licensed archive photographs show real places; clearly labeled original scenes cover missing or seasonally misleading imagery and the family dinner/festival options. This extends the incumbent festival world without changing the hero or introducing another visual system.

**Key Characteristics:**
- Original outlined SVG festival geometry and locally hosted rounded lettering.
- Festival red, blue and amber above quiet, theme-aware neutrals.
- One selected day, labeled task tabs and closed-by-default detail.
- Credited archive photos and explicit illustration labels, with booking/date status visible before expansion.
- Visible keyboard states and responsive desktop-to-phone reflow.

Recorded from the built `site/index.html`, `site/styles.css`, `site/app.js`, `site/map.js`, `site/poi-visuals.js`, `site/poi-photos.js` and `site/assets/poi-illustrations.svg`, with dinner/festival patterns from `site/dining-data.js` and `site/festival-data.js`. The body-opening direction contract retains seed `135a2d75` and now includes licensed location-photo postcards. `PRODUCT.md` supplies confirmed brand constraints; the shipped implementation resolves older surface notes.

## Colors

A warm paper-and-ink base carries festival colors without flooding the planning surfaces. The frontmatter preserves the exact used Clawpilot values, including their authored alpha notation.

### Primary
- **Festival Red** (`cp-danger`): Japan lettering, the primary action, active route numbers, the main-tab underline and checklist progress. This is an expressive role as well as the inherited semantic danger token; red does not automatically mean an error here.

### Secondary
- **Berry Accent / Night Rose** (`cp-accent` and its dark counterpart): ordinary links, text actions, selected lodging borders and numbered map markers.
- **Berry Hover** (`cp-accent-hover`): link and text-action hover.
- **Soft Berry / Selection Wash** (`cp-accent-soft`, `cp-highlight`): saved-filter and correction surfaces, selected route/day backgrounds and touch feedback. Use the supplied alpha colors over the current theme surface.

### Tertiary
- **Festival Blue** (`cp-link`): Vietnam lettering, drawn scenery and keyboard focus. Practical transport surfaces mix this token into the surface; the token's name does not mean all text links are blue.
- **Lantern Amber** (`cp-warning`): festival artwork, the year stamp and saved-star fills, not a general text color.
- **Scene Green** (`cp-success`): the already supplied theme color now appears repeatedly in illustrated foliage and flower stems, sometimes with authored fill opacity. It is not a restaurant-availability or confirmed-festival badge.
- The recurring transport wash is `color-mix(in srgb, var(--cp-link) 7%, var(--cp-surface))`; it is a contextual treatment, not a new palette primitive.

### Neutral
- **Warm Paper / Warm Charcoal** (`cp-bg`): page canvas and the sticky main-tab rail.
- **Raised Paper / Recessed Charcoal** (`cp-bg-elevated`): disclosure rows and secondary-button hover. “Elevated” is the upstream name, not a promise of a shadow.
- **Paper / Deep Charcoal** (`cp-surface`): hero, panels, buttons and map UI.
- **Quiet Map Surface** (`cp-surface-soft`): map consent and unloaded map background.
- **Quiet Divider / Strong Divider** (`cp-border`, `cp-border-strong`): containers, row separation and stronger control boundaries.
- **Ink / Light Ink** (`cp-text`): primary text and SVG outlines.
- **Secondary Ink** (`cp-text-soft`): supporting descriptions, metadata and placeholders.
- **Accent Foreground** (`cp-accent-fg`): foreground on filled festival actions and map markers; it changes with the theme rather than remaining white.

**The Festival Roles Rule.** Component colors reference the existing `--cp-*` variables; festival red, blue and amber keep their built roles instead of becoming a second hard-coded palette.

The un-suffixed frontmatter color keys describe light mode. A `-dark` key records the same CSS custom property under `html[data-theme="dark"]`; it is documentation notation, not a new runtime variable. Component frontmatter shows the light assignment; component snippets remain live-bound to the runtime variables in either theme. The theme toggle uses sun/moon SVGs and a changing action label; a URL theme override, saved choice and system preference are already supported.

There is no authored tonal ladder. Do not synthesize additional production shades or treat the light/dark pairs as a tonal ramp. Unconsumed glass/overlay and shadow variables from the supplied theme contract are not evidence of a visual component. Photograph pixels are image content, not component palette tokens.

## Typography

**Display Font:** Lilita One, locally hosted at `site/assets/lilita-one.ttf`, with the recorded rounded Japanese/sans fallback. The loaded face is OFL-licensed, regular weight, served with `font-display: swap`.

**Body Font:** the recorded Segoe UI / Aptos / Calibri / local UI stack. There is no separate mono or icon font.

**Character:** inflated, friendly display forms establish the festival identity; restrained UI sans handles instructions, controls and dense detail. Size and weight distinguish information without adding decorative kickers.

### Hierarchy
- **Display:** the `display` role records the reusable family and regular weight. The hero's two-line country lettering is its signature composition, not a generic heading preset: its large line reaches the built ceiling of 6rem, with tight leading (.93).
- **Headline:** the `headline` role is the fluid section-heading ramp. Headings use balanced wrapping; the phone panel heading is explicitly set to 1.9rem.
- **Title:** the `title` role is the recurring display subheading. The current-day title has its own larger fluid treatment, with phone and tablet overrides; do not apply the hero scale to it.
- Dining and festival summary names use regular Lilita One at (1.2rem), reducing to (1.1rem) at (760px) and below. Their UI booking/date lines remain subordinate; this contextual pair does not add a new type scale.
- **Body:** the `body` role is the root reading baseline. Detailed paragraphs use the smaller, more open `body-detail` treatment; surrounding functional copy varies by context rather than following an invented modular ratio.
- **Label:** the `label` role captures the shared bold control/navigation voice. Day-local tabs are more compact (.74rem), while action buttons use leading (1.3).
- Agenda and place descriptions repeatedly stop at a readable measure (70ch). Editorial day summaries, hero metadata and station-strip captions are omitted.

**The Display/Detail Rule.** Lilita One gives headings and meaningful route/date numerals their character; the local UI stack carries controls and long practical copy.

Tiny logo lettering, artwork labels and narrow metadata are not a reusable minimum text-size scale.

## Layout

Home is a viewport-budgeted composition: the full-size train and rails receive
their natural height first; the hero fills the remaining area below the actual
masthead/navigation. `visualViewport.height` (or `innerHeight`) and the Home
panel's document offset set `--home-height`, capped at 840px on tall screens.
Safe-area padding remains inside that budget. Short displays reflow the hero
into a compact two-column composition; extremely short landscape screens omit
the masthead and decorative hero illustration in favor of the title, primary
action, global navigation and complete train. No automatic scrolling or train
scaling is used. Resize, font readiness and chrome-height changes recalculate
the budget; other app panels keep their previous behavior.

Home's station strip is now an original Shinkansen composition. Four buttons
form the carriages with blue side bands, wheel pairs and landmark windows;
a separate SVG nose completes the silhouette, with roof, floor and stripe
aligned to the carriage CSS geometry. Narrow views horizontally scroll the
same single-row train; carriages never wrap. The nose faces left without
mirroring text or reversing destination order. Only the scenery uses
scroll/pointer offsets bounded to 20px; the train never shifts on hover.
Rails stay fixed across the
whole scene and wheels do not bounce; only four-pixel SVG sleepers pass in
whole-pixel steps. A 21px pattern and 84px overscan prevent scaling or edge gaps
throughout the one-second cycle; no gradient-position interpolation is used.
Wheel pseudo-elements use border-box sizing and an explicit top edge so their
16px outer diameter never covers the sleeper band.
Each carriage has a 40px-high ink-framed transparent window above its labels.
Carriage backgrounds paint around the opening so the actual single mountain
layer behind the train shows through. There are no cloned window landscapes
or independent window animations; the same scenery continues above the roof.
The scenery and rails are full-bleed, but the carriage viewport retains the
centered 1200px page-width constraint. Latin destination names are paired with
Japanese labels marked `lang="ja"`. Label areas remain uncolored. A curved
arrow outside the first label points at its lower-left corner and moves gently
only while the scene is visible. Any carriage selection permanently dismisses
the arrow through the existing local preference state.
A repeating landscape tile passes slowly toward the right while
rail sleepers pass faster, creating continuous forward travel. Offscreen/hidden states and Reduce Motion
stop all train motion. This is symbolic navigation, not geographic rail routing.

The desktop/tablet tab rail is overflow-free: real rendered tab widths plus
gaps determine how many fit beside “Mehr”. Remaining destinations appear as
standard buttons in its disclosure. Resizing restores inline destinations;
selection in overflow marks “Mehr” and focus follows relocated controls.
Phone navigation remains the full compact sitemap.

Home is now the default eighth main destination and alone contains the banner
and station strip. Shared navigation precedes all panels, so operational panels
start directly below it. On phones the horizontal tab rail is replaced by a
compact sticky menu button and an animated two-column sitemap. The menu closes
on selection, outside click or Escape and restores button focus. Mobile day and
item screens continue to hide global navigation. This supersedes the former
hero-before-every-panel structure.

The shared page container caps at (1200px), centered with desktop side space (32px each). At (800px) and below the side space becomes (20px); at (600px) and below it becomes (16px). The spacing primitives record recurring literals from the stylesheet, not newly implemented CSS variables.

- **Opening composition:** desktop pairs type with a slightly wider SVG column. At the phone breakpoint the composition stacks, and the art remains bounded rather than becoming a decorative page background.
- **Route selection:** four sequential controls share one outlined strip; at (800px) they become two columns. Their numbers communicate actual trip order.
- **Planner:** a sticky top-level tab rail stays at the viewport top and scrolls horizontally when necessary. Its seven panels, in order, are Reiseplan, Flüge & Anfahrt, Unterkünfte, Basen & Einkaufen, Kulinarik, Feste & Feuerwerk and Checkliste. Selecting a main tab adjusts only the rail's horizontal scroll to reveal it; ordinary tab selection does not force a vertical page jump.
- **Day workspace:** the selector/detail grid uses a (300px) sidebar, reduced to (270px) at (1100px) and (230px) at (800px), alongside a flexible detail column. Below (600px), dates become a horizontal, proximity-snapping strip above the detail.
- **Sidebar stickiness:** in the current CSS, sticky day selection at (88px) is scoped to widths of at least (960px) with no reduced-motion preference. The main tab rail is independently sticky.
- **Day-local navigation:** Tagesrouten and Anfahrt & Tickets separate the interactive schedule from general ticket guidance. The two controls stay in one row, including phones. There is no separate alternatives or places/map tab.
- **Parallel route board:** each column is a complete route. Vertical position and block height encode approximate timing and duration. Blue transport blocks name the actual previous and next location; short walks become slim labeled connectors. Dashed pause/free-time blocks prevent unexplained visual gaps. Route headers state what is added and removed, so materially different lanes never appear identical.
- **Festival rhythm signature:** every route receives one of the existing red, blue, amber or green accents, an original double-ring drum badge and matching beat dots on its time track. Activity blocks use a thicker colored lower edge and asymmetric ticket-like radius. Day numbers repeat the double-ring mark in destination colors, while panel headings reuse the four-color rhythm bar. These are equal structural variants, not a special translucent treatment for Route A.
- **Mobile route carousel:** at (600px) and below, the sticky time axis sits beside exactly one full-width lane. Horizontal touch panning and snap behavior are disabled; only the visible (44px) previous/next buttons change routes. The compact status bar names the current route, shows `n von total` and carries its active drum mark.
- **Mobile itinerary navigation:** the day list is the master screen. Selecting a day pushes a `screen=day` URL state and opens a full-width lane screen; the masthead, hero, station strip, main planner tabs, search, filters and day selector leave that state entirely. A compact route switcher with the active drum mark replaces the duplicate in-board lane header, so the timeline begins directly below it. Selecting any lane block pushes a third `screen=item` level containing only that block's description, journey, tickets, map action and food detail behind a “Zur Tagesroute” action; item detail is never appended below the mobile timeline. JavaScript measures `visualViewport.height` and the rendered board top, writes the remaining pixels to `--lane-available-height`, and CSS additionally subtracts the safe-area inset. Safari chrome, rotation and keyboard changes therefore resize the internal board without device-model detection or a fixed header subtraction. The summary and optional festival note remain below the board. “Alle Reisetage”, “Zur Tagesroute” and browser Back restore the prior level and focus. Desktop keeps simultaneous list and inline detail.
- **Progressive browser support:** `visualViewport` falls back to `innerHeight`; JavaScript writes a pixel lane width so container-query units are an enhancement rather than a dependency; `vh` precedes `dvh`; button-driven route changes do not depend on touch gestures or snap support. Chromium and WebKit are first-class automated suites, covering Safari/Brave on iPhone and Chromium-family browsers.
- **Compactness:** the lane board owns its own horizontal and vertical scrolling region, sticky route headers and sticky time axis. Selecting one activity opens its photo, description, official links, map action and food tip below the board. Booking and practical-tip paragraphs share one closed disclosure. Previous/next-day buttons, the day-map icon and favorite control remain in the day header.
- **Evening options:** dinner choices form two equal flexible columns with a (16px) gap; at (760px) and below they become one column. Festival proposals remain a single chronological list with a (12px) gap; their expanded image/copy columns stack at the same breakpoint.
- **Other panels:** flight rows and transport columns simplify to one column on phones; checklist deadlines move below their text. Lodging rows keep radio selection and description together.

Tight related gaps sit inside larger section separation. Panel padding, disclosure padding and the recurring space values are deliberately distinct; this is not an all-elements-on-one-grid system.

The supplied ship handoff measured the default five-point Shibuya card at (937.69px) on desktop and (1136.52px) at a (390px) mobile viewport, within the respective (950px / 1250px) limits. These are compactness evidence, not CSS heights or reusable spacing tokens.

Budget, template/source-reference navigation, print controls and the entire footer are absent from the current UI. Dormant selectors and obsolete sentences in the surface brief do not reinstate those surfaces.

## Elevation & Depth

The authored planner is flat: one-pixel borders and neutral/tonal layering establish grouping instead of card shadows. No custom planner shadow vocabulary is implemented. The supplied `--cp-shadow` value is unused and is not a system elevation token. Vendored Leaflet popup defaults are library behavior, not a reusable planner shadow language.

**The Flat Planner Rule.** Separate planning surfaces with the existing borders and theme-aware fills; do not infer ambient, glass or hard-offset card elevation from unused theme variables or screenshot tiles.

**The No-Tutorial-Copy Rule.** Controls and structure teach the interface. Keep concise action labels, status messages and factual travel/safety copy; remove prose that explains how to click, swipe, expand, read lanes or use maps.

The supplied game screenshots inform only abstract visual traits: original
subtle ring/fan patterns in the banner, ink-outlined route drums and a segmented
festival-color selection rail. No supplied game artwork is embedded.

Motion follows a festival performance hierarchy. The hero is the single authored focal sequence: its scene settles through a (.75s) clipped arrival, then the sun, clouds, train, onigiri friend, suitcase, ticket, spark and beat marks move on quiet, differently timed transform/opacity loops. An `IntersectionObserver` runs those loops only while the illustration is visible; document visibility pauses them in a hidden tab.

The planner uses shorter motion to explain state rather than decorate every surface. Active tabs and panels arrive over roughly (.3s); day drums, destination landmarks, filter stamps, favorites and checklist marks acknowledge selection; route-button changes pulse the active drum and move its label; disclosures, the map dialog and mobile day/item screens reveal their spatial relationship. Routine hover/press feedback remains (.18s) and all state changes use the recorded exponential ease-out.

Reduced motion removes authored animations and transitions, changes smooth scrolling to automatic scrolling and disables Leaflet fade/zoom animation. Content is visible before motion classes are applied, and map focusing itself remains nonanimated.

## Shapes

Gently rounded controls sit inside broader, calm panels. The frontmatter records the recurring control, disclosure, inset, card and panel radii; pill filters and circular number/icon controls are separate shapes, not interchangeable corner settings.

Most boundaries are one-pixel solid dividers. Number badges use stronger outlines; food tips and flight dates use dashed separation in their own contexts. Outline SVG scenery uses rounded joins/caps and a (3px) ink stroke. The authored action-icon system uses a (24px) viewBox, generally rendered at (21px), with a consistent (1.8px) stroke, round joins and round caps. Smaller contextual icons remain SVG.

The hero's scalloped edge, angled stamp and flat-vector silhouettes belong to that illustration vocabulary; they do not prescribe scallops or rotations for every container. New original scenes share a (320 × 180) viewBox, theme-bound fills and ink outlines. Thumbnails and expanded figures use quiet rounded crops, not faux frames, offset shadows or a separate photo theme.

## Components

### Buttons

Confident, readable actions without ornamental depth.

- **Primary:** festival-red fill with theme-specific accent foreground and the recorded control radius/padding. Hover changes the fill/border to the berry accent.
- **Secondary:** surface fill, ink text and a quiet outline. Hover uses the elevated background and stronger border.
- **Text action:** berry, underlined, without a filled container. Text-action hover uses the accent-hover token.
- **Icon action:** outlined surface circle with an SVG and an explicit accessible action name. General icon controls are (44px); the current-day header intentionally uses smaller compact variants.
- **States:** ordinary buttons have a minimum height (46px); hover lifts (1px), active presses (1px), and disabled controls use not-allowed plus opacity (.4). Disabled previous/next controls reflect actual day bounds.
- **Focus:** visible keyboard focus uses a blue outline (3px) with an external offset (4px); clipped rails/disclosures use the implemented inward offsets rather than hiding focus.

### Chips

Compact selectors, not decorative category badges.

- Destination, base, dinner-city and dinner-category filters use the same surface-filled outlined pills; hover strengthens the border.
- A pressed filter inverts ink and surface. Selection is expressed with `aria-pressed`, not color alone.
- Saved filtering uses the soft accent treatment; the saved star fills amber. Counts use tabular numerals.

### Cards / Containers

Quiet work surfaces with an obvious hierarchy.

- The selected-day panel uses the recorded panel primitive, a thin border and no authored shadow. Phone padding tightens to (22px 20px).
- Flight and checklist-progress containers use the smaller card radius; map/transport/lodging areas use the inset radius.
- Repeated agenda items are functional disclosure rows. Do not extrapolate them into generic icon-title-text card scaffolding.

### Inputs / Fields

Native controls with explicit labels and theme-aware boundaries.

- Search uses a surface-filled outlined wrapper, search SVG and a transparent input; focus-within draws the blue outline with an offset (2px). Placeholder text uses secondary ink at full opacity.
- Lodging options are native radios; the checked row gains the accent border, and its associated details open on selection.
- Checklist inputs are native checkboxes with accent coloring. Completed titles are struck through and use secondary ink; progress is a simple red linear native progress bar.
- The dinner panel's labeled “Nur spontan versuchbar” checkbox uses the accent color, an (18px) native input and a (44px) minimum-height label. Its result count is announced as status, not implied by color.
- There is no current budget/numeric-input component to inherit.

### Navigation

Two levels of task navigation, plus direct day selection.

- The seven main tabs use bold UI text, a neutral rail and a red active underline (3px). Inactive text is softened; hover restores ink. The active tab is automatically revealed horizontally without scrolling the page vertically.
- Day-local tabs use an inset page-colored group with rounded controls; the active tab is a bordered surface. They are visually subordinate to the main rail.
- Both tab levels have selected state, controlled panels and roving tab stops. Left/right arrows and Home/End move between tabs; inactive panels are genuinely hidden.
- The selected date uses the highlight wash. Phone date buttons also gain an accent border; the horizontal strip preserves nearby day context.
- Route controls pair meaningful sequential numbers with city names and original SVG landmarks; selection highlights the control and fills its number red.
- “Abendideen in [city]” opens that city's dinner options with category/spontaneous filters reset, scrolls to the planner and focuses Kulinarik. Day-local festival shortcuts open the matching proposal, scroll to it and focus its summary. These deliberate destination jumps are distinct from ordinary tab selection.

### Parallel Day Lanes

Chronology, travel and deliberate downtime are visible; long explanations remain optional.

- Activity blocks carry route-specific labels such as `A1` and compact thumbnails. Transport and pause blocks use mode icons instead of activity numbers. Every rendered block stays inside its exact time slot with visible breathing room; automated desktop/mobile checks reject overlaps and unexplained gaps across all 30 days.
- Selecting an activity renders its category/duration, description, official links, Google Maps target and action to focus the shared day map. Reused places in another lane always focus the canonical map marker.
- Food recommendations remain native disclosures inside the selected POI detail, separated by a dashed rule. Opening one reveals the reason, child-aware advice, practical caveat and links without bloating the lane.
- The Bases & Shopping panel retains its own numbered place disclosures and shared base map.
- Only materially different routes become additional lanes. Pacing-only choices are compact flex notes on the relevant activity.

### Photo Postcards & Original Scenes

Real places are credited; drawings never stand in as photographic evidence.

- Expanded figures fill the available width with a (16:9) crop, a maximum height (230px), a quiet one-pixel border and the disclosure radius (12px). Their margin is (14px 0 18px); thumbnail crops use a smaller radius (8px).
- Images are local Commons files, loaded lazily with asynchronous decoding. The current inventory is (29) place mappings sharing (28) distinct full-image/thumbnail pairs; Pokémon Center SHIBUYA and Nintendo TOKYO share the PARCO exterior, not invented shop-interior photographs.
- A photograph's caption starts “Archivfoto (Ausschnitt)” and gives the actual author, linked source and linked license. Secondary-ink credits wrap long links; the built credit treatment is (.66rem) with leading (1.6), not a new minimum text-size token. Thumbnail images are decorative; expanded photos have descriptive alt text.
- Missing or seasonally misleading candidates use subject-aware original SVG scenes. Expanded illustrations have an accessible image label and a visible “Illustration … keine Ortsaufnahme” caption. Restaurant scenes distinguish fishing, conveyor sushi, Sumo, a view and other themes; the Ninja-house scene communicates hidden architecture without copying a character. Festival scenes show flowers, floats or an original park-show motif, without authored game/film characters.
- On thumbnail failure, an original scene replaces the image and “Bild fehlt” explains the state. An expanded-photo failure switches to a labeled illustration and a status caption explaining that the photo could not load. Credits and independent official/Google links remain available.

### Family Dinner Choices

Optional, practical dinner ideas rather than a second itinerary.

- Kulinarik contains nine family options, only in Tokyo, Kyoto and Osaka. City and category pills combine with the spontaneous-only checkbox. The checkbox includes only entries with explicit walk-in evidence; a recommended reservation does not by itself prove walk-in access or a free table. Day routes may deep-link and focus one exact dining disclosure, as the 10 July Ginza and 18 July Osaka Sumo choices do.
- Native accordion summaries expose the name, city/category and one of “Nur mit Vorbuchung”, “Reservierung empfohlen” or “Spontan versuchbar” before opening. “Auch spontan versuchbar” appears separately when a recommended-reservation entry also has walk-in evidence.
- Surface-filled outlined cards use the existing card radius (16px), summary padding (18px), a (16px) gap and larger scene thumbnails (96 × 72px). At (760px) and below, summary padding becomes (16px), the gap (12px) and thumbnails (80 × 60px).
- Expanded content uses the shared figure/credit treatment, followed by reasons, child-aware advice, booking, location/access caveats and independently usable links. Body padding is (0 22px 22px), tightening to (0 18px 18px) at the same breakpoint.
- Empty combinations honestly state that no matching spontaneous tip is confirmed. “Alle Buchungsarten anzeigen” resets category and spontaneous filtering while retaining the city; it never promises availability.

### Festival Proposals

Chronological invitations with visible uncertainty, not confirmed bookings.

- Feste & Feuerwerk contains five optional proposal rows. Each closed summary already shows the proposed date, city, display title and “Jahrestermin · Programm 2027 noch prüfen” or “Abendprogramm für diesen Tag noch unbestätigt”. None of the current rows asserts a confirmed 2027 schedule.
- Rows reuse the surface fill, quiet border and card radius (16px), with (64 × 44px) original-scene thumbnails. Summary padding is (18px 22px) with an (18px) gap; at (760px) and below it becomes (16px) with a (12px) gap. Native disclosure groups and rotating SVG chevrons match the dinner/agenda behavior.
- Expanded bodies pair the shared illustration figure with practical copy in columns `minmax(220px, .8fr) minmax(0, 1.2fr)`, with a (26px) gap and padding (0 26px 26px). At (760px) and below they stack with no column gap and padding (0 18px 18px).
- Detail keeps annual rules distinct from date-specific announcements and includes child-aware crowd, heat, exit and travel guidance. Options replace or shorten other activities rather than silently extending a full day or changing the fixed stays/park day.
- A separate closed disclosure explains why Sumida and Tenjin fireworks fall outside the stays. It is context, not two additional reachable proposals; official-programme and coordinate-based Google links remain independent.

### Maps & Feedback

An optional geographic aid, never the only access to a place.

- A neutral consent placeholder precedes external map tiles. “OpenStreetMap-Karte laden”, the day-header map icon, “Auf Tageskarte zeigen” and the base's “Auf Karte zeigen” are explicit map actions; permission is then remembered for the current page session.
- Vendored Leaflet supplies real controls and attribution. Accent-filled numbered markers have surface-colored borders and matching accessible lane numbers; popups use safe DOM content, not imported HTML. Same-building points share one marker labeled with their chronology (for example, `A2·A3`) and a popup containing each place, instead of overlapping markers. Each place keeps its own unchanged coordinate-based Google target.
- The complete day map opens as a true modal with backdrop, sticky header and explicit X close control. Opening it from the header restores the complete extent; opening it from a POI focuses that point. Popup actions close the modal and focus the matching lane block. No computed walking/transit route is implied.
- Base maps remain (320px) high on desktop and (280px) on phones. Theme-aware controls, popup surfaces and attribution remain readable above third-party tiles.
- Loading disables and relabels the load button. Failures explain retry or continued use of the independent place list/Google Maps links; status text remains visible.
- Empty filtered days offer a reset action. Storage failure explains that changes may last only for the session. Status announcements and the skip link support keyboard/screen-reader use.
- Neutral map tiles in automated screenshots are local fixtures, not production illustration or a palette source.

## Do's and Don'ts

### Do:
- **Do** use the exact existing `--cp-*` variables and their light/dark assignments for every component color.
- **Do** pair locally hosted Lilita One headings with the recorded local UI body stack.
- **Do** keep the selected-day overview compact, with complete route lanes, explicit travel and selected place/food detail behind the two labeled day-local tabs.
- **Do** use original, consistent SVG icons and scenery; preserve visible focus, meaningful state and reduced-motion behavior.
- **Do** credit local archive photos with author, source, license and crop wording; explicitly label original illustrations and explain image failures without hiding independent links.
- **Do** expose booking requirements and unconfirmed festival dates before expansion, keeping family evening choices optional.
- **Do** keep map consent, attribution, recoverable loading states and independent place links visible where relevant.

### Don't:
- **Don't** copy game or film characters, logos, artwork or music into authored UI assets to strengthen the festival reference.
- **Don't** replace the primary display face with an installed system display font or use emoji/glyphs as the icon system.
- **Don't** add invented kickers, hard-offset card shadows or a synthetic color palette as inherited house style.
- **Don't** restore removed budget, template/source-reference, print or footer UI on the authority of dormant selectors or stale notes.
- **Don't** treat automated map fixture tiles, unused theme effects or tiny one-off artwork lettering as reusable design tokens.
- **Don't** present an illustration as a location photograph, a walk-in policy as guaranteed availability or an annual festival rule as a confirmed 2027 programme.
