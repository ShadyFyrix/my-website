# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **IT recruiters & Tech Leads** evaluating Lục Văn Sơn (`ShadyFyrix`) for AI/ML, full-stack web, or software engineering roles on desktop/laptop — looking for verifiable depth across real code, architecture, live systems, and technical craft.
- **Gaming, 3D modding & YouTube community visitors** (`@BetterCallShady`, Minecraft TaCZ, Steam) exploring on mobile or desktop — looking for an unforgettable, interactive creative showcase with standout visual and audio-reactive polish.

## Product Purpose

Official bilingual (`vi` / `en`) personal showcase and live engineering portfolio for **Lục Văn Sơn (`ShadyFyrix` / `BetterCallShady`)** hosted live at `https://shadyfyrix.id.vn` on Cloudflare Workers. Success means visitors immediately recognize it as out-of-the-ordinary craft (never a generic portfolio template), experience interactive 3D/visual/motion effects smoothly at 60 FPS, and can inspect verified projects, real-time platform stats, and direct contact links.

## Positioning

Combines applied AI / computer-vision / DSP audio / full-stack engineering with real playable WebGL 3D Minecraft TaCZ weapon geometry (`ul_geo.json` + `.ogg` SFX) and live 24/7 GitHub, YouTube, and Steam Web API telemetry on a single custom-domain Cloudflare Worker.

## Operating Context

- Deployed 24/7 on Cloudflare Workers (`shadyfyrix`, `worker.mjs`) serving static Vite React 19 assets plus `/api/live-sync` runtime endpoint with server-side encrypted `STEAM_API_KEY`.
- Accessed across Windows/macOS desktop browsers and mobile 4G browsers in Vietnam and internationally.
- Bilingual audience switches seamlessly between Vietnamese (default) and English.

## Capabilities and Constraints

- **Must preserve all live & interactive functionality:**
  - 3-tier live sync (`/api/live-sync` Worker + `useLiveData` 3-min auto-polling + manual refresh + static fallback `public/live-data.json`) for GitHub (`ShadyFyrix`), YouTube (`@BetterCallShady`), and Steam Web API (`76561198904940621`).
  - Interactive Three.js WebGL 3D viewer for `NotGunGun Pack: Ultimatum` (`public/models/notgungun/ul_geo.json`, `ul.png`, `ul_hud.png`) and real `.ogg` audio samples (`shot.ogg`, `inspect.ogg`, `reload.ogg`).
  - Bilingual VI/EN language switcher (`LanguageContext`).
  - All 7 verified products (`Vibe GIF Song Studio`, `NotGunGun Pack: Ultimatum`, `ExamGuard AI`, `Ma-at-Zessou`, `QLCSVC-AI`, `University Face System`, `Face I Can Scan`), 6 verified achievements, and 4 verified active social channels (GitHub, YouTube, Facebook, Steam).
- **Hard constraints:**
  - Student ID (`2310900087`) remains hidden from public UI text.
  - Zero fabricated projects, testimonials, awards, or metrics.
  - `STEAM_API_KEY` stays strictly server-side / Cloudflare Secrets.
  - Smooth 60 FPS performance with `prefers-reduced-motion` support and full mobile responsiveness (`375px` to `1920px+`).

## Brand Commitments

- Name: **Lục Văn Sơn** (`Luc Van Son`) · Handle: **ShadyFyrix** · Creator alias: **BetterCallShady** · Domain: `shadyfyrix.id.vn` · Email: `shadyfyrix@gmail.com`.
- Origin & education: Hương Bá Thước, Thanh Hóa · IT `K23CNT3`, Nguyen Trai University (Hanoi).
- User explicitly requested replacing the current generic-feeling template with a distinctive, effect-rich interactive landing page.

## Evidence on Hand

- `public/images/portrait/shadyfyrix-avatar.png` (`460x460` real GitHub avatar).
- `public/images/products/vibe-gif-studio.png` (`1380x880` real app capture).
- `public/images/products/notgungun-ultimatum.jpg` (`1024x565` real Blockbench 3D render).
- `public/models/notgungun/ul_geo.json`, `ul.png`, `ul_hud.png` (real 64-cube Bedrock 1.21.0 weapon model).
- `public/audio/notgungun/shot.ogg`, `inspect.ogg`, `reload.ogg` (real extracted `.ogg` SFX).
- `public/live-data.json` & live `/api/live-sync` (GitHub repos/commits, YouTube subs/videos/thumbnails, Steam level/games/recent hours).
- No CV PDF uploaded yet (`cvUrl: ''`); LinkedIn, TikTok, and Zalo links intentionally disabled.

## Product Principles

1. **Interactive proof before prose** — let the 3D craft, real-time telemetry, and reactive motion speak in the opening viewport.
2. **Dual-world harmony** — serious AI/Web engineering rigor and playful 3D/gaming creator energy coexist as one signature identity.
3. **Truth-bound data** — every number, screenshot, model, audio clip, and link is verifiable and never fabricated.
4. **Fluid 60 FPS discipline** — ambitious WebGL, canvas, shader, and spring effects stay silky smooth on desktop and mobile with clean reduced-motion fallbacks.

## Accessibility & Inclusion

- Full keyboard navigation, visible focus states, semantic landmarks, WCAG AA contrast across surfaces, and explicit `prefers-reduced-motion` alternatives.
- No autoplay sound; `.ogg` audio and any sonic feedback activate strictly on user interaction.
