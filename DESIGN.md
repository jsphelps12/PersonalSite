---
name: Joshua Phelps
description: A Football Manager player-profile screen for an applied AI engineer, skinned by the visitor's time of day.
colors:
  day-ground: "#e9edf2"
  day-panel: "#ffffff"
  day-panel-2: "#f3f5f8"
  day-line: "#d3d9e2"
  day-fg: "#13151c"
  day-muted: "#566073"
  day-link: "#1d4fc4"
  day-stripe: "#f2c230"
  day-stripe-ink: "#13151c"
  day-role-ink: "#ffffff"
  day-band-low: "#b8352a"
  day-band-mid: "#8a5d00"
  day-band-good: "#1d7f48"
  day-band-elite: "#1556b8"
  day-silk-a: "rgb(52 64 184 / 0.32)"
  day-silk-b: "rgb(232 160 0 / 0.38)"
  night-ground: "#11141b"
  night-panel: "#191e29"
  night-panel-2: "#202737"
  night-line: "#2b3345"
  night-fg: "#e8ecf2"
  night-muted: "#98a2b5"
  night-link: "#f2c230"
  night-stripe: "#f2c230"
  night-stripe-ink: "#13151c"
  night-role-ink: "#13151c"
  night-band-low: "#ff7a6e"
  night-band-mid: "#f2c230"
  night-band-good: "#5fd394"
  night-band-elite: "#6cc4ff"
  night-silk-a: "rgb(120 132 255 / 0.4)"
  night-silk-b: "rgb(242 194 48 / 0.4)"
  dawn-ground: "#121c52"
  dawn-panel: "#1a276a"
  dawn-panel-2: "#22317c"
  dawn-line: "#34449a"
  dawn-fg: "#f6eef3"
  dawn-muted: "#c3bedd"
  dawn-link: "#ffa3bd"
  dawn-stripe: "#f28ba8"
  dawn-stripe-ink: "#121c52"
  dawn-role-ink: "#121c52"
  dawn-band-low: "#ff8a7e"
  dawn-band-mid: "#ffd166"
  dawn-band-good: "#74e0a8"
  dawn-band-elite: "#bfe9ff"
  dawn-silk-a: "rgb(242 139 168 / 0.42)"
  dawn-silk-b: "rgb(255 209 102 / 0.4)"
typography:
  display:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "clamp(3rem, 11vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 62"
  headline:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.25rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.005em"
    fontVariation: "'wdth' 72"
  title:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.1
    fontVariation: "'wdth' 72"
  rating:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    fontFeature: "'tnum'"
    fontVariation: "'wdth' 72"
  body:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  body-prose:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
  tab:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 72"
  label:
    fontFamily: "Archivo Variable, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.06em"
    fontVariation: "'wdth' 72"
  code:
    fontFamily: "ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "0.9em"
rounded:
  hair: "2px"
  pip: "3px"
  panel: "4px"
spacing:
  space-1: "0.25rem"
  space-2: "0.5rem"
  space-3: "0.75rem"
  space-4: "1rem"
  space-5: "1.5rem"
  space-6: "2.5rem"
  space-7: "4rem"
components:
  panel:
    backgroundColor: "{colors.day-panel}"
    textColor: "{colors.day-fg}"
    rounded: "{rounded.panel}"
  panel-head:
    backgroundColor: "{colors.day-panel-2}"
    textColor: "{colors.day-fg}"
    typography: "{typography.label}"
    padding: "0.75rem 1rem"
  panel-body:
    padding: "1rem"
  tab:
    textColor: "{colors.day-muted}"
    typography: "{typography.tab}"
    padding: "0.5rem 0.75rem calc(0.5rem + 1px)"
  tab-active:
    textColor: "{colors.day-fg}"
  phase-option:
    textColor: "{colors.day-muted}"
    typography: "{typography.label}"
    padding: "0.2rem 0.55rem"
  phase-option-checked:
    backgroundColor: "{colors.day-stripe}"
    textColor: "{colors.day-stripe-ink}"
  attribute-rating:
    typography: "{typography.rating}"
    width: "1.6rem"
  attribute-rating-unverified:
    textColor: "{colors.day-muted}"
  form-pip:
    rounded: "{rounded.pip}"
    size: "2rem"
  probability-track:
    backgroundColor: "{colors.day-panel-2}"
    rounded: "{rounded.hair}"
    height: "0.9rem"
---

# Design System: Joshua Phelps

## Overview

**Creative North Star: "The Player Profile"**

The site is a Football Manager player-profile screen with Josh as the scouted player. Every surface is a stack of dense, square-shouldered data panels on a flat ground: a full-width profile header carrying a yellow kit stripe, attribute columns rated 1 to 20, a prediction-form row of result pips, and an inbox of takes. Navigation is a tab strip under the club bar, not a menu. Information density is high and deliberate; whitespace is spent between panels, not inside them.

Two disciplines are borrowed into the world. The skin is a time phase (night, dawn, day) picked from the visitor's clock before first paint unless they choose one; dawn is cobalt with rose. Probabilities render as translucent overlapping bands leaning away from 50%, deepening where forecasters agree. Both are carried entirely by custom properties, so every component works in every skin without knowing which one is live.

Credibility is the brand constraint underneath the game: ratings without evidence show as a range and say "Unverified"; placeholder content is flagged in the mid-band colour. No photography, stock, or fabricated imagery; the world is typographic and diagrammatic (pitch map, crest, strips).

**Key Characteristics:**
- Archivo Variable in two widths: condensed heavy caps for names, labels, tabs and numbers; normal width for prose.
- Tabular numerals everywhere a number is compared.
- Four rating bands (low, mid, good, elite) as the only semantic colour family.
- One accent per skin (the stripe): kit stripe, active tab, checked skin, focus ring, selection.
- Flat panels at a single elevation, 4px corners, 1px hairlines.

## Colors

Each skin is a cool neutral ground with a tinted panel pair, one stripe accent, and a four-step rating band ramp tuned to clear contrast on that skin's panel.

### Primary
- **Kit Stripe Yellow** (`day-stripe`, `night-stripe`): the single accent. The 6px kit stripe across the top of the profile header, the 3px underline of the active tab, the checked phase option, the 2px focus ring, text selection, the skip link, and the crest's outer shield. In night it is also the link colour.
- **Dawn Rose** (`dawn-stripe`): the dawn skin's stripe, filling every stripe role above; dawn links are the lighter `dawn-link`.

### Secondary
- **Rating bands** (`*-band-low`, `*-band-mid`, `*-band-good`, `*-band-elite`): FM's red / yellow / green / blue attribute scale. Bands are 1-5 low, 6-10 mid, 11-15 good, 16-20 elite. They colour attribute numbers, pitch role markers (natural = elite, accomplished = good, unconvincing = mid), form pips (right = good, wrong = low) and outcome labels. Mid also marks draft and "Unverified" flags.
- **Day Link Blue** (`day-link`): links in the day skin only.

### Tertiary
- **Silk pair** (`*-silk-a` for Josh, `*-silk-b` for the market): translucent band fills for probability strips. Blend is `multiply` in day and `screen` in night and dawn, so overlap always reads as a deeper or brighter third tone.

### Neutral
- **Ground** (`*-ground`): page background behind panels.
- **Panel** (`*-panel`): panel, header bar and footer surfaces.
- **Panel Recess** (`*-panel-2`): panel heads, pitch field, probability track, code blocks, pending pip.
- **Hairline** (`*-line`): every border and row divider.
- **Ink** (`*-fg`) and **Muted Ink** (`*-muted`): text and secondary text, labels, inactive tabs, chevrons.
- **Stripe Ink / Role Ink**: text set on stripe fills and on pitch role markers respectively.

### Named Rules
**The Clock Skin Rule.** Components read tokens, never a skin's literal values. Skins are switched on `data-phase` (night, dawn, day); with no phase set, the OS colour scheme picks night or day. A phase is always named in text in the switch, never shown as colour alone.

**The One Stripe Rule.** The stripe is the only accent. If a new element wants attention, it takes the stripe in one of its established roles or it stays in ink.

**The Band Rule.** Band colour always accompanies a number, range, letter or word; colour never carries a rating by itself.

## Typography

**Display Font:** Archivo Variable, width axis at 62% (with system-ui, sans-serif)
**Body Font:** Archivo Variable at normal width
**Label/Mono Font:** Archivo Variable at 72% width for labels; system monospace for code only

**Character:** One family, two voices. The condensed heavy caps are the FM broadcast voice of names and numbers; normal-width text is Josh talking.

### Hierarchy
- **Display** (900, clamp(3rem, 11vw, 6rem), 0.88, 62% width, uppercase): the player's name in the profile header only.
- **Headline** (800, clamp(2rem, 5vw, 3.25rem), 1.1, 72% width, uppercase): page titles on every inner page and article.
- **Title** (800, 1.5rem, 72% width, uppercase): prose h2. Prose h3 stays normal width at 1.15rem.
- **Rating** (800, 1.125rem, 72% width, tabular): attribute values and pip letters.
- **Body** (400, 1rem, 1.55): UI copy. Long-form prose is 1.0625rem at 1.7 within a 40rem measure.
- **Tab** (700, 0.875rem, 0.04em, 72% width, uppercase): tab strip and phase options (0.75rem).
- **Label** (600, 0.75rem, 0.06em, 72% width, uppercase, muted): panel titles, fact terms, post categories, dates, tags, legends.

### Named Rules
**The Two Widths Rule.** Condensed caps are for names, labels, tabs and numbers; anything a visitor reads as a sentence is normal width and sentence case.

**The Tabular Rule.** Any number that sits in a column or is compared to another number uses tabular numerals.

## Layout

A single centred column capped at 76rem, padded 1.5rem / 1rem / 4rem. The header bar and tab strip align to the same 76rem width on a full-bleed panel band; the footer mirrors it.

The home surface is a full-width profile header panel (name block left, pitch map right, bottom-aligned) followed by a 2fr / 1fr panel grid with 1rem gutters. Attributes sit in three equal columns (Technical, Mental, Physical) inside their panel. At 60rem the grid becomes one column and attributes two; at 40rem attributes become one column and the pitch drops below the name. The tab strip scrolls horizontally below 48rem with a right-edge fade mask. Post rows are a category / title / date grid that restacks below 36rem.

Spacing uses a seven-step scale (`space-1` to `space-7`); panel internals use `space-3` and `space-4`, panel-to-panel gaps `space-4`, header block spacing `space-5` and `space-6`. Inner pages and articles hold text to a 40rem measure.

## Elevation & Depth

Flat with one ambient lift. Every panel sits at the same level: 1px hairline border plus a soft two-layer shadow defined per skin (lighter in day, deeper in night and dawn). Depth inside a panel is tonal, using the recessed `panel-2` for heads, tracks and the pitch field.

### Shadow Vocabulary
- **Panel** (`box-shadow: var(--shadow)`; day `0 1px 2px rgb(19 21 28 / 0.06), 0 6px 18px rgb(19 21 28 / 0.06)`): panels and the profile header only.

### Named Rules
**The One Level Rule.** Panels never stack or lift on hover; there is one elevation and every panel is on it.

## Shapes

Square-shouldered. Panels, switches, the pitch field and code blocks take a 4px corner; form pips 3px; the probability track and focus ring 2px. Circles are reserved for pitch role markers and their legend dots. Lines are 1px hairlines; the two heavier strokes are the 2px ink rule under each attribute group heading and the 3px stripe under the active tab. Prediction blocks inside a take are separated by a dashed hairline.

## Components

### Navigation (tab strip)
Condensed caps tabs in muted ink. Hover goes to ink; the current page goes to ink with a 3px stripe underline. Above it, the club bar holds the crest (stripe shield, panel inset, "JP" in condensed 800) beside the name in caps, and the skin switch.

### Skin switch
A segmented control of four options (Auto, Night, Dawn, Day) inside a 1px hairline box with 4px corners and hairline dividers. Native radios sit invisibly over each segment. Checked takes the stripe fill with stripe ink; focus draws a 2px inset stripe outline. The "Skin" label hides below 30rem; the legend stays for assistive tech.

### Panels / Containers
- **Corner Style:** 4px.
- **Background:** panel body on `panel`, head on `panel-2` with a hairline under it.
- **Shadow Strategy:** the single panel shadow (see Elevation).
- **Head:** label-style title in ink on the left, an optional label-style link in link colour on the right ("All writing", "About").
- **Internal Padding:** head 0.75rem / 1rem, body 1rem.

### Attribute row (signature)
A disclosure row: name, rating, chevron. With evidence, the rating is a band-coloured condensed number; without, it is a muted range ("11–15") labelled Unverified for assistive tech. Opening the row animates its height (0.3s) and lists evidence as label-plus-link pairs, or a mid-band "Unverified" flag with a plain sentence. Hover turns the name link-coloured; the chevron rotates 90 degrees. On load, ratings settle upward once with a 40ms stagger (0.9s).

### Probability strip (signature)
A 0.9rem recessed track with a muted 50% tick. Each forecaster is a translucent band from 50% to their probability, blended so overlap deepens. A legend below names each forecaster with a swatch and a tabular percentage, or states "No market price logged".

### Form pips
A row of 2rem squares (3px corners), newest first, each carrying a letter (W, L, V, P) with a full spoken label. Right and wrong fill with good and low bands; pending is a recessed square with a hairline; empty slots are faded hairline outlines up to five.

### Lists (posts, inbox, takes)
Rows divided by hairlines with no card chrome. Post rows: label-style category, bold title, muted description, label-style date. Inbox rows: label-style date and tag above a message line. Hover moves the title to link colour; nothing else moves.

### Links
Link colour with a 1px underline offset 0.2em, thickening to 2px on hover. Links in panel heads drop the underline until hover.

## Do's and Don'ts

### Do:
- **Do** take every colour from the skin tokens so a new component works in night, dawn and day without changes.
- **Do** colour ratings by the 1-5 / 6-10 / 11-15 / 16-20 bands and always show the number or range alongside.
- **Do** show an attribute with no evidence as a muted range and the word "Unverified".
- **Do** render any probability as translucent bands from 50% using the silk tokens and the skin's blend mode.
- **Do** put new content in a panel with a label-style head, or as a hairline-divided row inside one.
- **Do** set names, labels, tabs and numbers in condensed caps, and sentences at normal width.
- **Do** use the shared expo-out ease (`cubic-bezier(0.16, 1, 0.3, 1)`): 0.6s for skin changes, 0.15-0.3s for hover and disclosure, and honour reduced motion by removing all animation.
- **Do** check text on any band or stripe fill clears 4.5:1 in all three skins.

### Don't:
- **Don't** use photography, stock or generated imagery; the world is type, data and diagrams.
- **Don't** introduce a second accent, gradients, or tinted panel backgrounds beyond `panel` and `panel-2`.
- **Don't** round corners past 4px or lift panels on hover.
- **Don't** draw solid probability bars or pie charts for forecasts.
- **Don't** set prose in condensed caps or labels in sentence-case normal width.
- **Don't** mark a skin, rating or outcome by colour alone.
