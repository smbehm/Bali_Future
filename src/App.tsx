import Navbar from './components/Navbar';
import FloatingLeaves from './components/FloatingLeaves';
import TreeBackground from './components/TreeBackground';
import Hero from './sections/Hero';
import Mission from './sections/Mission';
import OrphanageHomes from './sections/OrphanageHomes';
import Impact from './sections/Impact';
import TreeOfFuture from './sections/TreeOfFuture';
import Stories from './sections/Stories';
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
      <div className="relative z-10 min-h-screen">
        <FloatingLeaves />
        <Navbar />
        <Hero />
        <Mission />
        <OrphanageHomes />
        <Impact />
        <TreeOfFuture />
        <Stories />
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
