import festLogo from '../assets/logo/logo-cropped.png?format=avif&w=400&q=65&as=url'
import type { BrandData } from '../types'

export const brand: BrandData = {
  name: 'FEST Dance Company',
  shortName: 'FEST',
  logo: festLogo,
  claim: 'Ruch łączy się z wizją',
  intro:
    'FEST Dance Company to miejsce, w którym ruch łączy się z wizją. Tworzymy choreografie do teledysków, koncertów, kampanii reklamowych oraz eventów specjalnych. W naszych projektach łączymy różne style tańca, aby najlepiej dopasować się do charakteru marki i wydarzenia.',
  ctaPrimary: 'Umów konsultację',
  ctaSecondary: 'Zobacz portfolio',
  socialLinks: [
    { label: 'Instagram', href: 'https://www.instagram.com/fest_dancecompany' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@fest.dancecompany' },
  ],
} as const
