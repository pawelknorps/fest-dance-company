import { lazy, Suspense, useEffect, useRef, useState } from 'react'
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

const KineticPortfolio = lazy(() => import('../components/sections/KineticPortfolio').then(module => ({ default: module.KineticPortfolio })))

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <SmoothScroll>
      <LoadingScreen />
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
          {/* <ReelShowcase /> */}
          <DeferredPortfolio />
          {/* <PortfolioRail /> */}
          <ProcessStrip />
          <InquiryForm />
        </main>

        <SiteFooter />
      </div>
    </SmoothScroll>
  )
}

function DeferredPortfolio() {
  const [shouldLoad, setShouldLoad] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setShouldLoad(true)
        observer.disconnect()
      },
      { rootMargin: '1200px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={sentinelRef}>
      {shouldLoad ? (
        <Suspense fallback={<div className="relative h-[500vh] w-full bg-[#070410]" aria-hidden="true" />}>
          <KineticPortfolio />
        </Suspense>
      ) : (
        <div className="relative h-[500vh] w-full bg-[#070410]" aria-hidden="true" />
      )}
    </div>
  )
}
