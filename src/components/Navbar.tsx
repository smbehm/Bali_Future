import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreePine, Menu, X, Heart } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: 'Mission', href: '#mission' },
    { label: 'Impact', href: '#impact' },
    { label: 'Stories', href: '#stories' },
    { label: 'Volunteer', href: '#volunteer' },
    { label: 'Events', href: '#events' },
    { label: 'Gallery', href: '#gallery' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass shadow-lg shadow-primary-300/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-[51]">
          <div className="flex items-center justify-between h-20">
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center shadow-lg shadow-primary-300/30 group-hover:scale-110 transition-transform">
                <TreePine className="w-5 h-5 text-white" />
              </div>
              <span className="font-sora font-bold text-xl text-tropical">
                Bali Future
              </span>
            </a>

            <div className="hidden lg:flex items-center gap-8">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="nav-link-desktop text-sm font-medium transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-300 rounded-full group-hover:w-full transition-all duration-300 opacity-100" />
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <a
                href="#donate"
                className="flex items-center gap-2 px-6 py-2.5 rounded-full gradient-green text-white text-sm font-semibold shadow-lg shadow-primary-300/30 hover:shadow-xl hover:shadow-primary-300/40 hover:scale-105 transition-all"
              >
                <Heart className="w-4 h-4" />
                Donate Now
              </a>
            </div>

            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-tropical"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-cream/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center">
                    <TreePine className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-sora font-bold text-xl text-tropical">
                    Bali Future
                  </span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2">
                  <X className="w-6 h-6 text-tropical" />
                </button>
              </div>

              <div className="flex flex-col gap-6 mt-16">
                {links.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-2xl font-sora font-semibold text-tropical opacity-100"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>

              <div className="mt-auto">
                <a
                  href="#donate"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-2xl gradient-green text-white font-semibold text-lg shadow-lg"
                >
                  <Heart className="w-5 h-5" />
                  Donate Now
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
