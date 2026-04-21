import type { MediaAsset } from './media'

export interface ServiceCard {
  id: string
  slug: string
  title: string
  shortCopy: string
  longCopy: string
  coverImage: MediaAsset
  tags: string[]
}
