import { memo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { cloudinaryPosterFromMp4 } from '../../lib/cloudinary';
import { TouchVideoModal } from '../video/TouchVideoModal';

export type GalleryMobilePosterCardProps = {
  mp4Src: string;
  title: string;
  index: number;
  overlay: ReactNode;
};

/**
 * Gallery touch layout: poster image only in the grid.
 * No <video>, no HoverVideoContext, no autoplay — MP4 loads only after tap (modal).
 */
export const GalleryMobilePosterCard = memo(function GalleryMobilePosterCard({
  mp4Src,
  title,
  index,
  overlay,
}: GalleryMobilePosterCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const posterSrc = cloudinaryPosterFromMp4(mp4Src);

  return (
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="group yt-premium-card yt-premium-card--gallery relative min-h-[220px] w-full overflow-hidden text-left sm:min-h-[260px] md:min-h-[300px]"
        aria-label={title ? `Play ${title} video` : 'Play gallery video'}
        onClick={() => setModalOpen(true)}
      >
        <div className="yt-card-media absolute inset-0 h-full w-full min-h-[220px] sm:min-h-[260px] md:min-h-[300px]">
          <div className="yt-card-media__stage h-full">
            <img
              src={posterSrc}
              alt=""
              className="yt-card-poster"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-80">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/35 bg-white/15 shadow-lg backdrop-blur-sm">
              <Play className="ml-0.5 h-6 w-6 fill-white text-white" aria-hidden />
            </span>
          </div>

          <div className="yt-card-overlay-slot">{overlay}</div>
        </div>
      </motion.button>

      <AnimatePresence>
        {modalOpen ? (
          <TouchVideoModal mp4Src={mp4Src} title={title} onClose={() => setModalOpen(false)} />
        ) : null}
      </AnimatePresence>
    </>
  );
});
