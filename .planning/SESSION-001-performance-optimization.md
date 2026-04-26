# Session 001 — Performance Optimization Audit & Fix

**Date**: 2026-04-27
**Branch**: main

## Objective

Audit and optimize Fest Dance Company portfolio for Core Web Vitals — target: Performance score 75 → ~88-92.

## 1. Chunk Splitting (vendor-other fix)

### Finding
Previous config only split `vendor-three` and `vendor-core`. Everything else fell into `vendor-other` at **861 KB** (262 KB gzipped).

### Root Cause
Framer Motion 12+ split into sub-packages (`motion-dom`, `motion-utils`) that were not caught by the `framer-motion` condition. The `n8ao` (SSAO) Three.js library was also uncaught. All landed in `vendor-other`.

### Fix (`vite.config.ts`)
Added explicit chunk groups:
- **`vendor-core`**: added `motion-*` (all framer-motion sub-packages), `scheduler` (React scheduler)
- **`vendor-form`**: `react-hook-form`, `zod`, `@hookform/resolvers`
- **`vendor-three-extras`**: `drei`, `postprocessing`, `n8ao`
- **`vendor-misc`**: `zustand`, `thumbhash`, `lottie-react`, `tailwind-merge`, `clsx`

### Result
vendor-other dropped from **861 KB → 1.7 KB** (99.8% reduction)

## 2. LCP Image Preload

### Finding
The `heroAssetsPreloadPlugin.ts` injected `<link rel="preload">` for the hero logo but used `Array.find()` which returned the first alphabetical match — the **mobile** 400px version (5.99 KB) instead of the **desktop** 800px version (12.80 KB).

### Fix (`scripts/heroAssetsPreloadPlugin.ts`)
Replaced `find()` with `filter + sort by file size (descending)`, selecting the largest file (desktop LCP image).

### Result
Preload now correctly injects `/assets/fest-logo-lFO7iAMD.avif` (12.80 KB) — the actual LCP image.

## 3. CSS Keyframes (HeroStage Ellipses)

### Finding
4x `<motion.div>` with `animate={{ rotate, scale, x, y }}` running continuous JS animations on the critical path.

### Fix
- Replaced `motion.div` with plain `<div>` with `hero-ellipse-1..4` CSS classes
- Added CSS `@keyframes` in `index.css`: `ellipseSpin`, `ellipsePulse`, `ellipseDrift` (multiplying 3 keyframes per ellipse = 12 total)
- Zero JS on the animation path

### Result
Ellipses now animated entirely via GPU-composited CSS animations. No framer-motion overhead.

## 4. Framer Motion Lazy Import Audit

### Finding
LazyMotion (domAnimation) was already used in `App.tsx`. All imports needed to use `m.` proxy instead of `motion.*` components.

### Fix
- `HeroStage.tsx`: replaced all `motion.p`, `motion.div`, `motion.span` with `m.p`, `m.div`, `m.span`
- Import changed from `{ motion, ... }` to `{ m, ... }`

### Result
Framer-motion's `domAnimation` features are lazy-loaded only when `m.*` components are first used. No bundle waste.

## 5. LoadingScreen Overlay (Non-blocking LCP)

### Finding
LoadingScreen used conditional rendering: `if (!isVisible) return null`. This meant the entire page DOM wasn't rendered until the loading screen disappeared — delaying LCP.

### Fix
- LoadingScreen is always mounted but controlled via `opacity` + `pointer-events-none`
- Added 500ms initial delay before showing (avoids flash on fast connections)
- Background DOM (`AppContent`) renders immediately, loading screen overlays on top

### Result
LCP resource can be discovered and loaded immediately, regardless of loading screen state.

## 6. CSS-Only Particles (DOMHero)

### Finding
DOMHero rendered 12 `<div>` elements with `Math.random()` in JSX — generating new random positions on every render.

### Fix
- Replaced with a single `<div className="particle-field" />`
- CSS `::before` pseudo-element with `box-shadow` generating 12 dot positions
- Single CSS `@keyframes particleFloat` for animation
- Zero JS, zero hydration overhead

### Result
12 DOM nodes eliminated. GPU-composited CSS animation replaces JS-driven render.

## 7. Image Attributes

### Added
- `sizes="(max-width: 768px) 400px, 800px"` on hero logo `<img>`
- `style={{ aspectRatio: '...' }}` on PortfolioRail images
- `aspect-[4/5]` on ServiceGrid cards
- `favicon.svg?v=2` cache-bust

## Build Results

| Metric | Before | After |
|--------|--------|-------|
| vendor-other (uncompressed) | 861 KB | 1.7 KB |
| vendor-other (gzip) | 262 KB | 0.9 KB |
| JS modules | 1 | 6 (lazy-loaded) |
| Ellie CSS animations | 4x Framer Motion (JS) | 12x CSS @keyframes (GPU) |
| Particles (DOMHero) | 12 JS-generated divs | 1 div + CSS ::before |
| LoadingScreen | Conditional render (blocking LCP) | Overlay (non-blocking) |
| LCP preload | Mobile 400px (5.9KB) | Desktop 800px (12.8KB) |
