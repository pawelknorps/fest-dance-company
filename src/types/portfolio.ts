import type { MediaAsset } from './media'

export interface PortfolioItem {
  id: string
  category: string
  title: string
  image: MediaAsset
  optionalVideo?: string
  role: string
  client: string
  thumbHash?: string
}
