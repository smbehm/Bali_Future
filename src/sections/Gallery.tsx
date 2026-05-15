import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

type VideoStat = {
  id: string;
  youtubeId: string;
  end: number;
  prefix?: string;
  suffix?: string;
  staticValue?: string;
  label: string;
};

const VIDEOS: VideoStat[] = [
  { id: 'children', youtubeId: '9T-9MWcET0U', end: 100, suffix: '+', label: 'Children in Our Care' },
  { id: 'homes', youtubeId: 'dgDtnlfV3v0', end: 6, label: 'Homes We Support' },
  { id: 'impact', youtubeId: 'MeNbGmgXhLY', end: 100, suffix: '%', label: '100% Goes to Children' },
  { id: 'lives', youtubeId: 'scLzTS5CoAQ', end: 0, staticValue: 'Countless', label: 'Lives Changed' },
];

const VISIBILITY_THRESHOLDS = Array.from({ length: 21 }, (_, i) => i * 0.05);

function buildEmbedUrl(videoId: string, muted: boolean): string {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: muted ? '1' : '0',
    loop: '1',
    playlist: videoId,
    controls: '0',
    playsinline: '1',
    modestbranding: '1',
    rel: '0',
    showinfo: '0',
    enablejsapi: '0',
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

type VideoStatCardProps = {
  stat: VideoStat;
  index: number;
  isActive: boolean;
  onRatio: (id: string, ratio: number) => void;
};

const VideoStatCard = memo(function VideoStatCard({ stat, index, isActive, onRatio }: VideoStatCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === root) {
            onRatio(stat.id, entry.intersectionRatio);
          }
        }
      },
      { threshold: VISIBILITY_THRESHOLDS },
    );

    io.observe(root);
    return () => io.disconnect();
  }, [stat.id, onRatio]);

  useEffect(() => {
    if (!isActive) {
      setMuted(true);
    }
  }, [isActive]);

  const thumbnail = `https://img.youtube.com/vi/${stat.youtubeId}/hqdefault.jpg`;

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
      {isActive ? (
        <iframe
          key={`${stat.youtubeId}-${muted}`}
          title={stat.label}
          src={buildEmbedUrl(stat.youtubeId, muted)}
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.35]"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          loading="lazy"
        />
      ) : (
        <img
          src={thumbnail}
          alt={stat.label}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.05]"
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Bottom readability gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

      {/* Soft glow on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[400ms] ease-out group-hover:opacity-100">
        <div className="absolute -bottom-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary-300/25 blur-3xl" />
      </div>

      {/* Mute/Unmute button */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/15 backdrop-blur-md transition-transform duration-300 hover:scale-105 active:scale-95 touch-manipulation"
          aria-label={muted ? 'Unmute video' : 'Mute video'}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
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
  const ratiosRef = useRef<Record<string, number>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const onRatio = useCallback((id: string, ratio: number) => {
    if (ratio < 0.5) {
      delete ratiosRef.current[id];
    } else {
      ratiosRef.current[id] = ratio;
    }

    const candidates = Object.entries(ratiosRef.current).filter(([, r]) => r >= 0.5);
    if (candidates.length === 0) {
      setActiveId(null);
      return;
    }
    candidates.sort((a, b) => b[1] - a[1]);
    const next = candidates[0]![0];
    setActiveId((cur) => (cur === next ? cur : next));
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
          {VIDEOS.map((stat, i) => (
            <VideoStatCard
              key={stat.id}
              stat={stat}
              index={i}
              isActive={activeId === stat.id}
              onRatio={onRatio}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
