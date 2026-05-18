import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cloudinaryPosterFromMp4 } from '../../lib/cloudinary';

export type VideoStoryModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  mp4Src: string;
  poster?: string;
  caption?: string;
};

export default function VideoStoryModal({
  open,
  onClose,
  title,
  mp4Src,
  poster,
  caption,
}: VideoStoryModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterSrc = poster ?? cloudinaryPosterFromMp4(mp4Src);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    const el = videoRef.current;
    if (!open || !el) return;
    el.muted = false;
    void el.play().catch(() => {
      el.muted = true;
      void el.play().catch(() => {});
    });
    return () => {
      el.pause();
      el.currentTime = 0;
    };
  }, [open, mp4Src]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="video-story-modal"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            className="video-story-modal__backdrop"
            aria-label="Close video"
            onClick={onClose}
          />
          <motion.div
            className="video-story-modal__panel"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="video-story-modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
            <motion.div className="video-story-modal__video-wrap">
              <video
                ref={videoRef}
                key={mp4Src}
                src={mp4Src}
                poster={posterSrc}
                controls
                playsInline
                preload="metadata"
                className="video-story-modal__video"
              />
            </motion.div>
            <div className="video-story-modal__meta">
              <h3 className="font-sora text-lg font-bold text-white sm:text-xl">{title}</h3>
              {caption ? <p className="mt-2 text-sm leading-relaxed text-white/75">{caption}</p> : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
