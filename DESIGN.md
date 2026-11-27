---
name: ShadyFyrix Spatial 3D Web
description: Deep cyber-horizon obsidian space with glowing GLSL infinite energy grid, 3D ShadyFyrix identity cube, and plasma cyan highlights.
colors:
  abyss: "#05070c"
  surface-obsidian: "rgba(11, 17, 29, 0.78)"
  surface-strong: "rgba(9, 14, 24, 0.92)"
  surface-dialog: "#0a101c"
  ink-primary: "#f2f6ff"
  ink-secondary: "#b7c6e0"
  ink-muted: "#8ea3c7"
  plasma-cyan: "#36e5ff"
  cyan-ink: "#04131a"
  electric-cobalt: "#3d7bff"
  solar-ember: "#ff6a45"
  signal-live: "#38f29c"
  border-rim: "rgba(183, 212, 255, 0.14)"
  border-active: "rgba(54, 229, 255, 0.42)"
typography:
  display:
    fontFamily: "'Unbounded', ui-sans-serif, sans-serif"
    fontSize: "clamp(2.1rem, 3.85vw + 0.55rem, 4.1rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "'Unbounded', ui-sans-serif, sans-serif"
    fontSize: "clamp(1.85rem, 2.4vw + 0.9rem, 3.1rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  title:
    fontFamily: "'Unbounded', ui-sans-serif, sans-serif"
    fontSize: "clamp(1.18rem, 0.65vw + 0.95rem, 1.5rem)"
    fontWeight: 700
    lineHeight: 1.22
    letterSpacing: "-0.025em"
  body:
    fontFamily: "'Be Vietnam Pro', ui-sans-serif, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "0.78rem"
    fontWeight: 500
    lineHeight: 1.35
rounded:
  card: "14px"
  media: "10px"
  logo: "6px"
  pill: "999px"
spacing:
  2xs: "4px"
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "26px"
  xl: "44px"
  2xl: "68px"
components:
  button-primary:
    backgroundColor: "{colors.plasma-cyan}"
    textColor: "{colors.cyan-ink}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-ghost:
    backgroundColor: "rgba(11, 17, 29, 0.72)"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  dock-tab-active:
    backgroundColor: "{colors.plasma-cyan}"
    textColor: "{colors.cyan-ink}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "38px"
  depth-surface:
    backgroundColor: "{colors.surface-obsidian}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.card}"
    padding: "24px"
---

# Design System: ShadyFyrix Spatial 3D Web

## Overview

**Creative North Star: "The Cyber-Horizon Spatial Stage"**

This visual system frames Lục Văn Sơn's (`ShadyFyrix` / `BetterCallShady`) personal landing page as an open, full-viewport Three.js WebGL 3D universe rather than a boxed card template. A persistent fixed WebGL canvas renders a deep abyssal horizon, an infinite undulating GLSL perspective energy grid, 2,200 magnetic particles, and interactive 3D centerpieces (the custom ShadyFyrix identity cube, the 63-bone NotGunGun Ultimatum model, and a morphing holographic core) directly behind translucent obsidian content surfaces.

The interface balances playful 3D/gaming creator identity with rigorous full-stack and AI engineering clarity. High-contrast cool-white typography sits effortlessly over calm dark surfaces, while electric cyan and occasional solar-ember bursts mark live interactive feedback, `.ogg` audio shockwaves, and primary actions.

**Key Characteristics:**
- Persistent full-viewport Three.js WebGL stage with GLSL infinite perspective grid, magnetic particles, and scroll-choreographed 3D camera flight.
- Single-elevation translucent obsidian rim surfaces (`1px` border + pointer-tracked radial specular sheen; zero hard offset shadows or decorative nested cards).
- Custom vector ShadyFyrix cyan-rimmed cube emblem unifying the favicon suite, navigation bar, and interactive 3D hero centerpiece.
- Strictly solid high-contrast display typography (`Unbounded` + `Be Vietnam Pro`) with zero kickers, zero eyebrows, and zero gradient text.

## Colors

The palette is anchored in deep midnight-obsidian darkness pierced by luminous plasma cyan, secondary electric cobalt, and sparse solar-ember impulse highlights.

### Primary
- **Plasma Cyan** (`#36e5ff`): Primary filled action pills, active stage tabs, live tabular counters, 3D wireframe edge cages, and primary energy-grid highlights. Always paired with Deep Cyan Ink (`#04131a`) when used as a button fill.

### Secondary
- **Electric Cobalt** (`#3d7bff`): Mid-depth horizon energy gradients, Steam playtime bars, and secondary scroll-chapter harmonic shifts in the GLSL backdrop and grid shaders.

### Tertiary
- **Solar Ember** (`#ff6a45`): Reserved exclusively for high-energy interactive feedback — active pressed 3D/audio dock states, `.ogg` gunshot shockwave rings, and FFT peak bars.
- **Signal Live Green** (`#38f29c`): Live synchronization status dots indicating active `/api/live-sync` endpoints.

### Neutral
- **Abyss Obsidian** (`#05070c`): Document root canvas and WebGL fallback ground.
- **Obsidian Surface** (`rgba(11, 17, 29, 0.78)`): Translucent floating panels and product showcases revealing the live WebGL universe underneath.
- **Strong Dock Surface** (`rgba(9, 14, 24, 0.92)`): High-legibility control docks and sticky navigation overlay.
- **Dialog Obsidian** (`#0a101c`): Opaque modal surface for uninterrupted case-study reading and interactive 3D inspection.
- **Primary Ink** (`#f2f6ff`): Headings, primary body copy, and interactive control text (>16:1 contrast on Abyss).
- **Secondary Ink** (`#b7c6e0`): Supporting paragraphs, summaries, and nav links (~10:1 contrast).
- **Muted Slate-Blue Ink** (`#8ea3c7`): Metadata, dates, and technical stack annotations (>6.5:1 contrast, never un-tinted neutral gray).

### Named Rules
**The Impulse-Only Ember Rule.** Solar Ember (`#ff6a45`) appears only on active pressed states, audio shockwaves, and FFT peaks — never as a static background fill or general link color.

**The Single-Elevation Rim Rule.** Surfaces declare elevation once through a crisp `1px` translucent rim (`rgba(183, 212, 255, 0.14)` shifting to `rgba(54, 229, 255, 0.42)` on hover) and pointer specular sheen, never combining borders with diffuse drop shadows or hard offset block shadows.

## Typography

**Display Font:** `Unbounded` (fallback: `ui-sans-serif, sans-serif`)
**Body Font:** `Be Vietnam Pro` (fallback: `ui-sans-serif, sans-serif`)
**Telemetry / Mono Font:** `JetBrains Mono` (fallback: `ui-monospace, monospace`)

**Character:** Wide sculptural geometric headlines in `Unbounded` give the spatial stage unmistakable studio presence while supporting full Vietnamese diacritics, paired with clean humanist Vietnamese body prose in `Be Vietnam Pro` and `JetBrains Mono` reserved strictly for numeric telemetry, coordinates, and stack tokens.

### Hierarchy
- **Display** (`800`, `clamp(2.1rem, 3.85vw + 0.55rem, 4.1rem)`, `1.04` line-height, `-0.025em` tracking): Opening personal hero headline (`BETTER CALL SHADY / SHADYFYRIX`).
- **Headline** (`700`, `clamp(1.85rem, 2.4vw + 0.9rem, 3.1rem)`, `1.08` line-height): Major chapter titles (`DỮ LIỆU THỰC & HOẠT ĐỘNG`, `SẢN PHẨM ĐÃ XÂY DỰNG`, `VỀ MÌNH`).
- **Title** (`700`, `clamp(1.18rem, 0.65vw + 0.95rem, 1.5rem)`, `1.22` line-height): Project names, channel headers, and achievement titles.
- **Body** (`400/500`, `1rem`, `1.6` line-height, `65ch` max measure): Bio paragraphs, case-study explanations, and descriptions.
- **Telemetry / Mono** (`400/500`, `0.78rem`, `tabular-nums`): Live API counters, timestamps, sync countdowns, years, and stack tags.

### Named Rules
**The Zero-Kicker Rule.** Headings stand on their own scale and weight — never place small uppercase eyebrow or kicker labels above `<h1>`, `<h2>`, or `<h3>`.

**The Honest-Mono Rule.** `JetBrains Mono` applies strictly to numeric readouts, timestamps, years, and code/stack identifiers — never to Vietnamese prose sentences or role titles.

## Layout

Content floats inside a centered `1400px` max-width container with fluid edge gutters (`clamp(18px, 4vw, 56px)`) over the fixed full-viewport WebGL canvas.

- **Hero Stage (`100dvh`):** Open full-bleed WebGL 3D interaction layer across the viewport; identity headline and CTAs anchor bottom-left while the compact Spatial Control Dock anchors bottom-right. On screens `≤ 64rem`, the 3D artifact rises into the clean upper sky zone (`padding-top: clamp(12.25rem, 26.5dvh, 14.75rem)`) above the stacked identity and single-row scrollable dock so every control fits within `375x812` without clipping.
- **Section Rhythm:** Generous vertical chapter spacing (`clamp(88px, 10vw, 136px)`), animated gradient hairline rules (`1px`) leading each section, asymmetric `7fr / 5fr` flagship product showcases, and responsive single-column collapse below `60rem` with `0px` horizontal overflow (`overflow-x: clip`).

## Elevation & Depth

Depth is driven by **three-dimensional WebGL space and translucent obsidian layering**, not drop shadows. Surfaces remain flat against their `1px` translucent borders at rest and respond on desktop hover with gentle spring-damped 3D perspective tilt (`rotateX/rotateY`, max `2.2–4.5°`) plus a subtle radial cyan specular sheen tracking pointer coordinates (`--mx`, `--my`). Translucent `backdrop-filter: blur(14px)` is applied exclusively on floating containers over the live WebGL canvas so the glowing energy grid and 3D core visibly breathe behind them.

## Shapes

- **Cards & Panels:** Smooth technical corners (`14px` radius) with nested media and inner frames stepped cleanly to `10px` radius.
- **Buttons, Tabs & Signal Chips:** Full capsules (`999px` pill radius) for tactile contrast against angular 3D voxel geometry.
- **Brand Emblem:** Rounded square cube silhouette (`6px` nav radius, matching the ShadyFyrix mascot icon geometry).

## Components

### Buttons
- **Shape:** Full pill (`999px` radius), minimum `48px` height (`40px` compact variant).
- **Primary:** Solid Plasma Cyan (`#36e5ff`) fill with Deep Cyan Ink (`#04131a`) label, brightening to `#6eeeff` on hover and subtle `scale(0.98)` press feedback; wrapped in magnetic pointer attraction on fine-pointer desktops.
- **Ghost / Secondary:** Translucent Obsidian (`rgba(11, 17, 29, 0.72)`) with `1px` subtle rim border, transitioning border and text to `#36e5ff` on hover.

### Spatial Control Dock & Tabs
- **Style:** Strong Obsidian container (`rgba(9, 14, 24, 0.92)`, `14px` radius, `1px` rim) housing spring-animated `layoutId` pill tabs (`Shady Cube 3D`, `NotGunGun 3D`, `Vibe GIF FFT`, `ExamGuard AI`), `Nhảy 3D` bounce trigger, `.ogg` SFX buttons, and 3D orbit controls.
- **State:** Active tab slides a solid `#36e5ff` capsule behind `#04131a` text; pressed audio/spin controls shift to Solar Ember (`#ff6a45`).

### Depth Surface Cards
- **Corner Style:** `14px` outer radius, `10px` inner media radius.
- **Background:** Translucent Obsidian (`rgba(11, 17, 29, 0.78)`) with `backdrop-filter: blur(14px)`.
- **Border:** `1px solid rgba(183, 212, 255, 0.14)`, brightening to `rgba(54, 229, 255, 0.42)` on hover with pointer-lit sheen.
- **Internal Padding:** `20px–28px`.

### Navigation
- Fixed `70px` translucent top bar (`rgba(5, 7, 12, 0.66)`, `backdrop-filter: blur(14px)`) with the custom `30x30` ShadyFyrix Cube Logo, clean horizontal links, `Xung 3D` WebGL pulse button, VI/EN language pill, mobile drawer (`≤ 60rem`), and a `2px` Plasma Cyan scroll-progress hairline at the bottom edge.

### Persistent WebGL Spatial Universe (Signature Component)
- Single Three.js WebGL canvas combining a cyber-horizon GLSL sky backdrop, an infinite undulating GLSL perspective energy grid, 2,200 magnetic GPU particles, 22 orbiting wireframe micro-cubes, the interactive 3D ShadyFyrix Identity Cube (with Geometry Dash elastic jump & flip physics), the 63-bone `NotGunGun Ultimatum` Bedrock model, and a scroll/hover-reactive morphing holographic core. Pauses automatically when hidden and freezes continuous motion under `prefers-reduced-motion: reduce`.

## Do's and Don'ts

### Do:
- **Do** keep text contrast ≥ 4.5:1 (`#f2f6ff` and `#b7c6e0` over obsidian surfaces) even when luminous WebGL shaders animate underneath.
- **Do** trigger WebGL shockwaves or subtle core modulation cleanly via `SpatialContext` refs so 60 FPS animations cause zero React re-renders.
- **Do** respect `prefers-reduced-motion: reduce` by freezing continuous spin/camera drift while preserving crisp static 3D rendering and instant state feedback.
- **Do** keep all real personal data, live API endpoints, and `.ogg` audio samples strictly user-initiated and truthful.

### Don't:
- **Don't** add eyebrow/kicker tags above headings, gradient text fills, `feTurbulence` noise overlays, or hard offset shadows (`6px 6px 0`).
- **Don't** expose the student ID (`2310900087`) in visible page copy or commit `STEAM_API_KEY` into client assets.
- **Don't** apply monospace styling to Vietnamese prose descriptions or role titles.
- **Don't** stack decorative blur boxes over flat opaque surfaces where no live WebGL depth exists underneath.
