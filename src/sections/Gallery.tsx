import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { YouTubeCardMedia } from '../components/youtube/YouTubeCardMedia';
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
  const displayValue =
    stat.staticValue ?? `${stat.prefix ?? ''}${stat.end.toLocaleString()}${stat.suffix ?? ''}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="yt-premium-card yt-premium-card--gallery relative min-h-[260px] overflow-hidden sm:min-h-[300px]"
    >
      <YouTubeCardMedia
        mp4Src={stat.mp4Src}
        title={stat.label}
        aspectClass="absolute inset-0 h-full w-full"
        className="h-full min-h-[260px] sm:min-h-[300px]"
        overlay={
          <div className="yt-card-gallery-stats pointer-events-none absolute inset-x-0 bottom-0 z-20 flex min-h-[260px] items-end p-5 sm:min-h-[300px] sm:p-6">
            <div className="w-full rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-md sm:px-5 sm:py-4">
              <div className="font-sora text-3xl font-bold tracking-tight text-tropical drop-shadow-none sm:text-4xl md:text-5xl">
                {displayValue}
              </div>
              <div className="mt-2 text-sm font-medium text-dark/70 md:text-base">{stat.label}</div>
              <div className="mt-4 h-[2px] w-full bg-gradient-to-r from-transparent via-primary-300/60 to-transparent" />
            </div>
          </div>
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
      { id: 'lives', mp4Src: CLOUDINARY_GALLERY.lives, end: 0, staticValue: 'Unknown', label: 'Lives Changed' },
    ],
    [],
  );

  return (
    <section id="gallery" className="section-padding relative overflow-hidden bg-gradient-to-b from-cream via-primary-50/20 to-cream">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-600">
            Life on the Ground
          </span>
          <h2 className="mb-6 font-sora text-3xl font-bold text-tropical md:text-5xl">
            See the Difference You Make
          </h2>
          <p className="text-lg text-dark/60">
            These are real moments from real days -- children learning, communities gathering,
            volunteers and families working side by side to build something lasting.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          {videos.map((stat, i) => (
            <VideoStatCard key={stat.id} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
