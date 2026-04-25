import { EffectComposer, Vignette } from '@react-three/postprocessing'

/**
 * SOTA Deferred Effects
 * Only link and compile shaders after Priority 1 textures are active.
 */
export function PortfolioEffects() {
  return (
    <EffectComposer>
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
    </EffectComposer>
  )
}

export default PortfolioEffects
