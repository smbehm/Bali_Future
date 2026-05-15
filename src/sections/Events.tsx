import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Mail,
  ArrowRight,
  CheckCircle2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { formatPostgrestError, supabase } from '../lib/supabase';
import { linesToEmailHtml, sendEmailNotification } from '../lib/sendEmailNotification';

type ActivityEvent = {
  id: string;
  title: string;
  tagline: string;
  youtubeId: string;
  icon: string;
};

const EVENTS: ActivityEvent[] = [
  {
    id: 'football',
    title: 'Football',
    tagline: 'Teamwork, discipline, and pure fun.',
    youtubeId: '3aEgg9pj_DY',
    icon: '\u26BD',
  },
  {
    id: 'computer-day',
    title: 'Computer Day',
    tagline: 'Teaching Photoshop, design, and digital skills.',
    youtubeId: 'JXNzNkOxklU',
    icon: '\uD83D\uDCBB',
  },
  {
    id: 'basketball',
    title: 'Basketball',
    tagline: 'Building confidence one shot at a time.',
    youtubeId: '6zrT6zDjltU',
    icon: '\uD83C\uDFC0',
  },
  {
    id: 'painting',
    title: 'Painting & Coloring',
    tagline: 'Where little hands create big dreams.',
    youtubeId: 'hSREFTWK0h4',
    icon: '\uD83C\uDFA8',
  },
  {
    id: 'singing',
    title: 'Singing & Music',
    tagline: 'Every voice deserves to be heard.',
    youtubeId: 'b6nn6t9X62E',
    icon: '\uD83C\uDFB5',
  },
  {
    id: 'dancing',
    title: 'Dancing',
    tagline: 'Joy in every move, culture in every step.',
    youtubeId: 'aTj8lMYF53g',
    icon: '\uD83D\uDC83',
  },
];

function buildEmbedUrl(videoId: string, muted: boolean): string {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: muted ? '1' : '0',
    loop: '1',
    playlist: videoId,
    controls: '0',
    playsinline: '1',
    modestbranding: '1',
    rel: '0',
    showinfo: '0',
    enablejsapi: '0',
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

type EventCardProps = {
  event: ActivityEvent;
  index: number;
  isActive: boolean;
  onVisible: (id: string) => void;
  onHidden: (id: string) => void;
};

const EventCard = memo(function EventCard({ event, index, isActive, onVisible, onHidden }: EventCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible(event.id);
        } else {
          onHidden(event.id);
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [event.id, onVisible, onHidden]);

  useEffect(() => {
    if (!isActive) {
      setMuted(true);
    }
  }, [isActive]);

  const thumbnail = `https://img.youtube.com/vi/${event.youtubeId}/hqdefault.jpg`;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white/90 shadow-[0_20px_50px_-20px_rgba(47,93,80,0.25)] ring-1 ring-primary-100/70 backdrop-blur-sm transition-shadow duration-500 ease-out hover:shadow-[0_28px_60px_-18px_rgba(47,93,80,0.35)]"
    >
      <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-0 ring-2 ring-primary-300/0 transition-opacity duration-500 group-hover:opacity-100 group-hover:ring-primary-300/35" aria-hidden />

      {/* Video area */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-neutral-950">
        {isActive ? (
          <iframe
            key={`${event.youtubeId}-${muted}`}
            title={event.title}
            src={buildEmbedUrl(event.youtubeId, muted)}
            className="pointer-events-none absolute inset-0 h-full w-full scale-[1.35]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            loading="lazy"
          />
        ) : (
          <img
            src={thumbnail}
            alt={event.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/5" aria-hidden />

        {/* Mute/Unmute button */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/15 backdrop-blur-md transition-transform duration-300 hover:scale-105 active:scale-95 touch-manipulation"
            aria-label={muted ? 'Unmute video' : 'Mute video'}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Title & tagline */}
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
              {event.tagline}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default function Events() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const visibleSet = useRef(new Set<string>());

  const events = useMemo(() => EVENTS, []);

  const onVisible = useCallback((id: string) => {
    visibleSet.current.add(id);
    setActiveId((cur) => cur ?? id);
  }, []);

  const onHidden = useCallback((id: string) => {
    visibleSet.current.delete(id);
    setActiveId((cur) => {
      if (cur !== id) return cur;
      const remaining = Array.from(visibleSet.current);
      return remaining.length > 0 ? remaining[0] : null;
    });
  }, []);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterError(null);

    const { error } = await supabase.from('newsletter_subscribers').insert({ email: newsletterEmail });

    if (error) {
      console.error('[newsletter]', error);
      setNewsletterError(
        error.code === '23505'
          ? 'You are already subscribed! Thank you for your support.'
          : formatPostgrestError(error),
      );
      return;
    }

    const em = newsletterEmail.trim();
    try {
      await sendEmailNotification({
        organization: {
          subject: `New newsletter subscriber \u2014 ${em}`,
          html: linesToEmailHtml([`Email: ${em}`]),
        },
        donor: {
          to: em,
          subject: 'Welcome to the Bali Future Community!',
          html: linesToEmailHtml([
            'Thank you for subscribing! You will receive stories from the field, event invitations, and updates on the children whose lives you are helping change. Together we can make a difference.',
          ]),
        },
      });
    } catch {
      /* logged inside sendEmailNotification */
    }

    setSubscribed(true);
  };

  useEffect(() => {
    if (!subscribed) return;
    const t = window.setTimeout(() => {
      setSubscribed(false);
      setNewsletterEmail('');
      setNewsletterError(null);
    }, 5000);
    return () => window.clearTimeout(t);
  }, [subscribed]);

  return (
    <section
      id="events"
      className="section-padding relative overflow-hidden bg-gradient-to-b from-primary-50/95 via-cream to-primary-100/45"
    >
      <div className="decorative-blur pointer-events-none absolute -left-24 top-1/4 h-[min(440px,90vw)] w-[min(440px,90vw)] rounded-full bg-primary-200/20 blur-[100px]" />
      <div className="decorative-blur pointer-events-none absolute -right-20 bottom-[12%] h-[min(380px,80vw)] w-[min(380px,80vw)] rounded-full bg-primary-300/12 blur-[90px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(90%,48rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary-200/50 to-transparent" />

      <div className="section-container relative">
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
            <EventCard
              key={event.id}
              event={event}
              index={i}
              isActive={activeId === event.id}
              onVisible={onVisible}
              onHidden={onHidden}
            />
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
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      setNewsletterError(null);
                    }}
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
              {newsletterError && !subscribed ? (
                <p className="mt-3 text-sm text-amber-100/95">{newsletterError}</p>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
