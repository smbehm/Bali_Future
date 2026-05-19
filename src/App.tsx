import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import FloatingLeaves from './components/FloatingLeaves';
import { useIsTouchDevice } from './hooks/useIsTouchDevice';
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
  const isTouchDevice = useIsTouchDevice();

  return (
    <>
      {!isTouchDevice ? (
        <Suspense fallback={null}>
          <TreeBackground />
        </Suspense>
      ) : null}
      <div className="relative z-10 min-h-screen min-h-[100dvh] min-w-0">
        {!isTouchDevice ? <FloatingLeaves /> : null}
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
