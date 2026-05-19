import { memo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { cloudinaryPosterFromMp4 } from '../../lib/cloudinary';
import { TouchVideoModal } from '../video/TouchVideoModal';
import type { ShelterShowcaseEvent } from '../../sections/Events';

type EventsMobilePosterCardProps = {
  event: ShelterShowcaseEvent;
  index: number;
};

/** Touch: poster only in grid — no inline video, no autoplay, no HoverVideoContext. */
export const EventsMobilePosterCard = memo(function EventsMobilePosterCard({
  event,
  index,
}: EventsMobilePosterCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const poster = event.poster ?? cloudinaryPosterFromMp4(event.mp4Src);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="yt-premium-card flex flex-col overflow-hidden"
      >
        <button
          type="button"
          className="relative aspect-[16/10] w-full overflow-hidden text-left touch-manipulation"
          aria-label={`Play ${event.title} video`}
          onClick={() => setModalOpen(true)}
        >
          <img
            src={poster}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/35 bg-white/15 shadow-lg backdrop-blur-sm">
              <Play className="ml-0.5 h-6 w-6 fill-white text-white" aria-hidden />
            </span>
          </span>
        </button>

        <div className="flex flex-1 flex-col justify-center border-t border-white/60 bg-gradient-to-b from-white via-primary-50/30 to-primary-50/50 px-5 py-5">
          <div className="flex items-start gap-3">
            <span className="select-none text-2xl leading-none" aria-hidden>
              {event.icon}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-sora text-lg font-bold tracking-tight text-tropical">{event.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-pretty text-dark/60">{event.description}</p>
            </div>
          </div>
        </div>
      </motion.article>

      <AnimatePresence>
        {modalOpen ? (
          <TouchVideoModal
            mp4Src={event.mp4Src}
            title={event.title}
            onClose={() => setModalOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
});
