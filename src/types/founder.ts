import type { MediaAsset } from './media'

export interface FounderData {
  name: string
  eyebrow: string
  portrait: MediaAsset
  bio: string[]
  metrics: Array<{ value: string; label: string }>
}
