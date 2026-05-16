import { memo, useEffect, useRef, useState, type ReactNode } from 'react';
import { cloudinaryPosterFromMp4 } from '../../lib/cloudinary';

export type YouTubeCardMediaProps = {
  /** @deprecated Autoplay uses viewport visibility; kept for API compatibility */
  cardId?: string;
  title: string;
  mp4Src: string;
  poster?: string;
  aspectClass?: string;
  overlay?: ReactNode;
  className?: string;
};

/** Play when visible; pause when off-screen — muted for iOS/Safari autoplay rules. */
const IO_ROOT_MARGIN = '80px 0px';

export const YouTubeCardMedia = memo(function YouTubeCardMedia({
  title,
  mp4Src,
  poster,
  aspectClass = 'aspect-[16/10]',
  overlay,
  className = '',
}: YouTubeCardMediaProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const posterSrc = poster ?? cloudinaryPosterFromMp4(mp4Src);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduceMotion(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl || reduceMotion) return;

    const obs = new IntersectionObserver(
      (entries) => {
        setInView(Boolean(entries[0]?.isIntersecting));
      },
      { threshold: 0.25, rootMargin: IO_ROOT_MARGIN },
    );
    obs.observe(rootEl);
    return () => obs.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (!inView || reduceMotion) {
      el.pause();
      el.currentTime = 0;
      el.muted = true;
      setVideoPlaying(false);
      return;
    }

    el.muted = true;
    el.playsInline = true;
    el.setAttribute('playsinline', '');
    el.setAttribute('webkit-playsinline', '');

    const play = () => {
      void el
        .play()
        .then(() => setVideoPlaying(true))
        .catch(() => {
          el.muted = true;
          void el.play().then(() => setVideoPlaying(true)).catch(() => {});
        });
    };

    if (el.readyState >= 2) play();
    else {
      el.load();
      el.addEventListener('loadeddata', play, { once: true });
    }
  }, [inView, reduceMotion]);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const el = videoRef.current;
    if (!el) return;

    const resume = () => {
      if (inView && el.paused && document.visibilityState === 'visible') {
        el.muted = true;
        void el.play().catch(() => {});
      }
    };

    el.addEventListener('pause', resume);
    document.addEventListener('visibilitychange', resume);
    return () => {
      el.removeEventListener('pause', resume);
      document.removeEventListener('visibilitychange', resume);
    };
  }, [inView, reduceMotion]);

  return (
    <div
      ref={rootRef}
      className={`yt-card-media ${aspectClass} ${className}`.trim()}
      data-playing={videoPlaying ? 'true' : 'false'}
      data-autoplay={!reduceMotion ? 'true' : 'false'}
    >
      <div className="yt-card-media__stage">
        <img src={posterSrc} alt="" className="yt-card-poster" loading="lazy" decoding="async" />

        <div className="yt-card-player" aria-hidden={!inView && !videoPlaying}>
          <video
            ref={videoRef}
            src={mp4Src}
            poster={posterSrc}
            muted
            loop
            playsInline
            preload={inView ? 'auto' : 'none'}
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
        </div>
      </div>

      {overlay ? <div className="yt-card-overlay-slot">{overlay}</div> : null}
    </div>
  );
});
