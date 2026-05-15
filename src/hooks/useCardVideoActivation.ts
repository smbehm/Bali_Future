import { useCallback, useMemo } from 'react';
import { useHoverVideo } from '../contexts/HoverVideoContext';

const canHover =
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * Desktop: hover/focus activates card video.
 * Touch: tap toggles (hover-only events do not fire on iOS/Android).
 */
export function useCardVideoActivation(cardId: string) {
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
      canHover
        ? {
            onMouseEnter: activate,
            onMouseLeave: deactivate,
            onFocus: activate,
            onBlur: deactivate,
          }
        : {
            onClick: toggle,
          },
    [activate, deactivate, toggle],
  );

  return { isActive, handlers, tabIndex: canHover ? undefined : 0 };
}
