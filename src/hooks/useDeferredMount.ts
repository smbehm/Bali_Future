import { useEffect, useState } from 'react';

/**
 * Defers mounting heavy UI (WebGL, large iframes) until after first paint + idle time.
 * Uses a longer delay on touch devices where Safari struggles with initial JS/WebGL.
 */
export function useDeferredMount(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const activate = () => {
      if (!cancelled) setReady(true);
    };

    const isTouch =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches;

    const schedule = () => {
      const idleTimeout = isTouch ? 3500 : 1500;
      const ric = window.requestIdleCallback;

      if (ric) {
        ric(activate, { timeout: idleTimeout });
      } else {
        window.setTimeout(activate, isTouch ? 2000 : 600);
      }
    };

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
