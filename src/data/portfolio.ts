import portfolio1 from '../assets/images/portfolio-1.jpg?format=webp&w=800;1400&as=url'
import portfolio1SrcSet from '../assets/images/portfolio-1.jpg?format=webp&w=800;1400&as=srcset'
import portfolio2 from '../assets/images/portfolio-2.jpg?format=webp&w=800;1400&as=url'
import portfolio2SrcSet from '../assets/images/portfolio-2.jpg?format=webp&w=800;1400&as=srcset'
import portfolio3 from '../assets/images/portfolio-3.jpg?format=webp&w=600;1000&as=url'
import portfolio3SrcSet from '../assets/images/portfolio-3.jpg?format=webp&w=600;1000&as=srcset'
import portfolio4 from '../assets/images/portfolio-4.jpg?format=webp&w=600;1000&as=url'
import portfolio4SrcSet from '../assets/images/portfolio-4.jpg?format=webp&w=600;1000&as=srcset'
import portfolio5 from '../assets/images/portfolio-5.jpg?format=webp&w=600;1000&as=url'
import portfolio5SrcSet from '../assets/images/portfolio-5.jpg?format=webp&w=600;1000&as=srcset'
import portfolio6 from '../assets/images/portfolio-6.jpg?format=webp&w=600;1000&as=url'
import portfolio6SrcSet from '../assets/images/portfolio-6.jpg?format=webp&w=600;1000&as=srcset'
import reelBts from '../assets/images/reel-bts.jpeg?format=webp&w=800;1400&as=url'
import reelBtsSrcSet from '../assets/images/reel-bts.jpeg?format=webp&w=800;1400&as=srcset'
import type { PortfolioItem } from '../types'

export const featuredReel = {
  image: {
    src: reelBts,
    srcSet: reelBtsSrcSet,
    alt: 'Backstage showreel FEST Dance Company - Premium Movement Direction',
    width: 2048,
    height: 1536,
  },
  title: 'Showreel / movement direction',
  copy:
    'Movement direction & choreography highlights. Zobacz przekrój naszych realizacji dla artystów, marek i wydarzeń specjalnych.',
}

export const portfolio: PortfolioItem[] = [
  {
    id: 'p1',
    category: 'Koncerty',
    title: 'Stage energy studies',
    image: {
      src: portfolio1,
      srcSet: portfolio1SrcSet,
      alt: 'Performerka w dynamicznym kadrze scenicznym - FEST Choreografia',
      width: 1366,
      height: 2048,
    },
    role: 'Choreografia',
    client: 'Live artist format',
  },
  {
    id: 'p2',
    category: 'Teledyski',
    title: 'Camera-led gesture work',
    image: {
      src: portfolio2,
      srcSet: portfolio2SrcSet,
      alt: 'Grupa tancerek w kompozycji pod teledysk - Movement Direction FEST',
      width: 1366,
      height: 2048,
    },
    role: 'Movement direction',
    client: 'Music video concept',
  },
  {
    id: 'p3',
    category: 'Eventy',
    title: 'Performance entrance',
    image: {
      src: portfolio3,
      srcSet: portfolio3SrcSet,
      alt: 'Jasny kadr performance na evencie premium - FEST Dance Company',
      width: 567,
      height: 423,
    },
    role: 'Opening act',
    client: 'Premium event',
  },
  {
    id: 'p4',
    category: 'Kampanie',
    title: 'Brand rhythm frames',
    image: {
      src: portfolio4,
      srcSet: portfolio4SrcSet,
      alt: 'Rozmyty ruch budujący atmosferę kampanii reklamowej - FEST',
      width: 567,
      height: 423,
    },
    role: 'Performance concept',
    client: 'Campaign shoot',
  },
  {
    id: 'p5',
    category: 'Teledyski',
    title: 'Minimal movement score',
    image: {
      src: portfolio5,
      srcSet: portfolio5SrcSet,
      alt: 'Kadr ruchowy z miękkim światłem i sceniczną ekspresją - Choreografia FEST',
      width: 567,
      height: 423,
    },
    role: 'Set coaching',
    client: 'Visual storytelling',
  },
  {
    id: 'p6',
    category: 'Koncerty',
    title: 'Large format composition',
    image: {
      src: portfolio6,
      srcSet: portfolio6SrcSet,
      alt: 'Performatywny detal użyty jako materiał portfolio - FEST Dance',
      width: 567,
      height: 423,
    },
    role: 'Scenic movement',
    client: 'Concert performance',
  },
]
