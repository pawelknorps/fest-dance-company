import { m } from 'framer-motion'
import { brand } from '../../data/brand'
import { MagneticButton } from '../ui/MagneticButton'

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-night px-6 text-center text-white">
      <m.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-[clamp(8rem,20vw,15rem)] leading-none text-white/5">
          404
        </h1>
        <div className="relative -mt-20 md:-mt-32">
          <p className="mb-8 text-xl font-medium tracking-[0.1em] text-fuchsia-300 md:text-2xl">
            Movement not found.
          </p>
          <p className="mx-auto mb-12 max-w-md text-sm leading-relaxed text-white/50 md:text-base">
            The stage you're looking for doesn't exist or has been moved to another coordinate.
          </p>
          
          <MagneticButton>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.3em] text-black transition-transform hover:scale-105"
            >
              Back to main stage
            </a>
          </MagneticButton>
        </div>
      </m.div>

      <div className="absolute bottom-12 opacity-20">
        <img src={brand.logo} alt="FEST" className="h-6 grayscale" />
      </div>
    </div>
  )
}
