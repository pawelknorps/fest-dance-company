import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { brand } from '../../data/brand'
import { contact } from '../../data/contact'
import { MagneticButton } from '../ui/MagneticButton'
import { useI18n, useTranslation } from '../../lib/i18n'

function LanguageToggle() {
  const { lang, setLang } = useI18n()
  
  return (
    <>
      <button 
        onClick={() => setLang('pl')}
        className={`hover:text-white transition-colors p-2 min-w-[48px] min-h-[48px] flex items-center justify-center ${lang === 'pl' ? 'text-white' : ''}`}
      >
        PL
      </button>
      <span className="opacity-20">/</span>
      <button 
        onClick={() => setLang('en')}
        className={`hover:text-white transition-colors p-2 min-w-[48px] min-h-[48px] flex items-center justify-center ${lang === 'en' ? 'text-white' : ''}`}
      >
        EN
      </button>
    </>
  )
}

type SiteHeaderProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

export function SiteHeader({ open, setOpen }: SiteHeaderProps) {
  const t = useTranslation()
  const navItems = [
    { label: t.navServices, href: '#oferta' },
    { label: t.navFounder, href: '#founder' },
    { label: t.navPortfolio, href: '#portfolio' },
    { label: t.navContact, href: '#kontakt' },
  ]

  // Block scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Dark header bg activates once user scrolls past the hero
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Track header height for precise scroll offsets
  const headerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!headerRef.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height
        document.documentElement.style.setProperty('--header-height', `${height}px`)
      }
    })

    observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* ── Fixed header bar ── */}
      <header
        ref={headerRef}
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#070707]/88 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.06)]'
            : 'bg-[linear-gradient(180deg,rgba(7,7,9,0.68),rgba(7,7,9,0.08))]'
        }`}
      >
        <div className={`mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 transition-all duration-500 md:px-8 ${
          scrolled ? 'h-12 md:h-14' : 'h-20 md:h-24'
        }`}>

          {/* Left side: Logo + Language */}
          <div className="flex items-center gap-6">
            <a href="#top" className="pointer-events-auto inline-flex items-center min-h-[48px]">
              <img
                src={brand.logo}
                alt="FEST Dance Company"
                loading="eager"
                fetchPriority="high"
                style={{ filter: 'drop-shadow(0 0 18px rgba(200,80,255,0.28))' }}
                className={`w-auto object-contain object-left opacity-92 transition-all duration-500 ${
                  scrolled ? 'h-6 md:h-7' : 'h-8 md:h-9'
                }`}
              />
            </a>

            {/* Language Switcher */}
            <div className={`pointer-events-auto flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 transition-all duration-500 ${
              scrolled ? 'ml-4' : 'ml-6 md:ml-10'
            }`}>
              <LanguageToggle />
            </div>
          </div>

          {/* Right side: Socials + Hamburger */}
          <div className="flex items-center gap-6">
            {/* Socials - Visible on Desktop */}
            <div className="hidden md:flex items-center gap-4 pointer-events-auto">
              {brand.socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Hamburger button */}
            <MagneticButton
              hitPadding={24}
              className="pointer-events-auto"
              onClick={() => setOpen(!open)}
            >
              <button
                type="button"
                data-cursor={t.cursorMenu}
                aria-expanded={open}
                aria-label={open ? t.menuClose : t.menuOpen}
                className={`flex items-center justify-center rounded-full border border-white/16 bg-white/4 backdrop-blur-sm transition-all duration-500 hover:border-white/32 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                  scrolled ? 'h-10 w-10 md:h-11 md:w-11' : 'h-14 w-14 md:h-15 md:w-15'
                }`}
              >
                <span className={`relative block transition-all duration-500 ${scrolled ? 'h-3.5 w-4.5' : 'h-5 w-6'}`}>
                  <span className={`absolute left-0 top-0 h-[1.5px] w-full bg-white transition-all duration-300 ${open ? 'translate-y-[9px] rotate-45' : ''}`} />
                  <span className={`absolute left-0 h-[1.5px] w-full bg-white transition-all duration-300 ${scrolled ? 'top-[6px]' : 'top-[9px]'} ${open ? 'opacity-0 scale-x-0' : ''}`} />
                  <span className={`absolute left-0 h-[1.5px] w-full bg-white transition-all duration-300 ${scrolled ? 'top-[12px]' : 'top-[18px]'} ${open ? '-translate-y-[9px] -rotate-45' : ''}`} />
                </span>
              </button>
          </MagneticButton>
        </div>
      </div>
    </header>

      {/* ── Full-screen nav overlay ── */}
      <AnimatePresence>
        {open && (
          <m.aside
            key="nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[60] bg-[#060606]/98 backdrop-blur-2xl"
          >
            {/* Ambient Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[radial-gradient(circle_at_center,rgba(255,88,248,0.25)_0%,transparent_70%)] blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle_at_center,rgba(168,63,255,0.2)_0%,transparent_70%)] blur-[100px]" />
            </div>

            <m.nav
              initial={{ opacity: 0, scale: 0.98, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 1.02, x: 10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative ml-auto flex h-full max-w-2xl flex-col justify-between px-8 py-24 md:px-14 xl:px-20"
            >
              {/* Secondary Close Button - Top Right */}
              <div className="absolute top-8 right-8">
                <MagneticButton hitPadding={32} onClick={() => setOpen(false)}>
                  <button className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="relative h-4 w-4">
                        <span className="absolute inset-0 bg-white h-[1px] w-full top-1/2 -translate-y-1/2 rotate-45" />
                        <span className="absolute inset-0 bg-white h-[1px] w-full top-1/2 -translate-y-1/2 -rotate-45" />
                    </span>
                  </button>
                </MagneticButton>
              </div>

              {/* Nav links — RIGHT-aligned */}
              <div className="flex flex-col items-end gap-2 md:gap-4 pt-10">
                {navItems.map((item, i) => (
                  <m.a
                    key={item.href}
                    href={item.href}
                    data-cursor={t.cursorLink}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, y: 30, rotateX: -20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative inline-flex items-center font-display text-[clamp(2.5rem,7vw,5rem)] uppercase tracking-[0.06em] text-white transition-all hover:text-fuchsia-300"
                  >
                    <span className="absolute -left-12 opacity-0 transition-all duration-500 group-hover:-left-16 group-hover:opacity-100 text-sm tracking-[0.4em] text-fuchsia-400">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="text-glow">{item.label}</span>
                  </m.a>
                ))}
              </div>

              {/* Bottom Section: Socials & Contact */}
              <div className="mt-auto grid gap-10 border-t border-white/10 pt-10 md:grid-cols-2 md:items-end">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4">{t.contactLabel}</p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm tracking-[0.1em] text-white/60 transition-colors hover:text-white"
                    >
                      {contact.email}
                    </a>
                </div>
                <div className="flex flex-wrap justify-start md:justify-end gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
                    {brand.socialLinks.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-fuchsia-400"
                    >
                        {item.label}
                    </a>
                    ))}
                </div>
              </div>
            </m.nav>
          </m.aside>
        )}
      </AnimatePresence>
    </>
  )
}
