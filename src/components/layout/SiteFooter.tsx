import { brand } from '../../data/brand'
import { contact } from '../../data/contact'
import { useTranslation } from '../../lib/i18n'

export function SiteFooter() {
  const t = useTranslation()
  return (
    <footer className="mx-auto w-full max-w-[1440px] px-5 pb-10 pt-6 md:px-6 xl:px-8">
      <div className="flex flex-col gap-8 border-t border-white/10 pt-6 md:flex-row md:items-end md:justify-between">
        <div>
          <img
            src={brand.logo}
            alt="FEST Dance Company - Premium Movement Design"
            className="h-auto w-[120px] drop-shadow-[0_0_20px_rgba(255,0,255,0.34)]"
          />
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/54">
            {t.footerLine}
          </p>
        </div>

        <div className="space-y-2 text-sm uppercase tracking-[0.24em] text-white/46">
          <p>{t.contactEmail}</p>
          <p>{contact.phone}</p>
          <p>{t.contactCity}</p>
          <p>{t.contactAvailability}</p>
        </div>
      </div>
    </footer>
  )
}
