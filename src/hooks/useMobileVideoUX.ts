import { useEffect, useState } from 'react';

/** Mobile-style UX: tap-to-play poster (vs hover on desktop). */
export function detectMobileVideoUX(): boolean {
  if (typeof window === 'undefined') return false;

  const narrow = window.innerWidth < 768;
  const ua = navigator.userAgent;
  const phoneLike = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const iPad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  return narrow || phoneLike || iPad;
}

/**
 * `true` when we should show poster + play overlay instead of hover-to-play
 * (narrow viewport OR common mobile / tablet user agents).
 */
export function useMobileVideoUX(): boolean {
  const [isMobile, setIsMobile] = useState(detectMobileVideoUX);

  useEffect(() => {
    const onResize = () => setIsMobile(detectMobileVideoUX());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isMobile;
}
