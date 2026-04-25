import { PlaneGeometry } from 'three'

/**
 * SOTA Resource Atlas
 * Static pre-allocation of geometries and shared buffers.
 * Eliminates CPU overhead during React hydration of the portfolio.
 */
class ResourceAtlas {
  public desktopPlane: PlaneGeometry
  public mobilePlane: PlaneGeometry

  constructor() {
    this.desktopPlane = new PlaneGeometry(1, 1, 24, 24)
    this.mobilePlane = new PlaneGeometry(1, 1, 12, 12)
  }

  public dispose() {
    this.desktopPlane.dispose()
    this.mobilePlane.dispose()
  }
}

export const resourceAtlas = new ResourceAtlas()
