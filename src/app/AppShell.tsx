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
import { useDeviceTier, DeviceTier } from '../hooks/useDeviceTier'

const KineticPortfolio = lazy(() => import('../components/sections/KineticPortfolio'))
const DOMKineticPortfolio = lazy(() => import('../components/sections/DOMKineticPortfolio'))

import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { textureManager } from '../lib/TextureManager'

import { SemanticShadow } from '../components/seo/SemanticShadow'
import { Helmet } from 'react-helmet-async'

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const tier = useDeviceTier()

  useEffect(() => {
    // SOTA 2026: Warm up the first 3 portfolio assets early (AVIF is tiny)
    // This pre-fills the browser cache before the user even reaches the section.
    const preloadItems = portfolio.slice(0, 3).map(item => ({
      id: item.id,
      url: item.image.srcMobile || item.image.src,
      priority: 1 as const
    }))
    textureManager.preload(preloadItems)
  }, [])

  console.log('AppShell rendering');

  return (
    <ErrorBoundary>
      <Helmet>
        <title>FEST Dance Company | Choreography & Movement Direction</title>
        <meta name="description" content="Premium Choreography, Movement Direction & Performance Design for concerts, music videos, and fashion campaigns." />
        <meta name="google-site-verification" content="lsJb2MLxlUnH0GyUJMdhwCUa64zwGK0Xgqyi5T4t-AM" />
      </Helmet>
      <SemanticShadow />

      <LoadingScreen />

      <SmoothScroll>
        <ScrollProgress />
        <StructuredData />
        <div className="relative min-h-screen overflow-x-clip bg-night text-white">
          <CustomCursor />
          <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(255,0,242,0.15),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.06),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(255,0,179,0.08),transparent_32%)]" />
          <SiteHeader open={menuOpen} setOpen={setMenuOpen} />

          <main className="relative z-10">
            <HeroStage tier={tier} />
            <ServiceGrid />
            <Suspense fallback={<div />}>
              <FounderFeature />
              <CredibilityBand />
            </Suspense>
            
            <div id="portfolio">
              <Suspense fallback={<div className="h-[100vh] bg-[#05030a]" />}>
                {tier === DeviceTier.LOW ? (
                  <DOMKineticPortfolio />
                ) : (
                  <KineticPortfolio />
                )}
              </Suspense>
            </div>

            <Suspense fallback={<div />}>
              <ProcessStrip />
              <InquiryForm />
            </Suspense>
          </main>

          <Suspense fallback={<div />}>
            <SiteFooter />
          </Suspense>
        </div>
      </SmoothScroll>
    </ErrorBoundary>
  )
}

export default AppShell
