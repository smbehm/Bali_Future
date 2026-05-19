import { memo, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Mail,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { formatPostgrestError, isSupabaseConfigured, supabase, SUPABASE_CONFIG_ERROR } from '../lib/supabase';
import { devLog } from '../lib/devLog';
import { formatEmailWarning, linesToEmailHtml, sendEmailNotification } from '../lib/sendEmailNotification';
import { YouTubeCardMedia } from '../components/youtube/YouTubeCardMedia';
import { useCardVideoActivation } from '../hooks/useCardVideoActivation';
import { CLOUDINARY_EVENTS, cloudinaryPosterFromMp4 } from '../lib/cloudinary';

export type ShelterShowcaseEvent = {
  id: string;
  title: string;
  description: string;
  mp4Src: string;
  poster?: string;
  icon: string;
};

const EVENTS: ShelterShowcaseEvent[] = [
  {
    id: 'football',
    title: 'Football',
    description: 'Teamwork, discipline, and pure fun.',
    mp4Src: CLOUDINARY_EVENTS.football,
    icon: '\u26BD',
  },
  {
    id: 'computer-day',
    title: 'Computer Day',
    description: 'Teaching Photoshop, design, and digital skills.',
    mp4Src: CLOUDINARY_EVENTS.computerDay,
    icon: '\uD83D\uDCBB',
  },
  {
    id: 'basketball',
    title: 'Basketball',
    description: 'Building confidence one shot at a time.',
    mp4Src: CLOUDINARY_EVENTS.basketball,
    icon: '\uD83C\uDFC0',
  },
  {
    id: 'painting',
    title: 'Painting & Coloring',
    description: 'Where little hands create big dreams.',
    mp4Src: CLOUDINARY_EVENTS.painting,
    icon: '\uD83C\uDFA8',
  },
  {
    id: 'singing',
    title: 'Singing & Music',
    description: 'Every voice deserves to be heard.',
    mp4Src: CLOUDINARY_EVENTS.singing,
    icon: '\uD83C\uDFB5',
  },
  {
    id: 'dancing',
    title: 'Dancing',
    description: 'Joy in every move, culture in every step.',
    mp4Src: CLOUDINARY_EVENTS.dancing,
    icon: '\uD83D\uDC83',
  },
];

type EventCardProps = {
  event: ShelterShowcaseEvent;
  index: number;
};

const EventCard = memo(function EventCard({ event, index }: EventCardProps) {
  const cardId = `events-${event.id}`;
  const { isActive, handlers, tabIndex, ref } = useCardVideoActivation(cardId);
  const poster = event.poster ?? cloudinaryPosterFromMp4(event.mp4Src);

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group yt-premium-card"
      data-active={isActive ? 'true' : 'false'}
      tabIndex={tabIndex}
      role={tabIndex === 0 ? 'button' : undefined}
      aria-pressed={tabIndex === 0 ? isActive : undefined}
      {...handlers}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-0 ring-2 ring-primary-300/0 transition-opacity duration-500 group-hover:opacity-100 group-hover:ring-primary-300/35 group-data-[active=true]:opacity-100 group-data-[active=true]:ring-primary-300/35"
        aria-hidden
      />

      <YouTubeCardMedia
        cardId={cardId}
        mp4Src={event.mp4Src}
        title={event.title}
        poster={poster}
        aspectClass="aspect-[16/10] sm:aspect-[16/10]"
      />

      <div className="relative flex flex-1 flex-col justify-center border-t border-white/60 bg-gradient-to-b from-white via-primary-50/30 to-primary-50/50 px-5 py-5 sm:px-6 md:px-7 md:py-6">
        <div className="flex items-start gap-3 sm:gap-4">
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
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const events = useMemo(() => EVENTS, []);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || isSubmitting) return;
    setNewsletterError(null);

    if (!isSupabaseConfigured()) {
      console.error('[newsletter] Supabase not configured at runtime');
      setNewsletterError(SUPABASE_CONFIG_ERROR);
      return;
    }

    setIsSubmitting(true);
    const em = newsletterEmail.trim();
    devLog('[newsletter] insert', { email: em });

    const { error } = await supabase.from('newsletter_subscribers').insert({ email: em });

    if (error) {
      console.error('[newsletter] Supabase insert failed', error);
      setNewsletterError(
        error.code === '23505'
          ? 'You are already subscribed! Thank you for your support.'
          : formatPostgrestError(error),
      );
      setIsSubmitting(false);
      return;
    }

    const emailResult = await sendEmailNotification({
      organization: {
        subject: `New newsletter subscriber — ${em}`,
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
    if (!emailResult.ok) {
      console.error('[newsletter] email notification failed', emailResult);
      setNewsletterError(formatEmailWarning(emailResult));
    }

    setSubscribed(true);
    setIsSubmitting(false);
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
      className="section-padding relative overflow-hidden"
    >
      <div className="decorative-blur pointer-events-none absolute -left-24 top-1/4 h-[min(440px,90vw)] w-[min(440px,90vw)] rounded-full bg-primary-200/20 blur-[100px]" />
      <div className="decorative-blur pointer-events-none absolute -right-20 bottom-[12%] h-[min(380px,80vw)] w-[min(380px,80vw)] rounded-full bg-primary-300/12 blur-[90px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(90%,48rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary-200/50 to-transparent" />

      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-10 max-w-3xl px-1 text-center md:mb-14"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-primary-700 shadow-sm ring-1 ring-primary-100/80">
            <Sparkles className="h-4 w-4 text-primary-500" />
            At the Shelter
          </span>
          <h2 className="font-sora text-3xl font-bold text-tropical md:text-5xl">Show Up. Give Back. Belong.</h2>
          <p className="mt-4 text-base leading-relaxed text-pretty text-dark/60 sm:text-lg">
            Every event is a chance to stand beside the children and families we serve. Whether you clean a beach,
            teach a workshop, or simply share a meal -- your presence is the gift.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
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
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-tropical to-primary-700 p-6 text-center text-white sm:p-8 md:p-12">
            <div className="absolute right-0 top-0 h-[200px] w-[200px] -translate-y-1/2 translate-x-1/2 rounded-full bg-white/5 blur-[40px]" />
            <div className="relative">
              <Mail className="mx-auto mb-4 h-10 w-10 opacity-80" />
              <h3 className="font-sora text-2xl font-bold">Never Miss a Chance to Help</h3>
              <p className="mb-6 mt-3 text-white/75">
                Join our community of compassionate people who receive stories from the field, event invitations, and
                updates on the children whose lives you are helping change.
              </p>
              {subscribed ? (
                <div>
                  <div className="flex items-center justify-center gap-2 font-semibold text-primary-100">
                    <CheckCircle2 className="h-5 w-5" />
                    Thank you for subscribing!
                  </div>
                  {newsletterError ? (
                    <p className="mt-3 text-sm text-amber-100/95">{newsletterError}</p>
                  ) : null}
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
                    className="form-field min-h-12 flex-1 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-white outline-none placeholder:text-white/40 focus:border-white/50"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-tropical transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
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
};
