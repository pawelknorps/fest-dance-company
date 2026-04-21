import { brand } from '../../data/brand'
import { portfolio } from '../../data/portfolio'
import { useTranslation } from '../../lib/i18n'

export function StructuredData() {
  const t = useTranslation()
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    url: 'https://festdance.company',
    logo: `https://festdance.company${brand.logo}`,
    description: t.intro,
    sameAs: brand.socialLinks.map(link => link.href),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'inquiry',
      email: 'hello@festdance.company'
    }
  }

  const creativeWorkSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Portfolio - FEST Dance Company',
    description: 'Featured choreography and movement direction projects.',
    itemListElement: portfolio.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: item.title,
        headline: item.title,
        alternativeHeadline: item.role,
        creator: {
          '@type': 'Organization',
          name: brand.name
        },
        publisher: {
          '@type': 'Organization',
          name: brand.name
        },
        genre: item.category,
        keywords: `${item.category}, ${item.role}, ${item.client}`,
        image: `https://festdance.company${item.image.src}`,
        description: `${item.role} for ${item.client} in ${item.category} category.`
      }
    }))
  }

  const videoObjectSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'FEST Dance Company Showreel',
    description: t.heroBody,
    thumbnailUrl: `https://festdance.company${portfolio[0].image.src}`,
    uploadDate: '2026-04-20T20:00:00Z',
    contentUrl: 'https://vimeo.com/festdancecompany', // Update with actual URL if available
    embedUrl: 'https://vimeo.com/festdancecompany'
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObjectSchema) }}
      />
    </>
  )
}
