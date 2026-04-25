import { EffectComposer } from '@react-three/postprocessing'
import { SOTAEffect } from '../../lib/SOTAEffect'

/**
 * SOTA Deferred Effects
 * Unified custom shader pass: Grain + Vignette + Displacement
 */
export function PortfolioEffects() {
  return (
    <EffectComposer disableNormalPass>
      <primitive object={new SOTAEffect({ 
        grainIntensity: 0.03,
        vignetteDarkness: 0,
        vignetteOffset: 0,
        distortion: 0.2
      })} />
    </EffectComposer>
  )
}


export default PortfolioEffects
