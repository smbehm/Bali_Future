import { lazy, Suspense } from 'react';
import { useWebGLScene } from './contexts/WebGLSceneContext';
import Navbar from './components/Navbar';
import FloatingLeaves from './components/FloatingLeaves';
import Hero from './sections/Hero';
import Mission from './sections/Mission';
import OrphanageHomes from './sections/OrphanageHomes';
import Impact from './sections/Impact';
import TreeOfFuture from './sections/TreeOfFuture';
import Donate from './sections/Donate';
import Volunteer from './sections/Volunteer';
import SectionErrorBoundary from './components/SectionErrorBoundary';
import { HoverVideoProvider } from './contexts/HoverVideoContext';
import Events from './sections/Events';
import Gallery from './sections/Gallery';
import FAQ from './sections/FAQ';
import Footer from './sections/Footer';

const TreeBackground = lazy(() => import('./components/TreeBackground'));

function App() {
  const { donationTreeActive } = useWebGLScene();
  // Fullscreen hero tree on every section except while Donation Tree owns WebGL.
  const showHeroTree = !donationTreeActive;

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
        <Donate />
        <Volunteer />
        <HoverVideoProvider>
          <SectionErrorBoundary sectionName="Events">
            <Events />
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
