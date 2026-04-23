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
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      lerp: 0.1,
    });

    // Handle anchor links with extra stability for Three.js sections
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      
      if (anchor && anchor.hash && anchor.origin === window.location.origin) {
        const targetId = anchor.hash.slice(1);
        const element = document.getElementById(targetId);
        
        if (element) {
          e.preventDefault();
          
          // SOTA: Signal portfolio to pre-warm if that's where we are going
          if (targetId === 'portfolio' && typeof window.__fest_trigger_portfolio === 'function') {
            window.__fest_trigger_portfolio();
          }
          
          // Force Lenis to recalculate dimensions right before scrolling
          lenis.dimensions.onWindowResize();
          
          lenis.scrollTo(element, {
            offset: 0,
            duration: 1.5,
            immediate: false,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });

    let frameId = 0;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    
    frameId = requestAnimationFrame(raf);

    // Immediate and deferred hash handling for deep links
    const handleInitialHash = () => {
      if (window.location.hash) {
        const targetId = window.location.hash.slice(1);
        if (targetId === 'portfolio' && typeof window.__fest_trigger_portfolio === 'function') {
          window.__fest_trigger_portfolio();
        }
        const element = document.querySelector(window.location.hash);
        if (element) {
          lenis.scrollTo(element as HTMLElement, { immediate: true });
        }
      }
    };

    // Try multiple times to catch late-loading Three.js height changes
    handleInitialHash();
    const t1 = setTimeout(handleInitialHash, 200);
    const t2 = setTimeout(handleInitialHash, 800);
    const t3 = setTimeout(handleInitialHash, 2000);

    // Refresh Lenis on window resize and any DOM mutations
    const resizeObserver = new ResizeObserver(() => {
      lenis.dimensions.onWindowResize();
    });
    resizeObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('click', handleAnchorClick, { capture: true });
      resizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
