import { lazy, Suspense } from 'react';
import { useWebGLScene } from './contexts/WebGLSceneContext';
import { useDeferredMount } from './hooks/useDeferredMount';
import Navbar from './components/Navbar';
import FloatingLeaves from './components/FloatingLeaves';
import Hero from './sections/Hero';
import Mission from './sections/Mission';
import OrphanageHomes from './sections/OrphanageHomes';
import Impact from './sections/Impact';
import TreeOfFuture from './sections/TreeOfFuture';
import SectionErrorBoundary from './components/SectionErrorBoundary';
import { HoverVideoProvider } from './contexts/HoverVideoContext';
import Gallery from './sections/Gallery';
import FAQ from './sections/FAQ';
import Footer from './sections/Footer';

const TreeBackground = lazy(() => import('./components/TreeBackground'));
const Events = lazy(() => import('./sections/Events'));
const Donate = lazy(() => import('./sections/Donate'));
const Volunteer = lazy(() => import('./sections/Volunteer'));

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
        <Mission />
        <OrphanageHomes />
        <Impact />
        <TreeOfFuture />
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
            <Gallery />
          </SectionErrorBoundary>
        </HoverVideoProvider>
        <FAQ />
        <Footer />
      </div>
    </>
  );
}

export default App;
