import Navbar from './components/Navbar';
import FloatingLeaves from './components/FloatingLeaves';
import TreeBackground from './components/TreeBackground';
import Hero from './sections/Hero';
import Mission from './sections/Mission';
import OrphanageHomes from './sections/OrphanageHomes';
import Impact from './sections/Impact';
import TreeOfFuture from './sections/TreeOfFuture';
import Donate from './sections/Donate';
import Volunteer from './sections/Volunteer';
import Events from './sections/Events';
import Gallery from './sections/Gallery';
import FAQ from './sections/FAQ';
import Footer from './sections/Footer';

function App() {
  return (
    <>
      <TreeBackground />
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
        <Events />
        <Gallery />
        <FAQ />
        <Footer />
      </div>
    </>
  );
}

export default App;
