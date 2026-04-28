# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page website for 臺灣慢活教育學會 (Taiwan Slow Living Education Association). The entire site lives in **one self-contained file**: `tslea_website.html` (~1,400 lines, HTML + inline CSS + inline JS). No build system, no dependencies, no package manager, no tests.

## Running / Previewing

Open `tslea_website.html` directly in a browser — there is no dev server, no build step. Any change is visible on refresh.

External runtime dependency: Google Fonts (`Noto Serif TC`, `Cormorant Garamond`) loaded via `<link>` in `<head>`. Site needs internet to render typography correctly.

## Deployment

Target is GitHub Pages. To deploy, the file must be renamed to `index.html` (GitHub Pages serves `index.html` as the root). Do not rename in-place if the user hasn't explicitly asked — they may still be developing under the original name.

## Architecture

### SPA-style page routing (no real router)

All "pages" are sibling `<div class="page" id="page-{name}">` blocks. Only one is visible at a time via the `.active` class. Navigation is purely JS-driven through `showPage(name)` (around line 1313):

- Top nav links and in-page CTA buttons call `showPage('home' | 'board' | 'column' | 'plans' | 'member' | 'donate' | 'contact')` via inline `onclick`.
- Cross-page scroll-to-section uses the pattern: `showPage('home'); setTimeout(()=>document.getElementById('about-sec').scrollIntoView(...), 100)`.
- No URL hash or History API — refreshing always lands on `home`. Deep-linking does not work; do not assume URLs are shareable to a specific page.

When adding a new page, you must: (1) add a `<div class="page" id="page-NAME">`, (2) add a nav link with `data-page="NAME"` and `onclick="showPage('NAME')"`, (3) the `showPage` function handles `.active` toggling generically — no per-page wiring needed.

### Component patterns (all are tiny vanilla-JS toggles)

- **Tabs** (`switchPlan`, `switchMTab`): toggle `.active` between sibling `.plan-content` / `.m-panel` divs and their trigger buttons.
- **Article filter** (`filterArticles`): show/hide `.article-card` elements based on a `data-cat` attribute (`health` | `art` | `eco` | `travel` | `other`). When adding articles, set `data-cat` or they will not be filterable.
- **Article expand** (`toggleArticle`): each long article has a hidden `<div id="article-full-N">` and a button that flips `display`.
- **Scroll reveal**: `IntersectionObserver` adds `.vis` to any `.sec` entering the viewport. Page switches re-trigger via `triggerVisible()` (timeout-based — sections without `.vis` stay invisible if you forget to call it).

### Member area auth — IMPORTANT security note

`#page-member` has a "login" gate, but it is **client-side only**. Credentials are hardcoded in the `ACCOUNTS` object literal in the inline `<script>` (around line 1361) and are visible to anyone who views page source. `sessionStorage.tslea_auth` persists the unlocked state.

This is **not real authentication** — treat it as a soft hint, not access control. Do not place anything genuinely confidential inside `#page-member` (meeting minutes, member docs, photos). If real auth is needed later, this requires a backend (Firebase Auth, Supabase Auth, etc.) — flag this to the user before adding anything sensitive to that section.

### Theming

CSS custom properties on `:root` (top of `<style>`, ~line 9) define the entire palette: `--sage`, `--earth`, `--sky`, `--cream`, `--warm-white`, `--charcoal`, `--muted`, `--border`. Always use these variables rather than hard-coding hex values — the design is built around this restricted palette and one-off colors will look out of place.

Typography pairs `Noto Serif TC` (body, Chinese) with `Cormorant Garamond` (italic accents, English/years). Letter-spacing is intentionally wide (`0.08em`–`0.3em`) for the slow-living aesthetic — preserve this when adding new text styles.

### Editing the single file

Because everything is in one ~500KB file, when modifying:
- Section comment banners (`/* ── NAV ── */`, `<!-- PAGE: HOME -->`) are the navigation landmarks — use Grep on these to jump.
- The file is structured top-to-bottom as: `<style>` (lines ~8–515) → `<nav>` → page divs → `<footer>` → `<script>` (lines ~1303–1411). Keep this ordering when inserting new content.
