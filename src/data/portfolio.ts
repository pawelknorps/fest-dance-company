import portfolio1 from '../assets/images/portfolio-1.jpg?format=webp&w=600&q=75&as=url'
import portfolio1Mobile from '../assets/images/portfolio-1.jpg?format=webp&w=400&q=75&as=url'
import portfolio2 from '../assets/images/portfolio-2.jpg?format=webp&w=600&q=75&as=url'
import portfolio2Mobile from '../assets/images/portfolio-2.jpg?format=webp&w=400&q=75&as=url'
import portfolio3 from '../assets/images/portfolio-3.jpg?format=webp&w=600&q=75&as=url'
import portfolio3Mobile from '../assets/images/portfolio-3.jpg?format=webp&w=400&q=75&as=url'
import portfolio4 from '../assets/images/portfolio-4.jpg?format=webp&w=600&q=75&as=url'
import portfolio4Mobile from '../assets/images/portfolio-4.jpg?format=webp&w=400&q=75&as=url'
import portfolio5 from '../assets/images/portfolio-5.jpg?format=webp&w=600&q=75&as=url'
import portfolio5Mobile from '../assets/images/portfolio-5.jpg?format=webp&w=400&q=75&as=url'
import portfolio6 from '../assets/images/portfolio-6.jpg?format=webp&w=600&q=75&as=url'
import portfolio6Mobile from '../assets/images/portfolio-6.jpg?format=webp&w=400&q=75&as=url'
import portfolio7 from '../assets/images/portfolio-7.jpg?format=webp&w=600&q=75&as=url'
import portfolio7Mobile from '../assets/images/portfolio-7.jpg?format=webp&w=400&q=75&as=url'
import portfolio8 from '../assets/images/portfolio-8.jpg?format=webp&w=600&q=75&as=url'
import portfolio8Mobile from '../assets/images/portfolio-8.jpg?format=webp&w=400&q=75&as=url'
import reelBts from '../assets/images/service-campaigns.jpeg?format=avif&w=800&q=65&as=url'
import reelBtsMobile from '../assets/images/service-campaigns.jpeg?format=avif&w=600&q=60&as=url'
import { thumbHashes } from './generated-thumbnails'
import { portfolioMetadata } from './portfolio-metadata'
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
    thumbHash: portfolioMetadata['portfolio-1'].thumbHash,
    image: {
      src: portfolioMetadata['portfolio-1'].ktx2,
      srcMobile: portfolioMetadata['portfolio-1'].avif,
      alt: 'Portfolio work 1 - FEST Dance Company',
      width: portfolioMetadata['portfolio-1'].width,
      height: portfolioMetadata['portfolio-1'].height,
    },
    role: 'Choreografia',
    client: 'Live Project',
  },
  {
    id: 'p2',
    category: 'Teledyski',
    title: 'Studio Essence',
    thumbHash: portfolioMetadata['portfolio-2'].thumbHash,
    image: {
      src: portfolioMetadata['portfolio-2'].ktx2,
      srcMobile: portfolioMetadata['portfolio-2'].avif,
      alt: 'Portfolio work 2 - FEST Dance Company',
      width: portfolioMetadata['portfolio-2'].width,
      height: portfolioMetadata['portfolio-2'].height,
    },
    role: 'Movement direction',
    client: 'Music Production',
  },
  {
    id: 'p3',
    category: 'Eventy',
    title: 'Flow State',
    thumbHash: portfolioMetadata['portfolio-3'].thumbHash,
    image: {
      src: portfolioMetadata['portfolio-3'].ktx2,
      srcMobile: portfolioMetadata['portfolio-3'].avif,
      alt: 'Portfolio work 3 - FEST Dance Company',
      width: portfolioMetadata['portfolio-3'].width,
      height: portfolioMetadata['portfolio-3'].height,
    },
    role: 'Performance',
    client: 'Corporate Event',
  },
  {
    id: 'p4',
    category: 'Kampanie',
    title: 'Rhythmic Frames',
    thumbHash: portfolioMetadata['portfolio-4'].thumbHash,
    image: {
      src: portfolioMetadata['portfolio-4'].ktx2,
      srcMobile: portfolioMetadata['portfolio-4'].avif,
      alt: 'Portfolio work 4 - FEST Dance Company',
      width: portfolioMetadata['portfolio-4'].width,
      height: portfolioMetadata['portfolio-4'].height,
    },
    role: 'Choreografia',
    client: 'Brand Identity',
  },
  {
    id: 'p5',
    category: 'Teledyski',
    title: 'Portrait of Move',
    thumbHash: portfolioMetadata['portfolio-5'].thumbHash,
    image: {
      src: portfolioMetadata['portfolio-5'].ktx2,
      srcMobile: portfolioMetadata['portfolio-5'].avif,
      alt: 'Portfolio work 5 - FEST Dance Company',
      width: portfolioMetadata['portfolio-5'].width,
      height: portfolioMetadata['portfolio-5'].height,
    },
    role: 'Movement direction',
    client: 'Visual Concept',
  },
  {
    id: 'p6',
    category: 'Eventy',
    title: 'Event Horizon',
    thumbHash: portfolioMetadata['portfolio-6'].thumbHash,
    image: {
      src: portfolioMetadata['portfolio-6'].ktx2,
      srcMobile: portfolioMetadata['portfolio-6'].avif,
      alt: 'Portfolio work 6 - FEST Dance Company',
      width: portfolioMetadata['portfolio-6'].width,
      height: portfolioMetadata['portfolio-6'].height,
    },
    role: 'Performance',
    client: 'Gala Night',
  },
  {
    id: 'p7',
    category: 'Koncerty',
    title: 'Static Pulse',
    thumbHash: portfolioMetadata['portfolio-7'].thumbHash,
    image: {
      src: portfolioMetadata['portfolio-7'].ktx2,
      srcMobile: portfolioMetadata['portfolio-7'].avif,
      alt: 'Portfolio work 7 - FEST Dance Company',
      width: portfolioMetadata['portfolio-7'].width,
      height: portfolioMetadata['portfolio-7'].height,
    },
    role: 'Choreografia',
    client: 'Stage Design',
  },
  {
    id: 'p8',
    category: 'Kampanie',
    title: 'Kinetic Study',
    thumbHash: portfolioMetadata['portfolio-8'].thumbHash,
    image: {
      src: portfolioMetadata['portfolio-8'].ktx2,
      srcMobile: portfolioMetadata['portfolio-8'].avif,
      alt: 'Portfolio work 8 - FEST Dance Company',
      width: portfolioMetadata['portfolio-8'].width,
      height: portfolioMetadata['portfolio-8'].height,
    },
    role: 'Movement direction',
    client: 'Ad Campaign',
  },
]
