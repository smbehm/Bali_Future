import { createContext, useContext, type ReactNode } from 'react';
import { useSectionInView } from '../hooks/useSectionInView';

type WebGLSceneContextValue = {
  /** True while the Donation Tree section intersects the viewport (hero tree must stay off). */
  donationTreeActive: boolean;
};

const WebGLSceneContext = createContext<WebGLSceneContextValue>({
  donationTreeActive: false,
});

export function WebGLSceneProvider({ children }: { children: ReactNode }) {
  const donationTreeActive = useSectionInView('tree-of-future', {
    threshold: 0,
    rootMargin: '48px 0px',
  });

  return (
    <WebGLSceneContext.Provider value={{ donationTreeActive }}>
      {children}
    </WebGLSceneContext.Provider>
  );
}

export function useWebGLScene() {
  return useContext(WebGLSceneContext);
}
