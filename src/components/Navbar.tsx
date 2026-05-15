import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreePine, Menu, X, Heart } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const links = [
    { label: 'Mission', href: '#mission' },
    { label: 'Stories', href: '#stories' },
    { label: 'Impact', href: '#impact' },
    { label: 'Tree', href: '#tree-of-future' },
    { label: 'Volunteer', href: '#volunteer' },
    { label: 'Events', href: '#events' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'FAQ', href: '#faq' },
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
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-[env(safe-area-inset-top,0px)]">
          <div className="flex items-center justify-between h-20">
            <a href="#top" className="flex min-w-0 max-w-[min(100%,14rem)] items-center gap-3 group sm:max-w-none">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-green shadow-lg shadow-primary-300/30 transition-transform group-hover:scale-110">
                <TreePine className="w-5 h-5 text-white" />
              </div>
              <span className="font-sora font-bold text-xl text-tropical truncate">
                Bali Future
              </span>
            </a>

            <div className="hidden lg:flex flex-wrap items-center justify-end gap-x-5 gap-y-1 xl:gap-x-8">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-dark/70 hover:text-tropical transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-300 rounded-full group-hover:w-full transition-all duration-300" />
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
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
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
            className="fixed inset-0 z-[60] bg-cream/95 glass lg:hidden"
          >
            <div className="flex h-full flex-col p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between">
                <a
                  href="#top"
                  onClick={() => setMobileOpen(false)}
                  className="flex min-w-0 items-center gap-3 rounded-lg outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary-300"
                >
                  <div className="w-10 h-10 shrink-0 rounded-xl gradient-green flex items-center justify-center">
                    <TreePine className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-sora font-bold text-xl text-tropical truncate">
                    Bali Future
                  </span>
                </a>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="-mr-2 p-3 rounded-lg active:bg-primary-50/60"
                >
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
                    className="text-2xl font-sora font-semibold text-tropical"
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
