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

**Key Characteristics:**
- Original outlined SVG festival geometry and locally hosted rounded lettering.
- Festival red, blue and amber above quiet, theme-aware neutrals.
- One selected day, labeled task tabs and closed-by-default detail.
- Visible keyboard states and responsive desktop-to-phone reflow.

Recorded from the built `site/index.html`, `site/styles.css`, `site/app.js` and `site/map.js`, including the body-opening direction contract (seed `135a2d75`). `PRODUCT.md` supplies confirmed brand constraints; the rendered implementation resolves older surface notes.

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

There is no authored tonal ladder. Do not synthesize additional production shades or treat the light/dark pairs as a tonal ramp. Unconsumed success, glass/overlay and shadow variables from the supplied theme contract are not evidence of a visual component.

## Typography

**Display Font:** Lilita One, locally hosted at `site/assets/lilita-one.ttf`, with the recorded rounded Japanese/sans fallback. The loaded face is OFL-licensed, regular weight, served with `font-display: swap`.

**Body Font:** the recorded Segoe UI / Aptos / Calibri / local UI stack. There is no separate mono or icon font.

**Character:** inflated, friendly display forms establish the festival identity; restrained UI sans handles instructions, controls and dense detail. Size and weight distinguish information without adding decorative kickers.

### Hierarchy
- **Display:** the `display` role records the reusable family and regular weight. The hero's two-line country lettering is its signature composition, not a generic heading preset: its large line reaches the built ceiling of 6rem, with tight leading (.93).
- **Headline:** the `headline` role is the fluid section-heading ramp. Headings use balanced wrapping; the phone panel heading is explicitly set to 1.9rem.
- **Title:** the `title` role is the recurring display subheading. The current-day title has its own larger fluid treatment, with phone and tablet overrides; do not apply the hero scale to it.
- **Body:** the `body` role is the root reading baseline. Detailed paragraphs use the smaller, more open `body-detail` treatment; surrounding functional copy varies by context rather than following an invented modular ratio.
- **Label:** the `label` role captures the shared bold control/navigation voice. Day-local tabs are more compact (.74rem), while action buttons use leading (1.3).
- Agenda and place descriptions repeatedly stop at a readable measure (70ch); the day summary is tighter (65ch). These are content limits, not fixed-width columns.

**The Display/Detail Rule.** Lilita One gives headings and meaningful route/date numerals their character; the local UI stack carries controls and long practical copy.

Tiny logo lettering, artwork labels and narrow metadata are not a reusable minimum text-size scale.

## Layout

The shared page container caps at (1200px), centered with desktop side space (32px each). At (800px) and below the side space becomes (20px); at (600px) and below it becomes (16px). The spacing primitives record recurring literals from the stylesheet, not newly implemented CSS variables.

- **Opening composition:** desktop pairs type with a slightly wider SVG column. At the phone breakpoint the composition stacks, and the art remains bounded rather than becoming a decorative page background.
- **Route selection:** four sequential controls share one outlined strip; at (800px) they become two columns. Their numbers communicate actual trip order.
- **Planner:** a sticky top-level tab rail stays at the viewport top and scrolls horizontally when necessary. It contains exactly five current panels: Reiseplan, Flüge & Anfahrt, Unterkünfte, Basen & Einkaufen and Checkliste.
- **Day workspace:** the selector/detail grid uses a (300px) sidebar, reduced to (270px) at (1100px) and (230px) at (800px), alongside a flexible detail column. Below (600px), dates become a horizontal, proximity-snapping strip above the detail.
- **Sidebar stickiness:** in the current CSS, sticky day selection at (88px) is scoped to widths of at least (960px) with no reduced-motion preference. The main tab rail is independently sticky.
- **Day-local navigation:** Tagesablauf, Orte & Karte, Anfahrt & Tickets and Alternativen separate tasks. The four controls form one row on desktop and a two-by-two group on phones.
- **Compactness:** show the day summary and numbered agenda headings first. Native agenda and place disclosures start closed. Previous/next-day buttons and the favorite control remain in the day header, not at the end of a long detail column.
- **Other panels:** flight rows and transport columns simplify to one column on phones; checklist deadlines move below their text. Lodging rows keep radio selection and description together.

Tight related gaps sit inside larger section separation. Panel padding, disclosure padding and the recurring space values are deliberately distinct; this is not an all-elements-on-one-grid system.

Budget, template/source-reference navigation, print controls and the entire footer are absent from the current UI. Dormant selectors and obsolete sentences in the surface brief do not reinstate those surfaces.

## Elevation & Depth

The authored planner is flat: one-pixel borders and neutral/tonal layering establish grouping instead of card shadows. No custom planner shadow vocabulary is implemented. The supplied `--cp-shadow` value is unused and is not a system elevation token. Vendored Leaflet popup defaults are library behavior, not a reusable planner shadow language.

**The Flat Planner Rule.** Separate planning surfaces with the existing borders and theme-aware fills; do not infer ambient, glass or hard-offset card elevation from unused theme variables or screenshot tiles.

Motion is small and local. Buttons transition background and border over (.18s), with a one-pixel hover/press shift using the recorded ease-out curve. A single festival-art arrival runs for (.75s) at desktop widths of at least (960px), only with no reduced-motion preference; it combines a slight vertical/rotational settle with a clip reveal from an already visible image. Other sections do not repeat that entrance.

Reduced motion removes authored animations and transitions, changes smooth scrolling to automatic scrolling and disables Leaflet fade/zoom animation. Map focusing itself is nonanimated.

## Shapes

Gently rounded controls sit inside broader, calm panels. The frontmatter records the recurring control, disclosure, inset, card and panel radii; pill filters and circular number/icon controls are separate shapes, not interchangeable corner settings.

Most boundaries are one-pixel solid dividers. Number badges use stronger outlines; food tips and flight dates use dashed separation in their own contexts. Outline SVG scenery uses rounded joins/caps and a (3px) ink stroke. The authored action-icon system uses a (24px) viewBox, generally rendered at (21px), with a consistent (1.8px) stroke, round joins and round caps. Smaller contextual icons remain SVG.

The hero's scalloped edge, angled stamp and flat-vector silhouettes belong to that illustration vocabulary; they do not prescribe scallops or rotations for every container.

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

- Destination and base filters use surface-filled outlined pills; hover strengthens the border.
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
- There is no current budget/numeric-input component to inherit.

### Navigation

Two levels of task navigation, plus direct day selection.

- Main tabs use bold UI text, a neutral rail and a red active underline (3px). Inactive text is softened; hover restores ink.
- Day-local tabs use an inset page-colored group with rounded controls; the active tab is a bordered surface. They are visually subordinate to the main rail.
- Both tab levels have selected state, controlled panels and roving tab stops. Left/right arrows and Home/End move between tabs; inactive panels are genuinely hidden.
- The selected date uses the highlight wash. Phone date buttons also gain an accent border; the horizontal strip preserves nearby day context.
- Route controls pair meaningful sequential numbers with city names and original SVG landmarks; selection highlights the control and fills its number red.

### Numbered Disclosures

Chronology is visible; long explanations are optional.

- Native `details`/`summary` rows separate agenda steps with a number circle, timing, title and SVG chevron. They start closed, share a disclosure group, and rotate the chevron when opened.
- Place rows use matching list/map numbers, a place title, category/duration and a collapsed description. A place action can open its corresponding map popup.
- Food recommendations stay inside the matching place disclosure, separated by a dashed rule: recommendation, reason, child-aware advice, practical caveat and links. The agenda's culinary shortcut opens the relevant place detail instead of adding a long default food column.
- Alternatives are closed disclosures within the fourth day-local tab, not additional mandatory agenda items.

### Maps & Feedback

An optional geographic aid, never the only access to a place.

- A neutral consent placeholder precedes external map tiles. “OpenStreetMap-Karte laden” and “Auf Karte zeigen” are explicit map actions; permission is then remembered for the current page session.
- Vendored Leaflet supplies real controls and attribution. Accent-filled numbered markers have surface-colored borders and matching accessible place-list numbers; popups use safe DOM content, not imported HTML.
- The map viewport is (320px) high on desktop and (280px) on phones. Theme-aware controls, popup surfaces and attribution remain readable above third-party tiles.
- Loading disables and relabels the load button. Failures explain retry or continued use of the independent place list/Google Maps links; status text remains visible.
- Empty filtered days offer a reset action. Storage failure explains that changes may last only for the session. Status announcements and the skip link support keyboard/screen-reader use.
- Neutral map tiles in automated screenshots are local fixtures, not production illustration or a palette source.

## Do's and Don'ts

### Do:
- **Do** use the exact existing `--cp-*` variables and their light/dark assignments for every component color.
- **Do** pair locally hosted Lilita One headings with the recorded local UI body stack.
- **Do** keep the selected-day overview compact, with full agenda, place, food and alternative detail behind labeled tabs and native disclosures.
- **Do** use original, consistent SVG icons and scenery; preserve visible focus, meaningful state and reduced-motion behavior.
- **Do** keep map consent, attribution, recoverable loading states and independent place links visible where relevant.

### Don't:
- **Don't** copy game characters, logos, artwork or music to strengthen the festival reference.
- **Don't** replace the primary display face with an installed system display font or use emoji/glyphs as the icon system.
- **Don't** add invented kickers, hard-offset card shadows or a synthetic color palette as inherited house style.
- **Don't** restore removed budget, template/source-reference, print or footer UI on the authority of dormant selectors or stale notes.
- **Don't** treat automated map fixture tiles, unused theme effects or tiny one-off artwork lettering as reusable design tokens.
