import { useEffect, useRef, useState } from 'react'

export function useHeroMediaVisibility<T extends HTMLElement>(
  threshold = 0.35,
) {
  const ref = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}
