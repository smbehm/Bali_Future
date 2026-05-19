import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { YouTubeCardMedia } from '../components/youtube/YouTubeCardMedia';
import { useCardVideoActivation } from '../hooks/useCardVideoActivation';
import { CLOUDINARY_GALLERY } from '../lib/cloudinary';

type VideoStat = {
  id: string;
  mp4Src: string;
  end: number;
  prefix?: string;
  suffix?: string;
  staticValue?: string;
  label: string;
};

type VideoStatCardProps = {
  stat: VideoStat;
  index: number;
};

const VideoStatCard = memo(function VideoStatCard({ stat, index }: VideoStatCardProps) {
  const cardId = `gallery-${stat.id}`;
  const { isActive, handlers, tabIndex } = useCardVideoActivation(cardId);
  const isPhraseStat = Boolean(stat.staticValue);
  const displayValue =
    stat.staticValue ?? `${stat.prefix ?? ''}${stat.end.toLocaleString()}${stat.suffix ?? ''}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="group yt-premium-card yt-premium-card--gallery relative min-h-[260px] overflow-hidden sm:min-h-[300px]"
      data-active={isActive ? 'true' : 'false'}
      tabIndex={tabIndex}
      role={tabIndex === 0 ? 'button' : undefined}
      aria-pressed={tabIndex === 0 ? isActive : undefined}
      {...handlers}
    >
      <YouTubeCardMedia
        cardId={cardId}
        mp4Src={stat.mp4Src}
        title={stat.label}
        aspectClass="absolute inset-0 h-full w-full"
        className="h-full min-h-[260px] sm:min-h-[300px]"
        overlay={
          <>
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[400ms] ease-out group-hover:opacity-100 group-data-[active=true]:opacity-100">
              <div className="absolute -bottom-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary-300/25 blur-3xl" />
            </div>

            <div className="yt-card-gallery-stats pointer-events-none absolute inset-x-0 bottom-0 z-20 flex min-h-[260px] items-end p-5 sm:min-h-[300px] sm:p-6">
              <div className="w-full">
                <p
                  className={`video-thumb-text yt-card-stat-value ${isPhraseStat ? 'yt-card-stat-value--phrase' : ''}`}
                >
                  {displayValue}
                </p>
                {stat.label ? (
                  <p className="video-thumb-text yt-card-stat-label mt-2">{stat.label}</p>
                ) : null}
                <div className="mt-4 h-[2px] w-full bg-gradient-to-r from-transparent via-warm-300/80 to-transparent" />
              </div>
            </div>
          </>
        }
      />
    </motion.div>
  );
});

export default function Gallery() {
  const videos: VideoStat[] = useMemo(
    () => [
      {
        id: 'children',
        mp4Src: CLOUDINARY_GALLERY.children,
        end: 100,
        suffix: '+',
        label: 'Children in Our Care',
      },
      { id: 'homes', mp4Src: CLOUDINARY_GALLERY.homes, end: 6, label: 'Homes We Support' },
      {
        id: 'impact',
        mp4Src: CLOUDINARY_GALLERY.impact,
        end: 100,
        suffix: '%',
        label: '100% Goes to Children',
      },
      {
        id: 'lives',
        mp4Src: CLOUDINARY_GALLERY.lives,
        end: 0,
        staticValue: 'Endless Lives Changed',
        label: '',
      },
    ],
    [],
  );

  return (
    <section id="gallery" className="section-padding relative overflow-hidden">
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

        <div className="grid gap-5 md:gap-6 md:grid-cols-2">
          {videos.map((stat, i) => (
            <VideoStatCard key={stat.id} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
