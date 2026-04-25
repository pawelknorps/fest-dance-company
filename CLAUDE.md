# Fest Dance Company - SOTA Portfolio

High-fidelity kinetic portfolio featuring advanced Three.js rendering, shader-based transitions, and optimized performance primitives.

## 🚀 Quick Start
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Map Repository**: `python3 scripts/generate_repomap.py`

## 🛠 Tech Stack
- **Framework**: React 18 + Vite + TypeScript
- **Rendering**: Three.js (R3F), GLSL Shaders
- **Motion**: Framer Motion (DOM), Lenis (Smooth Scroll)
- **State/i18n**: Custom hooks + `src/content`
- **Optimization**: Web Workers (Canvas sampling, Video decoding)

## 📂 Architecture Overview
- `src/components/ui`: Atomic kinetic components (Magnetic buttons, Custom cursor, Shaders).
- `src/components/sections`: High-level modules (KineticPortfolio, ParticleRiver, HeroStage).
- `src/workers`: Heavy computation offloaded to background threads.
- `src/hooks`: Specialized kinetic and viewport telemetry.
- `src/content`: Centralized copy and i18n management.

## 📜 Coding Standards
- **Performance First**: Offload heavy math to workers; use `requestAnimationFrame` for custom loops.
- **Aesthetics**: Follow the "SOTA" aesthetic—glassmorphism, kinetic typography, and fluid transitions.
- **Navigation**: **MANDATORY**: Review `repomap.md` before exploration to locate symbols.
- **Types**: Use strict interfaces in `src/types/`.

## 🗺 Navigation Policy
This repository uses a deterministic AST-based mapping system.
- Refer to `repomap.md` for the current symbol table and PageRank importance.
- Do not perform recursive `ls` or blind `grep`.
