import founderPortrait from '../assets/images/IMG_3587.jpg?format=webp&w=800;1200&as=url'
import founderSrcSet from '../assets/images/IMG_3587.jpg?format=webp&w=800;1200&as=srcset'
import type { FounderData } from '../types'

export const founder: FounderData = {
  eyebrow: 'Choreograf',
  name: 'Inia Nuckowska',
  portrait: {
    src: founderPortrait,
    srcSet: founderSrcSet,
    alt: 'Portret Inii Nuckowskiej - Założycielka FEST Dance Company',
    width: 1170,
    height: 1453,
  },
  bio: [
    'Licencjonowana choreograf i tancerka z ponad dziewiętnastoletnim doświadczeniem scenicznym oraz założycielka FEST Dance Company. Ukończyła z wyróżnieniem studia choreograficzne oraz liczne kursy i warsztaty.',
    'Od wielu lat prowadzi zajęcia taneczne w całej Polsce oraz pracuje z artystami przy tworzeniu ich indywidualnego ruchu scenicznego.',
    'Jej choreografie wyróżniają się połączeniem wielu stylów tanecznych, często z nieoczywistym wykorzystaniem elementów scenograficznych.',
  ],
  metrics: [
    { value: '19+', label: 'lat doświadczenia scenicznego' },
    { value: '4', label: 'filary oferty FDC' },
    { value: '360°', label: 'opieka nad ruchem i oprawą' },
  ],
}
