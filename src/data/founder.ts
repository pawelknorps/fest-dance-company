import founderPortrait from '../assets/images/10-2.jpg?format=webp&w=800&q=75&as=url'
import founderPortraitMobile from '../assets/images/10-2.jpg?format=webp&w=500&q=70&as=url'
import type { FounderData } from '../types'

export const founder: FounderData = {
  eyebrow: 'Choreograf',
  name: 'Inia Nuckowska',
  portrait: {
    src: founderPortrait,
    srcMobile: founderPortraitMobile,
    alt: 'Portret Inii Nuckowskiej - Założycielka FEST Dance Company',
    width: 5427,
    height: 8137,
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
