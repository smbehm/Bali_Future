import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useHoverVideo } from '../../contexts/HoverVideoContext';
import { usePrefersHover } from '../../hooks/usePrefersHover';
import { cloudinaryMobileMp4, cloudinaryPosterFromMp4 } from '../../lib/cloudinary';

export type YouTubeCardMediaProps = {
  /** Unique id for one-at-a-time hover playback across Events + Gallery */
  cardId: string;
  title: string;
  mp4Src: string;
  poster?: string;
  aspectClass?: string;
  overlay?: ReactNode;
  className?: string;
  /**
   * Touch only: mount the video element and fetch media only while active.
   * Desktop hover playback is unchanged.
   */
  deferVideoUntilActive?: boolean;
};

export const YouTubeCardMedia = memo(function YouTubeCardMedia({
  cardId,
  title,
  mp4Src,
  poster,
  aspectClass = 'aspect-[16/10]',
  overlay,
  className = '',
  deferVideoUntilActive = false,
}: YouTubeCardMediaProps) {
  const { activeCardId } = useHoverVideo();
  const prefersHover = usePrefersHover();
  const isPlaying = activeCardId === cardId;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const posterSrc = poster ?? cloudinaryPosterFromMp4(mp4Src);

  const lazyTouchVideo = deferVideoUntilActive && !prefersHover;
  const mountVideo = !lazyTouchVideo || isPlaying;
  const playbackSrc = useMemo(
    () => (lazyTouchVideo ? cloudinaryMobileMp4(mp4Src) : mp4Src),
    [lazyTouchVideo, mp4Src],
  );

  useEffect(() => {
    if (!isPlaying) setVideoPlaying(false);
  }, [isPlaying]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !mountVideo) return;

    if (!isPlaying) {
      el.pause();
      el.currentTime = 0;
      el.muted = true;
      if (lazyTouchVideo) {
        el.removeAttribute('src');
        el.load();
      }
      return;
    }

    if (lazyTouchVideo && el.getAttribute('src') !== playbackSrc) {
      el.src = playbackSrc;
    }

    el.muted = true;
    el.playsInline = true;
    el.setAttribute('playsinline', '');
    el.setAttribute('webkit-playsinline', '');

    const startPlayback = () => {
      void el.play().then(() => {
        setVideoPlaying(true);
        if (prefersHover) {
          el.muted = false;
        }
      }).catch(() => {
        el.muted = true;
        void el.play().then(() => setVideoPlaying(true)).catch(() => {});
      });
    };

    if (el.readyState >= 2) {
      startPlayback();
    } else {
      el.load();
      el.addEventListener('loadeddata', startPlayback, { once: true });
      return () => el.removeEventListener('loadeddata', startPlayback);
    }
  }, [isPlaying, prefersHover, mountVideo, lazyTouchVideo, playbackSrc]);

  /* Desktop only — iOS may pause when composited during scroll */
  useEffect(() => {
    if (!prefersHover || !isPlaying) return;
    const el = videoRef.current;
    if (!el) return;

    const resumeIfPaused = () => {
      if (isPlaying && el.paused && document.visibilityState === 'visible') {
        el.muted = true;
        void el.play().catch(() => {});
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) resumeIfPaused();
      },
      { threshold: 0.05 },
    );
    observer.observe(el);

    el.addEventListener('pause', resumeIfPaused);
    document.addEventListener('visibilitychange', resumeIfPaused);

    return () => {
      observer.disconnect();
      el.removeEventListener('pause', resumeIfPaused);
      document.removeEventListener('visibilitychange', resumeIfPaused);
    };
  }, [isPlaying, prefersHover]);

  const preload = prefersHover ? (isPlaying ? 'auto' : 'metadata') : 'none';

  return (
    <div
      className={`yt-card-media ${aspectClass} ${className}`.trim()}
      data-active={isPlaying ? 'true' : 'false'}
      data-playing={videoPlaying ? 'true' : 'false'}
      data-touch={prefersHover ? 'false' : 'true'}
    >
      <div className="yt-card-media__stage">
        <img src={posterSrc} alt="" className="yt-card-poster" loading="lazy" decoding="async" />

        <div className="yt-card-player" aria-hidden={!isPlaying}>
          {mountVideo ? (
            <video
              ref={videoRef}
              src={lazyTouchVideo ? undefined : mp4Src}
              poster={posterSrc}
              muted
              loop
              playsInline
              autoPlay={false}
              preload={preload}
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              className="yt-card-native-video"
              aria-label={title}
              onPlaying={() => setVideoPlaying(true)}
              onTimeUpdate={(e) => {
                if (e.currentTarget.currentTime > 0.05) setVideoPlaying(true);
              }}
            />
          ) : null}
        </div>
      </div>

      <div className="yt-card-cinematic" aria-hidden />
      <div className="yt-card-vignette" aria-hidden />
      <div className="yt-card-tint" aria-hidden />

      {overlay ? <div className="yt-card-overlay-slot">{overlay}</div> : null}
    </div>
  );
});