import { motion } from 'framer-motion';
import {
  TreePine,
  Heart,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Mail,
  MapPin,
  MessageCircle,
} from 'lucide-react';

const footerLinks: Record<string, { label: string; href: string }[]> = {
  About: [
    { label: 'Mission', href: '#mission' },
    { label: 'Impact', href: '#impact' },
    { label: 'Stories', href: '#stories' },
  ],
  Programs: [
    { label: 'Tree of Future', href: '#tree-of-future' },
    { label: 'Orphanage Homes', href: '#homes' },
    { label: 'Gallery', href: '#gallery' },
  ],
  'Get Involved': [
    { label: 'Donate', href: '#donate' },
    { label: 'Volunteer', href: '#volunteer' },
    { label: 'Events', href: '#events' },
  ],
};

const iconBtnClass =
  'w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-tropical text-white">
      {/* Top wave */}
      <div className="absolute top-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" className="w-full">
          <path
            d="M0 0L60 10C120 20 240 40 360 50C480 60 600 60 720 50C840 40 960 20 1080 15C1200 10 1320 20 1380 25L1440 30V0H0Z"
            fill="#fffdf7"
          />
        </svg>
      </div>

      {/* Animated roots SVG */}
      <div className="absolute bottom-0 left-0 right-0 opacity-10 pointer-events-none">
        <svg viewBox="0 0 1440 200" className="w-full" fill="none">
          <path d="M720 0 C600 50 400 80 200 150" stroke="#7bc47f" strokeWidth="2" />
          <path d="M720 0 C840 50 1040 80 1240 150" stroke="#7bc47f" strokeWidth="2" />
          <path d="M720 0 C680 60 500 100 300 180" stroke="#6ec1e4" strokeWidth="1.5" />
          <path d="M720 0 C760 60 940 100 1140 180" stroke="#6ec1e4" strokeWidth="1.5" />
          <path d="M720 0 C700 40 550 120 350 200" stroke="#ffd166" strokeWidth="1" />
          <path d="M720 0 C740 40 890 120 1090 200" stroke="#ffd166" strokeWidth="1" />
        </svg>
      </div>

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary-300/30"
          style={{ left: `${10 + i * 20}%`, bottom: `${20 + i * 10}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i }}
        />
      ))}

      <div className="relative pt-24 pb-8 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-300/20 flex items-center justify-center">
                <TreePine className="w-5 h-5 text-primary-300" />
              </div>
              <span className="font-sora font-bold text-xl">Bali Future</span>
            </div>
            <p className="text-white/60 leading-relaxed mb-6 max-w-sm">
              A community of compassionate people dedicated to providing vulnerable children in Bali
              with the love, care, and opportunities they deserve. Your support makes all the difference.
            </p>
            <div className="flex gap-3 flex-wrap">
              <span
                className={`${iconBtnClass} opacity-50 cursor-default`}
                title="Coming soon"
                aria-hidden
              >
                <Instagram className="w-4 h-4" />
              </span>
              <span
                className={`${iconBtnClass} opacity-50 cursor-default`}
                title="Coming soon"
                aria-hidden
              >
                <Facebook className="w-4 h-4" />
              </span>
              <span
                className={`${iconBtnClass} opacity-50 cursor-default`}
                title="Coming soon"
                aria-hidden
              >
                <Twitter className="w-4 h-4" />
              </span>
              <span
                className={`${iconBtnClass} opacity-50 cursor-default`}
                title="Coming soon"
                aria-hidden
              >
                <Youtube className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-sora font-bold text-sm uppercase tracking-wider text-white/40 mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-white/60 hover:text-primary-300 transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact & quick donate */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 text-sm text-white/50">
            <a
              href="mailto:donate@balifuture.com"
              className="flex items-center gap-2 hover:text-primary-300 transition-colors"
            >
              <Mail className="w-4 h-4 shrink-0 text-primary-300" />
              donate@balifuture.com
            </a>
            <a
              href="https://wa.me/14157170016"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary-300 transition-colors"
            >
              <MessageCircle className="w-4 h-4 shrink-0 text-primary-300" />
              WhatsApp
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" /> Ubud, Bali, Indonesia
            </span>
          </div>
          <a
            href="#donate"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-300/20 border border-primary-300/30 text-primary-200 text-sm font-semibold hover:bg-primary-300/30 transition-colors"
          >
            <Heart className="w-4 h-4" />
            Give Hope Today
          </a>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5 text-xs text-white/30">
          <span>© 2026 Bali Future. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#faq" className="hover:text-white/60 transition-colors">
              FAQ
            </a>
            <a href="#donate" className="hover:text-white/60 transition-colors">
              Donate
            </a>
            <a href="#volunteer" className="hover:text-white/60 transition-colors">
              Volunteer
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
