import { useCallback, useEffect, useMemo, useRef, type RefCallback } from 'react';
import { useHoverVideo } from '../contexts/HoverVideoContext';
import { usePrefersHover } from './usePrefersHover';

type CardVideoActivationOptions = {
  /** Touch only: never auto-play when scrolled into view (tap to play). */
  disableTouchAutoPlay?: boolean;
};

/**
 * Desktop: hover/focus activates card video.
 * Touch: tap toggles; optional in-view auto-activate unless disabled.
 */
export function useCardVideoActivation(cardId: string, options?: CardVideoActivationOptions) {
  const prefersHover = usePrefersHover();
  const { activeCardId, setActiveCard } = useHoverVideo();
  const isActive = activeCardId === cardId;
  const cardRef = useRef<HTMLElement | null>(null);
  const activeCardIdRef = useRef(activeCardId);
  activeCardIdRef.current = activeCardId;

  const activate = useCallback(() => setActiveCard(cardId), [cardId, setActiveCard]);
  const deactivate = useCallback(() => {
    if (activeCardId === cardId) setActiveCard(null);
  }, [activeCardId, cardId, setActiveCard]);

  const toggle = useCallback(() => {
    setActiveCard(activeCardId === cardId ? null : cardId);
  }, [activeCardId, cardId, setActiveCard]);

  useEffect(() => {
    if (prefersHover || options?.disableTouchAutoPlay) return;

    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          setActiveCard(cardId);
        } else if (!entry.isIntersecting && activeCardIdRef.current === cardId) {
          setActiveCard(null);
        }
      },
      { threshold: [0, 0.25, 0.4, 0.55] },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersHover, cardId, setActiveCard, options?.disableTouchAutoPlay]);

  const handlers = useMemo(
    () =>
      prefersHover
        ? {
            onMouseEnter: activate,
            onMouseLeave: deactivate,
            onFocus: activate,
            onBlur: deactivate,
          }
        : {
            onClick: toggle,
          },
    [activate, deactivate, toggle, prefersHover],
  );

  const setRef: RefCallback<HTMLElement> = useCallback((node) => {
    cardRef.current = node;
  }, []);

  return {
    isActive,
    handlers,
    tabIndex: prefersHover ? undefined : 0,
    prefersHover,
    ref: setRef,
  };
}
