import { lazy, Suspense } from 'react';
import { useSectionInView } from './hooks/useSectionInView';
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
  const heroInView = useSectionInView('top', { threshold: 0.08 });
  const donationTreeInView = useSectionInView('tree-of-future', {
    threshold: 0.1,
    rootMargin: '80px 0px',
  });
  // Only one fullscreen WebGL scene at a time — avoids context loss on mobile/desktop.
  const showHeroTree = heroInView && !donationTreeInView;

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
