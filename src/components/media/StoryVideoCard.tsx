import { memo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Expand, Maximize2 } from 'lucide-react';
import { YouTubeCardMedia } from '../youtube/YouTubeCardMedia';
import { cloudinaryPosterFromMp4 } from '../../lib/cloudinary';

export type StoryVideoCardProps = {
  title: string;
  mp4Src: string;
  poster?: string;
  story?: string;
  badge?: ReactNode;
  aspectClass?: string;
  className?: string;
  index?: number;
  onOpen: () => void;
};

export const StoryVideoCard = memo(function StoryVideoCard({
  title,
  mp4Src,
  poster,
  story,
  badge,
  aspectClass = 'aspect-[4/5] sm:aspect-[3/4]',
  className = '',
  index = 0,
  onOpen,
}: StoryVideoCardProps) {
  const posterSrc = poster ?? cloudinaryPosterFromMp4(mp4Src);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={`story-video-card group ${className}`.trim()}
    >
      <motion.div className="story-video-card__media">
        <YouTubeCardMedia
          mp4Src={mp4Src}
          poster={posterSrc}
          title={title}
          aspectClass={`story-video-card__aspect ${aspectClass}`}
          className="h-full w-full"
        />
        <button
          type="button"
          className="story-video-card__expand"
          aria-label={`Watch full screen: ${title}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          <Expand className="h-4 w-4" aria-hidden />
        </button>
      </motion.div>

      <button
        type="button"
        className="story-video-card__caption story-video-card__caption-btn"
        onClick={onOpen}
      >
        {badge ? <motion.div className="story-video-card__badge">{badge}</motion.div> : null}
        <h3 className="story-video-card__title">{title}</h3>
        {story ? <p className="story-video-card__story">{story}</p> : null}
        <span className="story-video-card__watch">
          <Maximize2 className="h-3.5 w-3.5" aria-hidden />
          Watch story
        </span>
      </button>
    </motion.article>
  );
});

export default StoryVideoCard;
