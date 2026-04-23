import { useEffect, useRef, useState } from 'react'
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
import { KineticPortfolio } from '../components/sections/KineticPortfolio'
import { portfolio } from '../data/portfolio'
import * as THREE from 'three'

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
    const loader = new THREE.ImageBitmapLoader()
    loader.setOptions({ imageOrientation: 'flipY' })
    
    portfolio.slice(0, 4).forEach(item => {
      try {
        const src = (isMobile && item.image.srcMobile) ? item.image.srcMobile : item.image.src
        loader.load(src)
      } catch (e) {}
    })
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
              <KineticPortfolio />
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
