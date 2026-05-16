import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Play } from 'lucide-react';
import { cloudinaryPosterFromMp4 } from '../../lib/cloudinary';
import { claimVideoSlot, releaseVideoSlot } from '../../lib/videoMemoryPool';
import { useMobileVideoUX } from '../../hooks/useMobileVideoUX';

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

let instanceSeq = 0;
function createInstanceId() {
  instanceSeq += 1;
  return `yt-card-${instanceSeq}`;
}

/**
 * Desktop: loads and plays the video on hover only (max 2 videos buffered globally).
 * Mobile / tablet: poster + play button; video mounts only after tap.
 */
export const YouTubeCardMedia = memo(function YouTubeCardMedia({
  title,
  mp4Src,
  poster,
  aspectClass = 'aspect-[16/10]',
  overlay,
  className = '',
}: YouTubeCardMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const instanceId = useRef(createInstanceId());
  const isMobile = useMobileVideoUX();
  const [activated, setActivated] = useState(false);
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

  const hardDeactivate = useCallback(() => {
    const el = videoRef.current;
    if (el) {
      el.pause();
      el.removeAttribute('src');
      el.load();
    }
    setActivated(false);
    setVideoPlaying(false);
  }, []);

  const activate = useCallback(() => {
    claimVideoSlot(instanceId.current, () => {
      hardDeactivate();
    });
    setActivated(true);
  }, [hardDeactivate]);

  const deactivate = useCallback(() => {
    releaseVideoSlot(instanceId.current);
    hardDeactivate();
  }, [hardDeactivate]);

  useEffect(() => () => releaseVideoSlot(instanceId.current), []);

  useEffect(() => {
    if (!activated) return;
    const el = videoRef.current;
    if (!el) return;

    el.muted = true;
    el.playsInline = true;
    el.setAttribute('playsinline', '');
    el.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      void el
        .play()
        .then(() => setVideoPlaying(true))
        .catch(() => {
          el.muted = true;
          void el.play().then(() => setVideoPlaying(true)).catch(() => {});
        });
    };

    if (el.readyState >= 2) {
      tryPlay();
      return;
    }

    const onLoadedData = () => tryPlay();
    el.addEventListener('loadeddata', onLoadedData, { once: true });
    return () => el.removeEventListener('loadeddata', onLoadedData);
  }, [activated]);

  const onPointerEnter = () => {
    if (isMobile || reduceMotion) return;
    activate();
  };

  const onPointerLeave = () => {
    if (isMobile || reduceMotion) return;
    deactivate();
  };

  const showMobilePlayOverlay = isMobile && !activated;

  return (
    <div
      className={`yt-card-media ${aspectClass} ${className}`.trim()}
      data-playing={videoPlaying ? 'true' : 'false'}
      data-activated={activated ? 'true' : 'false'}
      data-mobile={isMobile ? 'true' : 'false'}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className="yt-card-media__stage">
        <img src={posterSrc} alt="" className="yt-card-poster" loading="lazy" decoding="async" />

        <div className="yt-card-player" aria-hidden={!activated && !videoPlaying}>
          {activated ? (
            <video
              ref={videoRef}
              src={mp4Src}
              poster={posterSrc}
              muted
              loop
              playsInline
              preload="none"
              loading="lazy"
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              className="yt-card-native-video"
              aria-label={title}
              onPlaying={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
              onTimeUpdate={(e) => {
                if (e.currentTarget.currentTime > 0.05) setVideoPlaying(true);
              }}
            />
          ) : null}
        </div>

        {showMobilePlayOverlay ? (
          <div className="yt-card-play-overlay">
            <button
              type="button"
              className="yt-card-play-btn"
              aria-label={`Play video: ${title}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                activate();
              }}
            >
              <Play className="yt-card-play-icon" fill="currentColor" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>

      {overlay ? <div className="yt-card-overlay-slot">{overlay}</div> : null}
    </div>
  );
});
