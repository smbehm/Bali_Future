/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type HoverVideoApi = {
  activeCardId: string | null;
  setActiveCard: (id: string | null) => void;
};

const HoverVideoContext = createContext<HoverVideoApi | null>(null);

export function HoverVideoProvider({ children }: { children: ReactNode }) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const setActiveCard = useCallback((id: string | null) => {
    setActiveCardId(id);
  }, []);

  const value = useMemo(
    () => ({ activeCardId, setActiveCard }),
    [activeCardId, setActiveCard],
  );

  return <HoverVideoContext.Provider value={value}>{children}</HoverVideoContext.Provider>;
}

export function useHoverVideo(): HoverVideoApi {
  const ctx = useContext(HoverVideoContext);
  if (!ctx) {
    throw new Error('useHoverVideo must be used within HoverVideoProvider');
  }
  return ctx;
}
