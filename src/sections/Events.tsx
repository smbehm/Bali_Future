import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Sparkles,
  Mail,
  ArrowRight,
  CheckCircle2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useManagedVideo } from '../contexts/VideoFocusContext';

/** One showcase item — `video` is the ONLY source of the media URL (no JSX path literals). */
export type ShelterShowcaseEvent = {
  /** Stable unique id for keys and refs isolation */
  id: string;
  title: string;
  description: string;
  /** Absolute public path to mp4 */
  video: string;
  icon: string;
  poster?: string;
};

/**
 * STRICT asset map — each file is unique; paths are defined exactly once here.
 * Order: Football → Computer Day → Basketball → Painting → Singing → Dancing
 */
const EVENTS: ShelterShowcaseEvent[] = [
  {
    id: 'football',
    title: 'Football',
    description: 'Teamwork, discipline, and pure fun.',
    video: '/shelter/football.mp4',
    icon: '⚽',
  },
  {
    id: 'computer-day',
    title: 'Computer Day',
    description: 'Teaching Photoshop, design, and digital skills.',
    video: '/shelter/computer.mp4',
    icon: '💻',
  },
  {
    id: 'basketball',
    title: 'Basketball',
    description: 'Building confidence one shot at a time.',
    video: '/shelter/basketball.mp4',
    icon: '🏀',
  },
  {
    id: 'painting',
    title: 'Painting & Coloring',
    description: 'Where little hands create big dreams.',
    video: '/shelter/painting.mp4',
    icon: '🎨',
  },
  {
    id: 'singing',
    title: 'Singing & Music',
    description: 'Every voice deserves to be heard.',
    video: '/shelter/singing.mp4',
    icon: '🎵',
  },
  {
    id: 'dancing',
    title: 'Dancing',
    description: 'Joy in every move, culture in every step.',
    video: '/shelter/dancing.mp4',
    icon: '💃',
  },
];

type EventCardProps = {
  event: ShelterShowcaseEvent;
  index: number;
};

const EventCard = memo(function EventCard({ event, index }: EventCardProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const { videoRef, muted, toggleMute, abandonAudioIfOwner } = useManagedVideo(`events-${event.id}`);
  const inView = useInView(rootRef, { amount: 0.2, margin: '0px 0px -10% 0px' });

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView) {
      void v.play().catch(() => {});
    } else {
      abandonAudioIfOwner();
      v.pause();
    }
    // `videoRef` is a stable ref object; we only want to react to scroll visibility and card identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally omit videoRef
  }, [inView, event.id, abandonAudioIfOwner]);

  return (
    <motion.article
      ref={rootRef}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white/90 shadow-[0_20px_50px_-20px_rgba(47,93,80,0.25)] ring-1 ring-primary-100/70 backdrop-blur-sm transition-shadow duration-500 ease-out hover:shadow-[0_28px_60px_-18px_rgba(47,93,80,0.35)]"
    >
      {/* Ambient rim glow on hover — GPU-friendly opacity */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-0 ring-2 ring-primary-300/0 transition-opacity duration-500 group-hover:opacity-100 group-hover:ring-primary-300/35"
        aria-hidden
      />

      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-neutral-950">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover will-change-transform transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          src={event.video}
          poster={event.poster}
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="metadata"
          controls={false}
        />

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/5"
          aria-hidden
        />

        {/* Floating controls — glass, minimal; fade in on hover (always visible on touch) */}
        <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-3 sm:p-4">
          <div className="pointer-events-auto flex translate-y-1 opacity-90 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/15 backdrop-blur-md transition-transform duration-300 hover:scale-105 active:scale-95 touch-manipulation"
              aria-label={muted ? 'Unmute video' : 'Mute video'}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col justify-center border-t border-white/60 bg-gradient-to-b from-white via-primary-50/30 to-primary-50/50 px-6 py-5 md:px-7 md:py-6">
        <div className="flex items-start gap-4">
          <span className="select-none text-2xl leading-none md:text-3xl" aria-hidden>
            {event.icon}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-sora text-lg font-bold tracking-tight text-tropical md:text-xl">
              {event.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-dark/60 md:text-[15px]">
              {event.description}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
});

export default function Events() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const events = useMemo(() => EVENTS, []);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    await supabase.from('newsletter_subscribers').insert({ email: newsletterEmail });
    setSubscribed(true);
  };

  return (
    <section
      id="events"
      className="section-padding relative overflow-hidden bg-gradient-to-b from-primary-50/95 via-cream to-primary-100/45"
    >
      <div className="pointer-events-none absolute -left-24 top-1/4 h-[440px] w-[440px] rounded-full bg-primary-200/20 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 bottom-[12%] h-[380px] w-[380px] rounded-full bg-primary-300/12 blur-[90px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(90%,48rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary-200/50 to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-primary-700 shadow-sm ring-1 ring-primary-100/80">
            <Sparkles className="h-4 w-4 text-primary-500" />
            At the Shelter
          </span>
          <h2 className="font-sora text-3xl font-bold text-tropical md:text-5xl">Show Up. Give Back. Belong.</h2>
          <p className="mt-4 text-lg leading-relaxed text-dark/60">
            Every event is a chance to stand beside the children and families we serve. Whether you clean a beach,
            teach a workshop, or simply share a meal -- your presence is the gift.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-20 max-w-2xl"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-tropical to-primary-700 p-8 text-center text-white md:p-12">
            <div className="absolute right-0 top-0 h-[200px] w-[200px] -translate-y-1/2 translate-x-1/2 rounded-full bg-white/5 blur-[40px]" />
            <div className="relative">
              <Mail className="mx-auto mb-4 h-10 w-10 opacity-80" />
              <h3 className="font-sora text-2xl font-bold">Never Miss a Chance to Help</h3>
              <p className="mb-6 mt-3 text-white/75">
                Join our community of compassionate people who receive stories from the field, event invitations, and
                updates on the children whose lives you are helping change.
              </p>
              {subscribed ? (
                <div className="flex items-center justify-center gap-2 font-semibold text-primary-100">
                  <CheckCircle2 className="h-5 w-5" />
                  Thank you for subscribing!
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-white outline-none placeholder:text-white/40 focus:border-white/50"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-tropical transition-colors hover:bg-primary-50"
                  >
                    Subscribe
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
