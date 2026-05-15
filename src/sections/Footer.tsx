import { motion } from 'framer-motion';
import { TreePine, Heart, Instagram, Mail, MapPin, MessageCircle } from 'lucide-react';

const footerLinks: Record<string, { label: string; href: string }[]> = {
  About: [
    { label: 'Mission', href: '#mission' },
    { label: 'Impact', href: '#impact' },
  ],
  Programs: [
    { label: 'Tree of Future', href: '#tree-of-future' },
    { label: 'Orphanage Homes', href: '#stories' },
    { label: 'Gallery', href: '#gallery' },
  ],
  'Get Involved': [
    { label: 'Donate', href: '#donate' },
    { label: 'Volunteer', href: '#volunteer' },
    { label: 'Events', href: '#events' },
    { label: 'FAQ', href: '#faq' },
  ],
};

export default function Footer() {
  return (
    <footer id="footer" className="relative overflow-hidden bg-tropical text-white">
      {/* Top wave — translucent so the tree continues into the footer */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 80" fill="none" className="w-full">
          <path d="M0 0L60 10C120 20 240 40 360 50C480 60 600 60 720 50C840 40 960 20 1080 15C1200 10 1320 20 1380 25L1440 30V0H0Z" fill="#fffdf7" fillOpacity="0.55" />
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
            <a href="#top" className="mb-4 flex w-fit min-w-0 max-w-full items-center gap-3 rounded-lg outline-none ring-offset-2 ring-offset-tropical focus-visible:ring-2 focus-visible:ring-primary-300">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-300/20">
                <TreePine className="h-5 w-5 text-primary-300" />
              </div>
              <span className="font-sora text-xl font-bold truncate">Bali Future</span>
            </a>
            <p className="text-white/60 leading-relaxed mb-6 max-w-sm">
              A community of compassionate people dedicated to providing vulnerable children in Bali
              with the love, care, and opportunities they deserve. Your support makes all the difference.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                {
                  Icon: Instagram,
                  href: 'https://www.instagram.com/balifuture_com?igsh=YjJhemhxcG11ZGZy&utm_source=qr',
                  label: 'Instagram',
                },
                { Icon: MessageCircle, href: 'https://wa.me/14157170016', label: 'WhatsApp' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Bali Future on ${label}`}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-300/20 hover:border-primary-300/30 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-sora font-bold text-sm uppercase tracking-wider text-white/40 mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-white/60 hover:text-primary-300 transition-colors text-sm">
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
          <div className="flex flex-col gap-4 text-sm text-white/50 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <a href="mailto:donate@balifuture.com" className="flex items-center gap-2 transition-colors hover:text-white/80">
              <Mail className="w-4 h-4 shrink-0" /> donate@balifuture.com
            </a>
            <a
              href="https://wa.me/14157170016"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-colors hover:text-white/80"
            >
              <MessageCircle className="w-4 h-4 shrink-0" /> +1 (415) 717-0016
            </a>
            <span className="flex items-start gap-2 sm:items-center">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
              Jl. Panji I no.7, Br. Kwanji, Dalung, Kec. Kuta Utara, Kabupaten Badung, Bali 80361, Indonesia
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
          <span className="text-center md:text-left">2026 Bali Future Foundation. All rights reserved.</span>
          <div className="flex flex-wrap justify-center gap-4 md:justify-end">
            <a
              href="mailto:hello@balifuture.org?subject=Privacy%20policy%20inquiry"
              className="hover:text-white/60 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="mailto:hello@balifuture.org?subject=Terms%20of%20service%20inquiry"
              className="hover:text-white/60 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="mailto:hello@balifuture.org?subject=Cookie%20policy%20inquiry"
              className="hover:text-white/60 transition-colors"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
