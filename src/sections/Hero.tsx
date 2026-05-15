import { useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Compass, Sparkles, Home } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';

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

function GlowingTree() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[55%] pointer-events-none">
      {/* Deep background glow */}
      <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-primary-200/20 blur-[80px] animate-pulse-soft" />
      <div className="absolute top-[25%] right-[15%] w-[250px] h-[250px] rounded-full bg-warm-200/15 blur-[60px]" />

      <svg viewBox="0 0 500 750" className="h-full w-full" fill="none" preserveAspectRatio="xMidYMid slice">
        {/* Trunk with bark texture */}
        <motion.path
          d="M250 720 C250 720 252 550 250 480 C248 420 235 380 240 340 C245 300 238 280 242 250"
          stroke="url(#trunkGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        />
        <motion.path
          d="M250 480 C230 440 200 420 185 380"
          stroke="url(#trunkGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 2, delay: 1.2 }}
        />
        <motion.path
          d="M250 420 C270 380 300 370 320 340"
          stroke="url(#trunkGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 2, delay: 1.5 }}
        />
        <motion.path
          d="M248 360 C225 330 195 320 175 290"
          stroke="url(#trunkGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 1.8, delay: 1.8 }}
        />

        {/* Canopy layers - atmospheric depth */}
        <motion.ellipse
          cx="250" cy="200" rx="180" ry="170"
          fill="url(#canopyOuter)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.8 }}
        />
        <motion.ellipse
          cx="230" cy="220" rx="140" ry="130"
          fill="url(#canopyMid)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1.1 }}
        />
        <motion.ellipse
          cx="270" cy="190" rx="120" ry="110"
          fill="url(#canopyInner)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1.4 }}
        />
        <motion.ellipse
          cx="250" cy="210" rx="90" ry="85"
          fill="url(#canopyCore)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, delay: 1.7 }}
        />

        {/* Glowing leaves scattered in canopy */}
        {[
          { cx: 180, cy: 140, r: 6 }, { cx: 300, cy: 130, r: 5 },
          { cx: 220, cy: 100, r: 7 }, { cx: 280, cy: 170, r: 5 },
          { cx: 150, cy: 200, r: 6 }, { cx: 330, cy: 190, r: 5 },
          { cx: 200, cy: 250, r: 7 }, { cx: 310, cy: 240, r: 6 },
          { cx: 170, cy: 160, r: 4 }, { cx: 260, cy: 110, r: 5 },
          { cx: 340, cy: 150, r: 4 }, { cx: 190, cy: 280, r: 5 },
          { cx: 290, cy: 270, r: 4 }, { cx: 240, cy: 150, r: 6 },
        ].map((leaf, i) => (
          <motion.circle
            key={i}
            cx={leaf.cx}
            cy={leaf.cy}
            r={leaf.r}
            fill="url(#leafGlow)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.4, 0.9, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: 2 + i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Roots */}
        <motion.path
          d="M250 720 C220 740 170 750 130 755"
          stroke="#2f5d50"
          strokeWidth="3"
          strokeOpacity="0.3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 2.5 }}
        />
        <motion.path
          d="M250 720 C280 740 330 750 370 755"
          stroke="#2f5d50"
          strokeWidth="3"
          strokeOpacity="0.3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 2.7 }}
        />
        <motion.path
          d="M248 715 C235 735 200 745 170 748"
          stroke="#2f5d50"
          strokeWidth="2"
          strokeOpacity="0.2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, delay: 2.9 }}
        />

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5b8a6a" />
            <stop offset="50%" stopColor="#4a6b52" />
            <stop offset="100%" stopColor="#3d5542" />
          </linearGradient>
          <radialGradient id="canopyOuter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7bc47f" stopOpacity="0.08" />
            <stop offset="70%" stopColor="#7bc47f" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#7bc47f" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="canopyMid" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2f5d50" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#2f5d50" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#2f5d50" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="canopyInner" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6ec1e4" stopOpacity="0.08" />
            <stop offset="70%" stopColor="#6ec1e4" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#6ec1e4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="canopyCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7bc47f" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#2f5d50" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#2f5d50" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="leafGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a8e6a3" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#7bc47f" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#7bc47f" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
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
      className="flex flex-col"
    >
      <div className="flex items-start gap-2">
        {icon}
        <span className="flex flex-wrap items-baseline gap-x-1">
          <strong className="font-sora text-3xl font-bold text-tropical tabular-nums leading-none">
            {n.toLocaleString()}
            {suffix}
          </strong>
          <span className="text-base text-dark/60 leading-snug">{after}</span>
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
  { end: 6, after: ' homes supported', icon: <Home className="size-[1em] shrink-0 text-primary-300 text-3xl" />, durationMs: 1500 },
  { end: 100, suffix: '+', after: ' children in our care', icon: <Heart className="size-[1em] shrink-0 text-warm-400 text-3xl" />, durationMs: 2000 },
  { end: 100, suffix: '%', after: ' of support goes to them', icon: <Users className="size-[1em] shrink-0 text-sky-300 text-3xl" />, durationMs: 2000 },
];

export default function Hero() {
  return (
    <section id="top" className="relative min-h-screen min-h-[100dvh] flex items-center overflow-hidden">
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

      {/* Artistic tree illustration */}
      <GlowingTree />

      {/* Floating hero leaves */}
      <FloatingHeroLeaves />

      {/* Child silhouettes */}
      <ChildSilhouettes />

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 pt-[max(8rem,calc(env(safe-area-inset-top,0px)+5.5rem))] pb-20">
        <div className="max-w-3xl min-w-0">
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
            className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
          >
            <a
              href="#donate"
              className="flex w-full min-w-0 items-center justify-center gap-2 px-8 py-4 text-center text-base font-semibold transition-all hover:scale-105 sm:w-auto sm:shrink-0 rounded-full gradient-green text-white shadow-xl shadow-primary-300/30 hover:shadow-2xl hover:shadow-primary-300/40"
            >
              <Heart className="h-5 w-5 shrink-0" />
              Change a Child's Life
            </a>
            <a
              href="#volunteer"
              className="flex w-full min-w-0 items-center justify-center gap-2 px-8 py-4 text-center text-base font-semibold transition-all hover:scale-105 sm:w-auto sm:shrink-0 rounded-full glass text-tropical shadow-lg hover:bg-white/80"
            >
              <Users className="h-5 w-5 shrink-0" />
              Join Our Community
            </a>
            <a
              href="#mission"
              className="flex w-full min-w-0 items-center justify-center gap-2 px-8 py-4 text-center text-base font-semibold transition-all hover:scale-105 sm:w-auto sm:shrink-0 rounded-full border-2 border-primary-200 text-tropical hover:bg-primary-50"
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
              className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6"
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

      {/* Bottom wave with gradient */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full">
          <path
            d="M0 120L48 108C96 96 192 72 288 66C384 60 480 72 576 78C672 84 768 84 864 78C960 72 1056 60 1152 60C1248 60 1344 72 1392 78L1440 84V120H0Z"
            fill="#fffdf7"
          />
        </svg>
      </div>
    </section>
  );
}
