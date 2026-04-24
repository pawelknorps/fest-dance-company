import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { SmoothScroll } from '../components/layout/SmoothScroll'
import { SiteHeader } from '../components/layout/SiteHeader'
import { HeroStage } from '../components/sections/HeroStage'
import { ServiceGrid } from '../components/sections/ServiceGrid'
import { FounderFeature } from '../components/sections/FounderFeature'
import { CredibilityBand } from '../components/sections/CredibilityBand'
import { ProcessStrip } from '../components/sections/ProcessStrip'
import { InquiryForm } from '../components/sections/InquiryForm'
import { SiteFooter } from '../components/layout/SiteFooter'
import { CustomCursor } from '../components/ui/CustomCursor'
import { StructuredData } from '../components/seo/StructuredData'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { ScrollProgress } from '../components/ui/ScrollProgress'
import { portfolio } from '../data/portfolio'

// KineticPortfolio is now lazy loaded to avoid Three.js bundle on mobile
const KineticPortfolio = lazy(() => import('../components/sections/KineticPortfolio'))
const PortfolioRail = lazy(() => import('../components/sections/PortfolioRail'))

// Global trigger for portfolio loading to be called from anywhere (e.g. SmoothScroll)
declare global {
  interface Window {
    __fest_trigger_portfolio?: () => void
  }
}

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const idleCallback = window.requestIdleCallback || ((cb: IdleRequestCallback) => setTimeout(cb, 200))

    if (isMobile) {
      // Standard DOM image preloading for mobile — fire immediately, images are small
      portfolio.slice(0, 4).forEach(item => {
        const img = new Image()
        img.src = item.image.srcMobile || item.image.src
      })
    } else {
      // ── Idle task 1: Pre-warm the WebGL context ──────────────────────────────
      // Creating a WebGL context takes 150–300 ms on mid-range hardware (driver
      // init, shader compiler spin-up). We do it in a hidden 1×1 canvas during
      // idle time so KineticPortfolio's Canvas can reuse the already-warm GPU
      // driver and appear near-instantly when the user scrolls to it.
      const warmHandle = idleCallback(() => {
        try {
          const warmCanvas = document.createElement('canvas')
          warmCanvas.width = 1
          warmCanvas.height = 1
          // Request webgl2 first (same as Three.js), fall back to webgl
          const ctx = warmCanvas.getContext('webgl2') ?? warmCanvas.getContext('webgl')
          if (ctx) {
            // Compile a trivial shader pair to fully warm the driver pipeline
            const vs = ctx.createShader((ctx as WebGL2RenderingContext).VERTEX_SHADER)!
            const fs = ctx.createShader((ctx as WebGL2RenderingContext).FRAGMENT_SHADER)!
            ctx.shaderSource(vs, 'void main(){gl_Position=vec4(0,0,0,1);}')
            ctx.shaderSource(fs, 'void main(){gl_FragColor=vec4(0);}')
            ctx.compileShader(vs)
            ctx.compileShader(fs)
            const prog = ctx.createProgram()!
            ctx.attachShader(prog, vs)
            ctx.attachShader(prog, fs)
            ctx.linkProgram(prog)
            // Cleanup — we only needed the warm-up side effect
            ctx.deleteProgram(prog)
            ctx.deleteShader(vs)
            ctx.deleteShader(fs)
            ;(ctx as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext()
          }
        } catch (_) {
          // Non-critical — silently ignore if warm-up fails
        }
      }, { timeout: 3000 })

      // ── Idle task 2: Preload portfolio textures via ImageBitmapLoader ─────────
      // Defer Three.js import to idle time so it doesn't compete with hero images
      // and React hydration on initial load. Three.js (707 KB) pulling in during
      // mount blocks the network queue; idle callback lets the critical path finish first.
      const preloadHandle = idleCallback(() => {
        import('three').then((THREE) => {
          const loader = new THREE.ImageBitmapLoader()
          loader.setOptions({ imageOrientation: 'flipY' })
          portfolio.slice(0, 4).forEach(item => {
            try {
              loader.load(item.image.src)
            } catch (_) {}
          })
        })
      }, { timeout: 4000 })

      return () => {
        if (window.cancelIdleCallback) {
          window.cancelIdleCallback(warmHandle as number)
          window.cancelIdleCallback(preloadHandle as number)
        }
      }
    }
  }, [])

  return (
    <>
      <LoadingScreen />
      <SmoothScroll>
        <ScrollProgress />
        <StructuredData />
        <div className="relative min-h-screen overflow-x-clip bg-night text-white">
          <CustomCursor />
          <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(255,0,242,0.15),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.06),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(255,0,179,0.08),transparent_32%)]" />
          <SiteHeader open={menuOpen} setOpen={setMenuOpen} />

          <main className="relative z-10">
            <HeroStage />
            <ServiceGrid />
            <FounderFeature />
            <CredibilityBand />
            
            <div id="portfolio">
              <Suspense fallback={<div className="h-[100vh] bg-[#070410]" />}>
                {window.matchMedia('(max-width: 768px)').matches ? (
                  <PortfolioRail />
                ) : (
                  <KineticPortfolio />
                )}
              </Suspense>
            </div>

            <ProcessStrip />
            <InquiryForm />
          </main>

          <SiteFooter />
        </div>
      </SmoothScroll>
    </>
  )
}
