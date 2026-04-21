import { useEffect, useRef } from 'react'
import lottieReact, { type LottieRefCurrentProps } from 'lottie-react'
import { heroParticlesLottie } from '../../content/hero-particles-lottie'

const Lottie = (
  lottieReact as unknown as { default: typeof lottieReact }
).default

type HeroLottieBackgroundProps = {
  isVisible: boolean
  prefersReducedMotion: boolean
}

export default function HeroLottieBackground({
  isVisible,
  prefersReducedMotion,
}: HeroLottieBackgroundProps) {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null)

  useEffect(() => {
    if (!lottieRef.current || prefersReducedMotion) {
      return
    }

    if (isVisible) {
      lottieRef.current.play()
      return
    }

    lottieRef.current.pause()
  }, [isVisible, prefersReducedMotion])

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={heroParticlesLottie}
      autoplay={!prefersReducedMotion}
      loop
      className="h-full w-full scale-[1.22]"
    />
  )
}
