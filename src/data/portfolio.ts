import portfolio1 from '../assets/images/portfolio-1.JPG?format=webp&w=600&q=80&as=url'
import portfolio1Mobile from '../assets/images/portfolio-1.JPG?format=webp&w=400&q=80&as=url'
import portfolio2 from '../assets/images/portfolio-2.JPG?format=webp&w=600&q=80&as=url'
import portfolio2Mobile from '../assets/images/portfolio-2.JPG?format=webp&w=400&q=80&as=url'
import portfolio3 from '../assets/images/portfolio-3.JPG?format=webp&w=600&q=80&as=url'
import portfolio3Mobile from '../assets/images/portfolio-3.JPG?format=webp&w=400&q=80&as=url'
import portfolio4 from '../assets/images/portfolio-4.JPG?format=webp&w=600&q=80&as=url'
import portfolio4Mobile from '../assets/images/portfolio-4.JPG?format=webp&w=400&q=80&as=url'
import portfolio5 from '../assets/images/portfolio-5.JPG?format=webp&w=600&q=80&as=url'
import portfolio5Mobile from '../assets/images/portfolio-5.JPG?format=webp&w=400&q=80&as=url'
import portfolio6 from '../assets/images/portfolio-6.JPG?format=webp&w=600&q=80&as=url'
import portfolio6Mobile from '../assets/images/portfolio-6.JPG?format=webp&w=400&q=80&as=url'
import portfolio7 from '../assets/images/portfolio-7.JPG?format=webp&w=600&q=80&as=url'
import portfolio7Mobile from '../assets/images/portfolio-7.JPG?format=webp&w=400&q=80&as=url'
import portfolio8 from '../assets/images/portfolio-8.JPG?format=webp&w=600&q=80&as=url'
import portfolio8Mobile from '../assets/images/portfolio-8.JPG?format=webp&w=400&q=80&as=url'
import reelBts from '../assets/images/service-campaigns.jpeg?format=webp&w=1000&q=80&as=url'
import reelBtsMobile from '../assets/images/service-campaigns.jpeg?format=webp&w=600&q=80&as=url'
import type { PortfolioItem } from '../types'

export const featuredReel = {
  image: {
    src: reelBts,
    srcMobile: reelBtsMobile,
    alt: 'Backstage showreel FEST Dance Company - Premium Movement Direction',
    width: 4016,
    height: 6016,
  },
  title: 'Showreel / movement direction',
  copy:
    'Movement direction & choreography highlights. Zobacz przekrój naszych realizacji dla artystów, marek i wydarzeń specjalnych.',
}

export const portfolio: PortfolioItem[] = [
  {
    id: 'p1',
    category: 'Koncerty',
    title: 'Urban Motion',
    image: {
      src: portfolio1,
      srcMobile: portfolio1Mobile,
      alt: 'Portfolio work 1 - FEST Dance Company',
      width: 2480,
      height: 3307,
    },
    role: 'Choreografia',
    client: 'Live Project',
  },
  {
    id: 'p2',
    category: 'Teledyski',
    title: 'Studio Essence',
    image: {
      src: portfolio2,
      srcMobile: portfolio2Mobile,
      alt: 'Portfolio work 2 - FEST Dance Company',
      width: 4000,
      height: 6000,
    },
    role: 'Movement direction',
    client: 'Music Production',
  },
  {
    id: 'p3',
    category: 'Eventy',
    title: 'Flow State',
    image: {
      src: portfolio3,
      srcMobile: portfolio3Mobile,
      alt: 'Portfolio work 3 - FEST Dance Company',
      width: 5560,
      height: 3707,
    },
    role: 'Performance',
    client: 'Corporate Event',
  },
  {
    id: 'p4',
    category: 'Kampanie',
    title: 'Rhythmic Frames',
    image: {
      src: portfolio4,
      srcMobile: portfolio4Mobile,
      alt: 'Portfolio work 4 - FEST Dance Company',
      width: 5716,
      height: 3811,
    },
    role: 'Choreografia',
    client: 'Brand Identity',
  },
  {
    id: 'p5',
    category: 'Teledyski',
    title: 'Portrait of Move',
    image: {
      src: portfolio5,
      srcMobile: portfolio5Mobile,
      alt: 'Portfolio work 5 - FEST Dance Company',
      width: 1170,
      height: 1453,
    },
    role: 'Movement direction',
    client: 'Visual Concept',
  },
  {
    id: 'p6',
    category: 'Eventy',
    title: 'Event Horizon',
    image: {
      src: portfolio6,
      srcMobile: portfolio6Mobile,
      alt: 'Portfolio work 6 - FEST Dance Company',
      width: 567,
      height: 423,
    },
    role: 'Performance',
    client: 'Gala Night',
  },
  {
    id: 'p7',
    category: 'Koncerty',
    title: 'Static Pulse',
    image: {
      src: portfolio7,
      srcMobile: portfolio7Mobile,
      alt: 'Portfolio work 7 - FEST Dance Company',
      width: 567,
      height: 423,
    },
    role: 'Choreografia',
    client: 'Stage Design',
  },
  {
    id: 'p8',
    category: 'Kampanie',
    title: 'Kinetic Study',
    image: {
      src: portfolio8,
      srcMobile: portfolio8Mobile,
      alt: 'Portfolio work 8 - FEST Dance Company',
      width: 567,
      height: 423,
    },
    role: 'Movement direction',
    client: 'Ad Campaign',
  },
]
