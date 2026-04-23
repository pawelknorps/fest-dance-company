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
    
    if (isMobile) {
      // Standard DOM image preloading for mobile
      portfolio.slice(0, 4).forEach(item => {
        const img = new Image()
        img.src = item.image.srcMobile || item.image.src
      })
    } else {
      // SOTA ImageBitmapLoader for Desktop/Tablet (VRAM optimization)
      // Use dynamic import for THREE to avoid loading it on mobile
      import('three').then((THREE) => {
        const loader = new THREE.ImageBitmapLoader()
        loader.setOptions({ imageOrientation: 'flipY' })
        
        portfolio.slice(0, 4).forEach(item => {
          try {
            loader.load(item.image.src)
          } catch (e) {}
        })
      })
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
