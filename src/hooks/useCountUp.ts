import { useEffect, useState } from 'react';

/**
 * Counts from 0 to `target` over `durationMs` using requestAnimationFrame (starts on mount).
 */
export function useCountUp(target: number, durationMs: number): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue(0);
    if (durationMs <= 0) {
      setValue(target);
      return;
    }
    let start: number | null = null;
    let rafId = 0;

    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const t = Math.min(elapsed / durationMs, 1);
      setValue(Math.round(t * target));
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs]);

  return value;
}
