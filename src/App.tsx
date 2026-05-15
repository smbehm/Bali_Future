import Navbar from './components/Navbar';
import FloatingLeaves from './components/FloatingLeaves';
import Hero from './sections/Hero';
import Mission from './sections/Mission';
import OrphanageHomes from './sections/OrphanageHomes';
import Impact from './sections/Impact';
import Donate from './sections/Donate';
import Volunteer from './sections/Volunteer';
import Events from './sections/Events';
import Gallery from './sections/Gallery';
import FAQ from './sections/FAQ';
import Footer from './sections/Footer';

function App() {
  return (
    <div className="relative min-h-screen min-h-[100dvh] min-w-0">
      <FloatingLeaves />
      <Navbar />
      <Hero />
      <Mission />
      <OrphanageHomes />
      <Impact />
      <Donate />
      <Volunteer />
      <Events />
      <Gallery />
      <FAQ />
      <Footer />
    </div>
  );
}

export default App;
