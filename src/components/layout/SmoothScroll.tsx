import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';

function ScrollLogic({ children }: { children: ReactNode }) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // Handle anchor links with extra stability for Three.js sections
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      
      if (anchor && anchor.hash && anchor.origin === window.location.origin) {
        const targetId = anchor.hash.slice(1);
        const element = document.getElementById(targetId);
        
        if (element) {
          e.preventDefault();
          
          // Force Lenis to recalculate dimensions right before scrolling
          lenis.resize();
          
          const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0;
          
          lenis.scrollTo(element, {
            offset: -headerOffset,
            duration: 1.5,
            immediate: false,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });

    // Immediate and deferred hash handling for deep links
    const handleInitialHash = () => {
      if (window.location.hash) {
        const element = document.querySelector(window.location.hash);
        if (element) {
          const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0;
          lenis.scrollTo(element as HTMLElement, { 
            offset: -headerOffset,
            immediate: true 
          });
        }
      }
    };

    handleInitialHash();
    const t1 = setTimeout(handleInitialHash, 200);
    const t2 = setTimeout(handleInitialHash, 800);
    const t3 = setTimeout(handleInitialHash, 2000);

    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [lenis]);

  return <>{children}</>;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  // Check for reduced motion preference
  const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  
  if (media?.matches) {
    return <>{children}</>;
  }

  return (
    <ReactLenis 
      root 
      options={{
        duration: 1.0,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        lerp: 0.12,
      }}
    >
      <ScrollLogic>
        {children}
      </ScrollLogic>
    </ReactLenis>
  );
}
