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
  const poster = event.poster ?? cloudinaryPosterFromMp4(event.mp4Src);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="yt-premium-card group"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-0 ring-2 ring-primary-300/0 transition-opacity duration-500 group-hover:opacity-100 group-hover:ring-primary-300/35"
        aria-hidden
      />

      <YouTubeCardMedia
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
    }, 12000);
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
                <div>
                  <div className="flex flex-col items-center justify-center gap-2 font-semibold text-primary-100 px-2 text-center">
                    <CheckCircle2 className="h-6 w-6 shrink-0" aria-hidden />
                    <span className="text-lg sm:text-xl leading-snug">You are subscribed!</span>
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
                    className="form-field flex-1 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-white outline-none placeholder:text-white/40 focus:border-white/50"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-tropical transition-colors hover:bg-primary-50 disabled:opacity-60 disabled:cursor-not-allowed"
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
