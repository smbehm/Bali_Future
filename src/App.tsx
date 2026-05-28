import { lazy, Suspense } from 'react';
import { useWebGLScene } from './contexts/WebGLSceneContext';
import { useDeferredMount } from './hooks/useDeferredMount';
import Navbar from './components/Navbar';
import FloatingLeaves from './components/FloatingLeaves';
import Hero from './sections/Hero';
import SectionErrorBoundary from './components/SectionErrorBoundary';
import { HoverVideoProvider } from './contexts/HoverVideoContext';

const TreeBackground = lazy(() => import('./components/TreeBackground'));
const Mission = lazy(() => import('./sections/Mission'));
const OrphanageHomes = lazy(() => import('./sections/OrphanageHomes'));
const Impact = lazy(() => import('./sections/Impact'));
const TreeOfFuture = lazy(() => import('./sections/TreeOfFuture'));
const Events = lazy(() => import('./sections/Events'));
const Gallery = lazy(() => import('./sections/Gallery'));
const Donate = lazy(() => import('./sections/Donate'));
const Volunteer = lazy(() => import('./sections/Volunteer'));
const FAQ = lazy(() => import('./sections/FAQ'));
const Footer = lazy(() => import('./sections/Footer'));

function App() {
  const { donationTreeActive } = useWebGLScene();
  const webglReady = useDeferredMount();
  // Fullscreen hero tree on every section except while Donation Tree owns WebGL.
  const showHeroTree = webglReady && !donationTreeActive;

  return (
    <>
      {showHeroTree ? (
        <Suspense fallback={null}>
          <TreeBackground />
        </Suspense>
      ) : null}
      <div className="relative z-10 min-h-screen min-h-[100dvh] min-w-0">
        <FloatingLeaves />
        <Navbar />
        <Hero />
        <Suspense fallback={null}>
          <Mission />
          <OrphanageHomes />
          <Impact />
          <TreeOfFuture />
        </Suspense>
        <Suspense fallback={null}>
          <Donate />
        </Suspense>
        <Suspense fallback={null}>
          <Volunteer />
        </Suspense>
        <HoverVideoProvider>
          <SectionErrorBoundary sectionName="Events">
            <Suspense fallback={null}>
              <Events />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Gallery">
            <Suspense fallback={null}>
              <Gallery />
            </Suspense>
          </SectionErrorBoundary>
        </HoverVideoProvider>
        <Suspense fallback={null}>
          <FAQ />
          <Footer />
        </Suspense>
      </div>
    </>
  );
}

export default App;
