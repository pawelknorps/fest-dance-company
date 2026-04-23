import { useEffect } from 'react';
import type { ReactNode } from 'react';
import Lenis from 'lenis';

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Check for reduced motion preference
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple-like easing
      smoothWheel: true,
      wheelMultiplier: 1,
      lerp: 0.1,
    });

    // Handle anchor links manually to ensure they work even during heavy loading
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.hash && anchor.origin === window.location.origin) {
        const element = document.querySelector(anchor.hash);
        if (element) {
          e.preventDefault();
          lenis.scrollTo(element as HTMLElement, {
            offset: 0,
            duration: 1.5,
            immediate: false,
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    let frameId = 0;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    
    frameId = requestAnimationFrame(raf);

    // Handle initial hash on load
    if (window.location.hash) {
      setTimeout(() => {
        const element = document.querySelector(window.location.hash);
        if (element) {
          lenis.scrollTo(element as HTMLElement, { immediate: true });
        }
      }, 800); // Wait for initial layout to stabilize
    }

    // Refresh Lenis on window resize and content changes
    const resizeObserver = new ResizeObserver(() => {
      lenis.dimensions.onWindowResize();
    });
    resizeObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('click', handleAnchorClick);
      resizeObserver.disconnect();
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
