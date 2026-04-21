import { MagneticButton } from './MagneticButton'
import { useTranslation } from '../../lib/i18n'

type PrimaryButtonProps = {
  href: string
  children: string
  variant?: 'solid' | 'ghost'
  className?: string
}

export function PrimaryButton({
  children,
  href,
  variant = 'solid',
  className = '',
}: PrimaryButtonProps) {
  const t = useTranslation()
  const baseStyles =
    'inline-flex min-w-44 items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.22em] transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4'

  const variants = {
    solid:
      'bg-[linear-gradient(135deg,#f0d6ff,#c77dff)] text-[#120815] shadow-[0_14px_40px_rgba(199,125,255,0.2)] hover:shadow-[0_18px_48px_rgba(199,125,255,0.28)] focus-visible:outline-fuchsia-300',
    ghost:
      'border border-white/16 bg-white/[0.03] text-white hover:border-white/28 hover:bg-white/[0.06] focus-visible:outline-white/40',
  }

  return (
    <MagneticButton hitPadding={32}>
      <a
        href={href}
        data-cursor={t.cursorClick}
        className={`${baseStyles} ${variants[variant]} ${className}`}
      >
        {children}
      </a>
    </MagneticButton>
  )
}
