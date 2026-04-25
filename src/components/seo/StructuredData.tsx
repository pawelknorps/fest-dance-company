import { brand } from '../../data/brand'
import { contact } from '../../data/contact'
import { portfolio } from '../../data/portfolio'
import { useTranslation } from '../../lib/i18n'
import { Helmet } from 'react-helmet-async'

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
    sameAs: [...sameAs, 'https://www.instagram.com/fest_dance_company/', 'https://vimeo.com/festdance', 'https://www.linkedin.com/company/fest-dance-company'],
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
        creator: {
          '@type': 'Organization',
          name: brand.name
        },
        image: `https://festdance.company${item.image.src}`,
        description: `${item.role} for ${item.client} in ${item.category} category.`
      }
    }))
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(creativeWorkSchema)}
      </script>
    </Helmet>
  )
}
