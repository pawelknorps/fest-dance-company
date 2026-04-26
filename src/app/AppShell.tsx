import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { SmoothScroll } from '../components/layout/SmoothScroll'
import { SiteHeader } from '../components/layout/SiteHeader'
import { HeroStage } from '../components/sections/HeroStage'
const ServiceGrid = lazy(() => import('../components/sections/ServiceGrid'))
const FounderFeature = lazy(() => import('../components/sections/FounderFeature'))
const CredibilityBand = lazy(() => import('../components/sections/CredibilityBand'))
const ProcessStrip = lazy(() => import('../components/sections/ProcessStrip'))
const InquiryForm = lazy(() => import('../components/sections/InquiryForm'))
const SiteFooter = lazy(() => import('../components/layout/SiteFooter'))
import { CustomCursor } from '../components/ui/CustomCursor'
import { StructuredData } from '../components/seo/StructuredData'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { ScrollProgress } from '../components/ui/ScrollProgress'
import { portfolio } from '../data/portfolio'
import { useDeviceTier, DeviceTier } from '../hooks/useDeviceTier'
import { useTranslation } from '../lib/i18n'
import { textureManager } from '../lib/TextureManager'


const KineticPortfolio = lazy(() => import('../components/sections/KineticPortfolio'))
const DOMKineticPortfolio = lazy(() => import('../components/sections/DOMKineticPortfolio'))

import { useScrollReveal } from '../hooks/useScrollReveal'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'

import { SemanticShadow } from '../components/seo/SemanticShadow'
import { Helmet } from 'react-helmet-async'

export function AppShell() {
  const t = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const tier = useDeviceTier()

  const { ref: portfolioRef, inView: portfolioInView } = useScrollReveal<HTMLDivElement>({ once: true, margin: '400px 0px' })

  useEffect(() => {
    // SOTA 2026: Ultra-aggressive hydration optimization
    // Only preload the very first texture on mobile to save TBT
    const isMobile = window.innerWidth < 768
    const preloadCount = isMobile ? 1 : 3

    if (tier !== DeviceTier.LOW) {
      const preloadItems = portfolio.slice(0, preloadCount).map(item => ({
        id: item.id,
        url: item.image.srcMobile || item.image.src,
        priority: 1 as const
      }))
      textureManager.preload(preloadItems)
    }
  }, [tier])


  return (
    <ErrorBoundary>
      <Helmet 
        htmlAttributes={{ lang: t.lang }}
      >
        <title>{t.metaTitle || 'FEST Dance Company | Choreography & Movement Direction'}</title>
        <meta name="description" content={t.metaDescription || 'Premium Choreography, Movement Direction & Performance Design for concerts, music videos, and fashion campaigns.'} />
        
        {/* SEO Language Prioritization */}
        <link rel="canonical" href="https://festdance.company" />
        <link rel="alternate" hrefLang="pl" href="https://festdance.company" />
        <link rel="alternate" hrefLang="x-default" href="https://festdance.company" />
        <link rel="alternate" hrefLang="en" href="https://festdance.company" />
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
            <Suspense fallback={<div className="min-h-[50dvh]" />}>
              <ServiceGrid />
              <FounderFeature />
              <CredibilityBand />
            </Suspense>
            
            <div id="portfolio" ref={portfolioRef}>
              <Suspense fallback={<div className="h-[100dvh] bg-[#05030a]" />}>
                {tier === DeviceTier.LOW ? (
                  <DOMKineticPortfolio />
                ) : (
                  <KineticPortfolio />
                )}
              </Suspense>
            </div>

            <Suspense fallback={<div className="min-h-[100dvh]" />}>
              <ProcessStrip />
              <InquiryForm />
            </Suspense>
          </main>

          <Suspense fallback={<div className="h-64" />}>
            <SiteFooter />
          </Suspense>
        </div>
      </SmoothScroll>
    </ErrorBoundary>
  )
}

export default AppShell
