import { brand } from '../data/brand'
import { portfolio } from '../data/portfolio'
import { siteCopy } from '../content/site-copy'
import { services } from '../data/services'
import { processSteps } from '../data/process'
import { founder } from '../data/founder'

/**
 * SOTA Build-time Content Client
 * This abstraction allows switching between static files and Sanity.io
 * without refactoring the UI components.
 */
export const cmsClient = {
  getBrand: () => brand,
  getPortfolio: () => portfolio,
  getSiteCopy: () => siteCopy,
  getServices: () => services,
  getProcess: () => processSteps,
  getFounder: () => founder,
}
