import { useCallback, useMemo } from 'react';
import { useHoverVideo } from '../contexts/HoverVideoContext';
import { usePrefersHover } from './usePrefersHover';

/**
 * Desktop: hover/focus activates card video.
 * Touch: tap toggles (hover-only events do not fire on iOS/Android).
 */
export function useCardVideoActivation(cardId: string) {
  const prefersHover = usePrefersHover();
  const { activeCardId, setActiveCard } = useHoverVideo();
  const isActive = activeCardId === cardId;

  const activate = useCallback(() => setActiveCard(cardId), [cardId, setActiveCard]);
  const deactivate = useCallback(() => {
    if (activeCardId === cardId) setActiveCard(null);
  }, [activeCardId, cardId, setActiveCard]);

  const toggle = useCallback(() => {
    setActiveCard(activeCardId === cardId ? null : cardId);
  }, [activeCardId, cardId, setActiveCard]);

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

  return { isActive, handlers, tabIndex: prefersHover ? undefined : 0, prefersHover };
}
