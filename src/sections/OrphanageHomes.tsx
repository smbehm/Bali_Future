import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, Home, ArrowRight, Play, X } from 'lucide-react';

const stories = [
  {
    title: 'Where Hope Finds a Home',
    videoId: 'B6GnSJkj4SI',
    description: 'In a quiet corner of Bali, children who once knew only uncertainty now wake up to the sound of laughter. This is the story of a community that refused to look away -- and the lives that were transformed because of it.',
    tag: 'Community & Care',
  },
  {
    title: 'Growing Together, One Day at a Time',
    videoId: 'Bik2-QjACWM',
    description: 'Education is more than textbooks. It is the moment a child realizes they matter. Watch how volunteers and local mentors are helping young girls discover their voices, their dreams, and their power to change the world.',
    tag: 'Education & Growth',
  },
  {
    title: 'Building a Brighter Future in Bali',
    videoId: '4K4vTQEYBXg',
    description: 'Every hand that builds, every heart that gives, creates a ripple. Meet the people -- local and global -- who are proving that when we show up for children, we show up for the future of an entire island.',
    tag: 'Volunteers & Impact',
  },
];

function VideoModal({ videoId, onClose }: { videoId: string; onClose: () => void }) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title="Video Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
          style={{ border: 'none' }}
        />
      </motion.div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all duration-200"
      >
        <X className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

function StoryCard({ story, index, onPlay }: { story: typeof stories[0]; index: number; onPlay: (videoId: string) => void }) {
  const thumbnail = `https://img.youtube.com/vi/${story.videoId}/hqdefault.jpg`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.15 }}
      className="group relative rounded-3xl overflow-hidden bg-white shadow-lg shadow-primary-100/20 hover:shadow-2xl hover:shadow-primary-200/40 transition-all duration-500 hover:-translate-y-3"
    >
      {/* Thumbnail */}
      <div
        className="relative w-full aspect-[16/10] overflow-hidden cursor-pointer"
        onClick={() => onPlay(story.videoId)}
      >
        <img
          src={thumbnail}
          alt={story.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-18 h-18 w-[72px] h-[72px] rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl shadow-black/30 transition-all duration-400 group-hover:scale-110 group-hover:bg-white/25 group-hover:border-white/50">
              <Play className="w-8 h-8 text-white fill-white ml-1 drop-shadow-lg" />
            </div>
          </div>
        </div>

        {/* Tag */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-white/90 backdrop-blur-sm text-tropical shadow-sm border border-white/50">
            <Heart className="w-3 h-3 text-warm-500" />
            {story.tag}
          </span>
        </div>

        {/* Bottom title on thumbnail */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="font-sora font-bold text-xl md:text-2xl text-white leading-tight drop-shadow-lg">
            {story.title}
          </h3>
        </div>
      </div>

      {/* Content below thumbnail */}
      <div className="p-6 md:p-7">
        <p className="text-dark/65 text-[15px] leading-relaxed mb-6">
          {story.description}
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onPlay(story.videoId)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl gradient-green text-white text-sm font-semibold shadow-md shadow-primary-200/30 hover:shadow-lg hover:shadow-primary-300/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            Watch Their Story
          </button>
          <a
            href="#donate"
            className="flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-2xl border-2 border-primary-200 text-tropical text-sm font-semibold hover:bg-primary-50 hover:border-primary-300 transition-all"
          >
            <Heart className="w-4 h-4" />
            Give
          </a>
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br from-primary-200/20 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}

export default function OrphanageHomes() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section id="homes" className="section-padding relative overflow-hidden bg-gradient-to-b from-cream/55 via-primary-50/15 to-cream/55">
      <div className="absolute top-[5%] left-0 w-[500px] h-[500px] rounded-full bg-sky-50/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-0 w-[400px] h-[400px] rounded-full bg-primary-50/30 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warm-100 text-warm-700 text-sm font-semibold mb-4">
            <Home className="w-4 h-4" />
            The Homes We Serve
          </span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl text-tropical mb-6">
            Meet the Children Waiting for You
          </h2>
          <p className="text-dark/60 text-lg leading-relaxed max-w-2xl mx-auto">
            Behind every face is a story of resilience. These are not just videos --
            they are invitations to witness the extraordinary courage of children
            who still believe in tomorrow.
          </p>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl glass shadow-sm mt-8"
          >
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-primary-300" />
              <span className="text-sm text-dark/60"><strong className="text-tropical">6</strong> homes supported</span>
            </div>
            <div className="w-px h-4 bg-primary-100" />
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-warm-400" />
              <span className="text-sm text-dark/60"><strong className="text-tropical">128</strong> children in our care</span>
            </div>
            <div className="w-px h-4 bg-primary-100 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-300" />
              <span className="text-sm text-dark/60">100% of support goes to them</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Video Story Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {stories.map((story, i) => (
            <StoryCard key={story.videoId} story={story} index={i} onPlay={setActiveVideo} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-dark/50 text-sm mb-4 max-w-md mx-auto">
            Every child in these homes depends on the generosity of people like you.
            Your donation provides food, shelter, education, and hope.
          </p>
          <a
            href="#donate"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full gradient-green text-white font-semibold shadow-xl shadow-primary-300/30 hover:shadow-2xl hover:shadow-primary-300/40 hover:scale-105 transition-all"
          >
            <Heart className="w-5 h-5" />
            Support All Homes
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <VideoModal videoId={activeVideo} onClose={() => setActiveVideo(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
