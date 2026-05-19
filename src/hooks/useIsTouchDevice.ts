import { useEffect, useState } from 'react';

function readIsTouchDevice(): boolean {
  if (typeof window === 'undefined') return true;
  return !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/**
 * True on phones/tablets (no fine-pointer hover).
 * Sync read on first client paint avoids mounting inline video before hydration.
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(readIsTouchDevice);

  useEffect(() => {
    const desktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setIsTouch(!desktopPointer.matches);
    update();
    desktopPointer.addEventListener('change', update);
    return () => desktopPointer.removeEventListener('change', update);
  }, []);

  return isTouch;
}
