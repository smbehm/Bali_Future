import { lazy, Suspense } from 'react';
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
import FAQ from './sections/FAQ';
import Footer from './sections/Footer';

const TreeBackground = lazy(() => import('./components/TreeBackground'));
const Events = lazy(() => import('./sections/Events'));
const Gallery = lazy(() => import('./sections/Gallery'));

function App() {
  return (
    <>
      <Suspense fallback={null}>
        <TreeBackground />
      </Suspense>
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
        <Suspense fallback={null}>
          <SectionErrorBoundary sectionName="Events">
            <Events />
          </SectionErrorBoundary>
          <SectionErrorBoundary sectionName="Gallery">
            <Gallery />
          </SectionErrorBoundary>
        </Suspense>
        <FAQ />
        <Footer />
      </div>
    </>
  );
}

export default App;
