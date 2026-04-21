import { useInView } from 'framer-motion'
import { useRef } from 'react'

type UseScrollRevealOptions = {
  once?: boolean
  margin?: string
}

export function useScrollReveal<T extends HTMLElement>({
  once = true,
  margin = '-12% 0px',
}: UseScrollRevealOptions = {}) {
  const ref = useRef<T | null>(null)
  const inView = useInView(ref, { once, margin: margin as never })

  return { ref, inView }
}
