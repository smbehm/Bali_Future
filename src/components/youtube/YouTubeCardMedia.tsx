import { memo, useEffect, useRef, useState, type ReactNode } from 'react';
import { useHoverVideo } from '../../contexts/HoverVideoContext';
import { cloudinaryPosterFromMp4 } from '../../lib/cloudinary';

export type YouTubeCardMediaProps = {
  /** Unique id for one-at-a-time hover playback across Events + Gallery */
  cardId: string;
  title: string;
  mp4Src: string;
  poster?: string;
  aspectClass?: string;
  overlay?: ReactNode;
  className?: string;
};

export const YouTubeCardMedia = memo(function YouTubeCardMedia({
  cardId,
  title,
  mp4Src,
  poster,
  aspectClass = 'aspect-[16/10]',
  overlay,
  className = '',
}: YouTubeCardMediaProps) {
  const { activeCardId } = useHoverVideo();
  const isPlaying = activeCardId === cardId;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const posterSrc = poster ?? cloudinaryPosterFromMp4(mp4Src);
  const showVideo = isPlaying;

  useEffect(() => {
    if (!isPlaying) setVideoPlaying(false);
  }, [isPlaying]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (isPlaying) {
      // iOS Safari: play muted + playsInline first, then unmute after user gesture (tap/hover)
      el.muted = true;
      void el
        .play()
        .then(() => {
          el.muted = false;
        })
        .catch(() => {
          el.muted = true;
          void el.play().catch(() => {});
        });
    } else {
      el.muted = true;
      el.pause();
      el.currentTime = 0;
    }
  }, [isPlaying]);

  return (
    <div
      className={`yt-card-media ${aspectClass} ${className}`.trim()}
      data-active={isPlaying ? 'true' : 'false'}
      data-playing={videoPlaying ? 'true' : 'false'}
    >
      <div className="yt-card-media__stage">
        <img src={posterSrc} alt="" className="yt-card-poster" loading="lazy" decoding="async" />

        {showVideo ? (
          <div className="yt-card-player">
            <video
              ref={videoRef}
              src={mp4Src}
              poster={posterSrc}
              muted
              loop
              playsInline
              preload="metadata"
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              className="yt-card-native-video"
              aria-label={title}
              onPlaying={() => setVideoPlaying(true)}
            />
          </div>
        ) : null}
      </div>

      <div className="yt-card-cinematic" aria-hidden />
      <div className="yt-card-vignette" aria-hidden />
      <div className="yt-card-tint" aria-hidden />

      {overlay ? <div className="yt-card-overlay-slot">{overlay}</div> : null}
    </div>
  );
});
