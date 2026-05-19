import { useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Compass, Sparkles, Home } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';

function SunlightRays() {
  return (
    <div className="absolute top-0 right-[15%] hidden h-[min(700px,100vh)] w-[min(500px,100vw)] overflow-hidden opacity-40 pointer-events-none sm:block">
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
    <div className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block">
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
    <div className="absolute bottom-[8%] right-[10%] pointer-events-none opacity-[0.07] hidden md:block lg:right-[20%]">
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

function HeroStatCell({
  icon,
  end,
  suffix = '',
  after,
  durationMs,
}: {
  icon: ReactNode;
  end: number;
  suffix?: string;
  after: string;
  durationMs: number;
}) {
  const n = useCountUp(end, durationMs);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex min-w-0 flex-col"
    >
      <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-start sm:gap-2">
        {icon}
        <span className="flex min-w-0 flex-col items-center gap-0.5 text-center sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-1 sm:text-left">
          <strong className="font-sora text-xl font-bold text-tropical tabular-nums leading-none sm:text-3xl">
            {n.toLocaleString()}
            {suffix}
          </strong>
          <span className="text-xs leading-tight text-dark/60 break-words sm:text-base sm:leading-snug">{after}</span>
        </span>
      </div>
    </motion.div>
  );
}

const heroStats: Array<{
  end: number;
  suffix?: string;
  after: string;
  icon: ReactNode;
  durationMs: number;
}> = [
  { end: 6, after: ' homes supported', icon: <Home className="size-[1em] shrink-0 text-2xl text-primary-300 sm:text-3xl" />, durationMs: 1500 },
  { end: 100, suffix: '+', after: ' children in our care', icon: <Heart className="size-[1em] shrink-0 text-2xl text-warm-400 sm:text-3xl" />, durationMs: 2000 },
  { end: 100, suffix: '%', after: ' of support goes to them', icon: <Users className="size-[1em] shrink-0 text-2xl text-sky-300 sm:text-3xl" />, durationMs: 2000 },
];

export default function Hero() {
  return (
    <section id="top" className="relative min-h-screen min-h-[100dvh] flex items-center overflow-hidden">
      {/* Soft atmosphere — tinted glow orbs only, no opaque cream layer so the
         3D tree background shows through */}
      <div className="decorative-blur absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 h-[min(900px,120vh)] w-[min(900px,120vw)] rounded-full bg-warm-100/20 blur-[120px] -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 h-[min(700px,100vh)] w-[min(700px,100vw)] rounded-full bg-primary-100/20 blur-[100px] translate-y-1/4 -translate-x-1/4" />
        <div className="absolute top-[20%] left-[40%] h-[min(500px,80vh)] w-[min(500px,90vw)] rounded-full bg-warm-200/15 blur-[80px]" />
        <div className="absolute top-[10%] right-[20%] h-[min(300px,50vh)] w-[min(300px,60vw)] rounded-full bg-primary-200/12 blur-[60px] animate-pulse-soft" />
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
      <div className="relative z-20 mx-auto max-w-7xl px-4 pt-[max(8rem,calc(env(safe-area-inset-top,0px)+5.5rem))] pb-16 sm:px-6 md:px-12 md:pb-20">
        <div className="max-w-3xl min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass shadow-sm mb-8"
          >
            <Sparkles className="w-4 h-4 text-warm-300" />
            <span className="text-sm font-medium text-tropical text-pretty">Because No Child Should Stand Alone</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-sora font-bold text-4xl md:text-6xl lg:text-7xl leading-tight text-tropical mb-8 text-balance"
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
            className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
          >
            <a
              href="#donate"
              className="flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-full px-8 py-4 text-center text-base font-semibold transition-all hover:scale-105 sm:w-auto sm:shrink-0 gradient-green text-white shadow-xl shadow-primary-300/30 hover:shadow-2xl hover:shadow-primary-300/40"
            >
              <Heart className="h-5 w-5 shrink-0" />
              Change a Child's Life
            </a>
            <a
              href="#volunteer"
              className="flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-full px-8 py-4 text-center text-base font-semibold transition-all hover:scale-105 sm:w-auto sm:shrink-0 glass text-tropical shadow-lg hover:bg-white/80"
            >
              <Users className="h-5 w-5 shrink-0" />
              Join Our Community
            </a>
            <a
              href="#mission"
              className="flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-full border-2 border-primary-200 px-8 py-4 text-center text-base font-semibold text-tropical transition-all hover:scale-105 hover:bg-primary-50 sm:w-auto sm:shrink-0"
            >
              <Compass className="h-5 w-5 shrink-0" />
              See Our Impact
            </a>
          </motion.div>

          {/* Stats row */}
          <div className="mt-16 border-t border-primary-300/40 pt-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="grid grid-cols-3 gap-2 sm:gap-6"
            >
              {heroStats.map((stat) => (
                <HeroStatCell
                  key={stat.after}
                  icon={stat.icon}
                  end={stat.end}
                  suffix={stat.suffix}
                  after={stat.after}
                  durationMs={stat.durationMs}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
