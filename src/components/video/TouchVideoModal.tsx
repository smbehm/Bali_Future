import { useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cloudinaryMobileMp4 } from '../../lib/cloudinary';

type TouchVideoModalProps = {
  mp4Src: string;
  title: string;
  onClose: () => void;
};

/** Single-video fullscreen modal — only mount point for MP4 on touch devices. */
export function TouchVideoModal({ mp4Src, title, onClose }: TouchVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleKeyDown]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    el.playsInline = true;
    el.setAttribute('playsinline', '');
    el.setAttribute('webkit-playsinline', '');
    void el.play().catch(() => {});
    return () => {
      el.pause();
      el.removeAttribute('src');
      el.load();
    };
  }, [mp4Src]);

  const playbackSrc = cloudinaryMobileMp4(mp4Src);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Video'}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          src={playbackSrc}
          className="aspect-video w-full object-cover"
          playsInline
          muted
          loop
          controls
          preload="none"
          aria-label={title}
        />
      </motion.div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close video"
        className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md touch-manipulation"
      >
        <X className="h-5 w-5" />
      </button>
    </motion.div>
  );
}
