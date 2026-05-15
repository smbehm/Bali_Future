import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type VideoStat = {
  src: string;
  end: number;
  prefix?: string;
  suffix?: string;
  staticValue?: string;
  label: string;
};

const VISIBILITY_THRESHOLDS = Array.from({ length: 21 }, (_, i) => i * 0.05);

type VideoStatCardProps = {
  stat: VideoStat;
  index: number;
  activeSrc: string | null;
  onRatio: (src: string, ratio: number) => void;
};

const VideoStatCard = memo(function VideoStatCard({
  stat,
  index,
  activeSrc,
  onRatio,
}: VideoStatCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useLayoutEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.setAttribute('playsinline', '');
    el.setAttribute('webkit-playsinline', '');
  }, [stat.src]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === root) {
            onRatio(stat.src, entry.intersectionRatio);
          }
        }
      },
      { threshold: VISIBILITY_THRESHOLDS },
    );

    io.observe(root);
    return () => io.disconnect();
  }, [stat.src, onRatio]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (activeSrc === stat.src) {
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [activeSrc, stat.src]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onReady = () => {
      if (activeSrc === stat.src) void el.play().catch(() => {});
    };
    el.addEventListener('canplay', onReady);
    return () => el.removeEventListener('canplay', onReady);
  }, [activeSrc, stat.src]);

  const displayValue =
    stat.staticValue ?? `${stat.prefix ?? ''}${stat.end.toLocaleString()}${stat.suffix ?? ''}`;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl shadow-lg shadow-primary-900/[0.10] ring-1 ring-white/20 bg-black"
    >
      <video
        ref={videoRef}
        src={stat.src}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.05]"
        muted
        loop
        playsInline
        preload={activeSrc === stat.src ? 'auto' : 'metadata'}
        disableRemotePlayback
        aria-hidden
      />

      {/* Bottom readability gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

      {/* Soft glow on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[400ms] ease-out group-hover:opacity-100">
        <div className="absolute -bottom-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary-300/25 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-[280px] items-end p-6">
        <div className="w-full">
          <div className="font-sora text-4xl font-bold tracking-tight text-white drop-shadow-sm md:text-5xl">
            {displayValue}
          </div>
          <div className="mt-2 text-sm font-medium text-white/85 md:text-base">{stat.label}</div>
          <div className="mt-4 h-[2px] w-full bg-gradient-to-r from-transparent via-warm-300/80 to-transparent" />
        </div>
      </div>
    </motion.div>
  );
});

export default function Gallery() {
  const videos: VideoStat[] = useMemo(
    () => [
      { src: '/shelter/C0779%20(2).mp4', end: 100, suffix: '+', label: 'Children in Our Care' },
      { src: '/shelter/C0780%20(1).mp4', end: 6, label: 'Homes we support' },
      { src: '/shelter/C0785%20(1).mp4', end: 100, suffix: '%', label: 'Goes to the children' },
      { src: '/shelter/IMG_5495%20(1).mp4', end: 0, staticValue: 'Unknown', label: 'Lives Changed' },
    ],
    [],
  );

  const ratiosRef = useRef<Record<string, number>>({});
  const [activeSrc, setActiveSrc] = useState<string | null>(null);

  const onRatio = useCallback((src: string, ratio: number) => {
    if (ratio < 0.5) {
      delete ratiosRef.current[src];
    } else {
      ratiosRef.current[src] = ratio;
    }

    const candidates = Object.entries(ratiosRef.current).filter(([, r]) => r >= 0.5);
    if (candidates.length === 0) {
      setActiveSrc(null);
      return;
    }
    candidates.sort((a, b) => b[1] - a[1]);
    const next = candidates[0]![0];
    setActiveSrc((cur) => (cur === next ? cur : next));
  }, []);

  return (
    <section id="gallery" className="section-padding relative overflow-hidden bg-gradient-to-b from-cream via-primary-50/20 to-cream">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-4">
            Life on the Ground
          </span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl text-tropical mb-6">
            See the Difference You Make
          </h2>
          <p className="text-dark/60 text-lg">
            These are real moments from real days -- children learning, communities gathering,
            volunteers and families working side by side to build something lasting.
          </p>
        </motion.div>

        {/* Video stats grid */}
        <div className="grid gap-5 md:gap-6 md:grid-cols-2">
          {videos.map((stat, i) => (
            <VideoStatCard
              key={stat.src}
              stat={stat}
              index={i}
              activeSrc={activeSrc}
              onRatio={onRatio}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
