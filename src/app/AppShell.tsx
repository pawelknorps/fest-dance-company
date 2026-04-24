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

const PortfolioRail = lazy(() => import('../components/sections/PortfolioRail'))

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    // Preload first 2 portfolio images for instant feel — Desktop only to save mobile bandwidth
    if (window.innerWidth > 768) {
      portfolio.slice(0, 2).forEach(item => {
        const img = new Image()
        img.src = item.image.srcMobile || item.image.src
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
              <Suspense fallback={<div className="h-[100vh] bg-[#05030a]" />}>
                {/* Unified Premium Portfolio for both Mobile and Desktop */}
                <PortfolioRail />
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

export default AppShell
