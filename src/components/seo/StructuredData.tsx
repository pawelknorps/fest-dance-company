import { brand } from '../../data/brand'
import { contact } from '../../data/contact'
import { portfolio } from '../../data/portfolio'
import { useTranslation } from '../../lib/i18n'

export function StructuredData() {
  const t = useTranslation()
  const sameAs = brand.socialLinks
    .map(link => link.href)
    .filter(link => /^https?:\/\/[^/]+\/.+/.test(link))

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    url: 'https://festdance.company',
    logo: `https://festdance.company${brand.logo}`,
    description: t.intro,
    sameAs,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'inquiry',
      email: contact.email
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
    </>
  )
}
