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

        <div className="space-y-4">
          <div className="flex gap-4">
            {brand.socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-[0.2em] text-fuchsia-400 hover:text-fuchsia-200 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="space-y-2 text-sm uppercase tracking-[0.24em] text-white/46">
            <p>{t.contactEmail}</p>
            <p>{contact.phone}</p>
            <p>{t.contactCity}</p>
            <p>{t.contactAvailability}</p>
            <a
              href="https://www.facebook.com/pawo161/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block pt-4 text-[0.72rem] tracking-[0.28em] text-fuchsia-300 transition duration-300 hover:text-fuchsia-200 hover:drop-shadow-[0_0_10px_rgba(232,121,249,0.95)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fuchsia-300"
            >
              Twórca: Paweł Knorps
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
