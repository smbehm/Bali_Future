import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Compass, Sparkles, Globe, BookOpen } from 'lucide-react';

function SunlightRays() {
  return (
    <div className="absolute top-0 right-[15%] w-[500px] h-[700px] pointer-events-none overflow-hidden opacity-40">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-0 origin-top"
          style={{
            left: `${40 + i * 12}%`,
            width: `${2 + i * 0.5}px`,
            height: '100%',
            background: `linear-gradient(180deg, rgba(255, 209, 102, ${0.3 - i * 0.04}) 0%, transparent 70%)`,
            transform: `rotate(${-8 + i * 4}deg)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scaleY: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 4 + i * 0.7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

function FloatingHeroLeaves() {
  const leaves = [
    { x: '70%', y: '15%', size: 14, delay: 0, duration: 12 },
    { x: '80%', y: '35%', size: 10, delay: 2, duration: 15 },
    { x: '60%', y: '55%', size: 12, delay: 4, duration: 11 },
    { x: '85%', y: '60%', size: 8, delay: 1, duration: 14 },
    { x: '75%', y: '75%', size: 11, delay: 3, duration: 13 },
    { x: '55%', y: '25%', size: 9, delay: 5, duration: 16 },
    { x: '90%', y: '45%', size: 10, delay: 2.5, duration: 12 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {leaves.map((leaf, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: leaf.x, top: leaf.y }}
          animate={{
            y: [0, -15, 5, -10, 0],
            x: [0, 8, -5, 3, 0],
            rotate: [0, 10, -5, 8, 0],
            opacity: [0.3, 0.6, 0.4, 0.7, 0.3],
          }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            delay: leaf.delay,
            ease: 'easeInOut',
          }}
        >
          <svg width={leaf.size} height={leaf.size * 1.4} viewBox="0 0 10 14" fill="none">
            <path
              d="M5 0 C8 3 10 7 8 11 C6 14 4 14 2 11 C0 7 2 3 5 0Z"
              fill="#7bc47f"
              fillOpacity="0.5"
            />
            <path d="M5 1 L5 12" stroke="#2f5d50" strokeWidth="0.4" strokeOpacity="0.3" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

function ChildSilhouettes() {
  return (
    <div className="absolute bottom-[8%] right-[10%] lg:right-[20%] pointer-events-none opacity-[0.07]">
      <motion.svg
        width="280"
        height="120"
        viewBox="0 0 280 120"
        fill="none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, delay: 3 }}
      >
        {/* Child 1 - standing with arms up */}
        <path d="M60 115 L60 75 L55 60 L60 65 L65 55 L70 65 L65 60 L65 75 L70 115" fill="#2f5d50" />
        <circle cx="62" cy="50" r="8" fill="#2f5d50" />

        {/* Child 2 - jumping */}
        <path d="M120 110 L118 80 L110 70 L118 75 L120 60 L122 75 L130 70 L122 80 L124 110" fill="#2f5d50" />
        <circle cx="120" cy="52" r="7" fill="#2f5d50" />

        {/* Child 3 - reaching for tree */}
        <path d="M175 115 L175 78 L170 65 L175 70 L178 55 L185 50 L180 60 L180 78 L182 115" fill="#2f5d50" />
        <circle cx="177" cy="48" r="7" fill="#2f5d50" />

        {/* Adult figure - protective */}
        <path d="M230 115 L228 70 L220 55 L228 60 L230 40 L232 60 L240 55 L232 70 L234 115" fill="#2f5d50" />
        <circle cx="230" cy="32" r="9" fill="#2f5d50" />
      </motion.svg>
    </div>
  );
}

function AtmosphericParticles() {
  const particles = useRef<Array<{ x: number; y: number; size: number; speed: number; opacity: number }>>([]);

  useEffect(() => {
    particles.current = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      speed: 2 + Math.random() * 4,
      opacity: 0.1 + Math.random() * 0.3,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(16)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${10 + (i * 5.5) % 80}%`,
            top: `${8 + (i * 7.3) % 75}%`,
            width: `${1.5 + (i % 3)}px`,
            height: `${1.5 + (i % 3)}px`,
            background: i % 3 === 0
              ? 'rgba(123, 196, 127, 0.4)'
              : i % 3 === 1
              ? 'rgba(255, 209, 102, 0.3)'
              : 'rgba(110, 193, 228, 0.3)',
          }}
          animate={{
            y: [0, -(15 + i * 2), 0],
            x: [0, (i % 2 === 0 ? 8 : -8), 0],
            opacity: [0.1, 0.5, 0.1],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: 5 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen min-h-[100dvh] flex items-center overflow-hidden">
      {/* Soft atmosphere — tinted glow orbs only, no opaque cream layer so the
         3D tree background shows through */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] rounded-full bg-warm-100/20 blur-[120px] -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] rounded-full bg-primary-100/20 blur-[100px] translate-y-1/4 -translate-x-1/4" />
        <div className="absolute top-[20%] left-[40%] w-[500px] h-[500px] rounded-full bg-warm-200/15 blur-[80px]" />
        <div className="absolute top-[10%] right-[20%] w-[300px] h-[300px] rounded-full bg-primary-200/12 blur-[60px] animate-pulse-soft" />
      </div>

      {/* Sunlight rays */}
      <SunlightRays />

      {/* Atmospheric particles */}
      <AtmosphericParticles />

      {/* Floating hero leaves */}
      <FloatingHeroLeaves />

      {/* Child silhouettes */}
      <ChildSilhouettes />

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass shadow-sm mb-8"
          >
            <Sparkles className="w-4 h-4 text-warm-300" />
            <span className="text-sm font-medium text-tropical">Because No Child Should Stand Alone</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-sora font-bold text-4xl md:text-6xl lg:text-7xl leading-tight text-tropical mb-8"
          >
            Give Hope to the{' '}
            <span className="gradient-text">Children of Bali</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-dark/70 leading-relaxed max-w-2xl mb-10"
          >
            Every child deserves love, care, and the chance to dream. We provide
            vulnerable children in Bali with education, nourishment, and a safe place
            to grow -- transforming their lives and strengthening entire communities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <a
              href="#donate"
              className="flex items-center gap-2 px-8 py-4 rounded-full gradient-green text-white font-semibold shadow-xl shadow-primary-300/30 hover:shadow-2xl hover:shadow-primary-300/40 hover:scale-105 transition-all"
            >
              <Heart className="w-5 h-5" />
              Change a Child's Life
            </a>
            <a
              href="#volunteer"
              className="flex items-center gap-2 px-8 py-4 rounded-full glass text-tropical font-semibold hover:bg-white/80 hover:scale-105 transition-all shadow-lg"
            >
              <Users className="w-5 h-5" />
              Join Our Community
            </a>
            <a
              href="#mission"
              className="flex items-center gap-2 px-8 py-4 rounded-full border-2 border-primary-200 text-tropical font-semibold hover:bg-primary-50 hover:scale-105 transition-all"
            >
              <Compass className="w-5 h-5" />
              See Our Impact
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-10 border-t border-primary-100/60"
          >
            {[
              { icon: <Heart className="w-5 h-5 text-primary-300" />, value: '2,400+', label: 'Children Cared For' },
              { icon: <Globe className="w-5 h-5 text-sky-300" />, value: '18', label: 'Countries United' },
              { icon: <BookOpen className="w-5 h-5 text-warm-300" />, value: '45', label: 'Active Programs' },
              { icon: <Users className="w-5 h-5 text-ocean" />, value: '890+', label: 'Hearts Joined' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.1 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-2 mb-1">
                  {stat.icon}
                  <span className="font-sora font-bold text-xl md:text-2xl text-tropical">{stat.value}</span>
                </div>
                <span className="text-xs md:text-sm text-dark/50">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom wave — translucent cream so tree continues smoothly below */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full">
          <path
            d="M0 120L48 108C96 96 192 72 288 66C384 60 480 72 576 78C672 84 768 84 864 78C960 72 1056 60 1152 60C1248 60 1344 72 1392 78L1440 84V120H0Z"
            fill="#fffdf7"
            fillOpacity="0.55"
          />
        </svg>
      </div>
    </section>
  );
}
