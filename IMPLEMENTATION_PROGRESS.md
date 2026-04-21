# FEST Dance Company 2026 Landing

## Plan Snapshot
- Build a one-page premium landing in React + Vite + Tailwind for choreography services.
- Keep the visual direction dark, cinematic and image-led, with condensed typography and restrained neon glow.
- Structure the app around reusable sections and data-driven content modules.
- Optimize for performance with smooth scroll, lazy-loaded media, reduced-motion fallbacks and typed asset metadata.
- Protect scale-up paths with strict typing, dedicated hooks and form validation.

## Progress
- [x] Scaffolded the Vite + React application and introduced Tailwind, Framer Motion and Lenis.
- [x] Split the page into dedicated layout and section components.
- [x] Moved domain models into `src/types/` and consumed them from data/config modules.
- [x] Added `src/hooks/useScrollReveal.ts` and `src/hooks/useHeroMediaVisibility.ts`.
- [x] Upgraded image data models to include `src`, `alt`, `width`, `height`.
- [x] Configured `vite-imagetools` for a future media optimization pass without blocking the stable build pipeline.
- [x] Replaced the hero particle fallback with a Lottie-based animated background.
- [x] Added `wheelMultiplier: 1` to Lenis and retained reduced-motion safeguards.
- [x] Rebuilt the inquiry form with `react-hook-form` + `zod`, including validation, empty state and network error messaging.
- [x] Applied lazy loading to media below the hero and kept the founder styling adjustable in CSS.
- [x] Kept the dark background off pure black to reduce OLED black smearing risk.
- [x] Split the Lottie hero background into a lazy-loaded chunk to reduce the initial JS payload.
- [x] Confirmed `npm run build` passes.
- [x] Confirmed `npm run lint` passes.
- [x] Optimized heavy image assets into WebP variants via `vite-imagetools` query parameters.

## Remaining Verification
- [ ] Visually verify hero timing, menu overlay and responsive crop behavior in-browser.
- [ ] Validate the Lottie fallback playback and visibility pause/resume behavior in-browser.
- [ ] Perform manual QA for mobile sizes `390px` and `430px`.
- [ ] Plug the form into a real endpoint if production lead capture is required.

## Notes
- `lottie-web` emits a build warning about `eval` inside the dependency bundle. The app still builds successfully, but replacing Lottie with a tiny WebM or custom canvas animation would further harden the stack.
- Automated visual QA via the available Playwright tool was blocked by an environment error, so browser-level inspection remains manual.
