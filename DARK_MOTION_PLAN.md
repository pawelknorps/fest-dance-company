# Dark Premium & Motion Implementation Plan

This document outlines the steps to upgrade the FEST Dance Company landing page to a "dark premium & motion" aesthetic, aiming for an Awwwards-tier experience.

## 1. Custom Cursor (Kursor Magnetyczny)
- **Goal:** Replace the default browser cursor with a custom, fluid circle that reacts to hover states (e.g., expanding and showing "PLAY" over videos, or snapping to interactive elements).
- **Tech:** `framer-motion` for spring physics, React state/Context to track hovered elements.
- **Action:** Create `src/components/ui/CustomCursor.tsx` and integrate it at the root layout level.

## 2. Scroll-Driven Timeline (Animacje sterowane scrollem)
- **Goal:** Ensure animations (like parallax, rotations, or opacity fades) are mapped directly to the user's scroll position rather than time-based triggers.
- **Tech:** `useScroll` and `useTransform` from `framer-motion`.
- **Action:** Update existing section wrappers and the hero section to use scroll-driven values for element transformations.

## 3. Kinetic Typography (Kinetyczna Typografia)
- **Goal:** Make headings and key text blocks reveal beautifully, e.g., letter-by-letter, or with smooth mask reveals.
- **Tech:** `framer-motion` variants.
- **Action:** Create a `TextReveal` or `KineticText` component and replace static headers in `HeroSection` and `AboutSection`.

## 4. WebGL / Shader Background (Tło oparte na cząsteczkach/płynach)
- **Goal:** Replace static or heavy video backgrounds with a lightweight, interactive WebGL canvas that reacts to mouse movement.
- **Tech:** `@react-three/fiber` and `three`.
- **Action:** Create a `WebGLBackground.tsx` component with a custom shader material or particle system and place it behind the `HeroSection`.

## Execution Order
1. Setup and global integration of `CustomCursor`.
2. Implementation of `Kinetic Typography` in the Hero section.
3. Hooking up `Scroll-Driven Timeline` for the main layout flow.
4. Integrating the `WebGL Background` to finalize the immersive feel.
