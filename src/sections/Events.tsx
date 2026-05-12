import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Users, Clock, Mail, ArrowRight, Ticket,
  Tag, CircleDot, UserPlus, Flame, CheckCircle2, XCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  address: string;
  capacity: number;
  registered: number;
  image_url: string;
  category: string;
  status: string;
  price: number;
  organizer: string;
  tags: string;
}

function getStatusConfig(status: string, registered: number, capacity: number, eventDate: string) {
  const now = Date.now();
  const eventTime = new Date(eventDate).getTime();
  const hoursUntil = (eventTime - now) / (1000 * 60 * 60);
  const spotsLeft = capacity - registered;
  const fillPercent = (registered / capacity) * 100;

  if (eventTime < now) {
    return { label: 'Completed', color: 'bg-dark/10 text-dark/50', icon: <CheckCircle2 className="w-3 h-3" />, pulse: false };
  }
  if (status === 'closed' || spotsLeft <= 0) {
    return { label: 'Sold Out', color: 'bg-red-50 text-red-600', icon: <XCircle className="w-3 h-3" />, pulse: false };
  }
  if (hoursUntil <= 48 && hoursUntil > 0) {
    return { label: 'Starting Soon', color: 'bg-warm-100 text-warm-700', icon: <Flame className="w-3 h-3" />, pulse: true };
  }
  if (fillPercent >= 80 || status === 'almost_full') {
    return { label: 'Almost Full', color: 'bg-orange-50 text-orange-600', icon: <Flame className="w-3 h-3" />, pulse: true };
  }
  return { label: 'Open', color: 'bg-primary-50 text-primary-600', icon: <CircleDot className="w-3 h-3" />, pulse: false };
}

function getCtaLabel(status: string, category: string) {
  if (status === 'closed') return 'Waitlist';
  if (category === 'community') return 'Volunteer Now';
  if (category === 'fundraiser') return 'Reserve Spot';
  return 'Join Event';
}

function formatEventDate(dateStr: string) {
  const date = new Date(dateStr);
  return {
    day: date.toLocaleDateString('en-US', { day: 'numeric' }),
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    full: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
  };
}

function getCountdown(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 30) return `${Math.floor(days / 7)} weeks`;
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

function ProgressBar({ registered, capacity }: { registered: number; capacity: number }) {
  const percent = Math.min((registered / capacity) * 100, 100);
  const color = percent >= 90 ? 'bg-red-400' : percent >= 70 ? 'bg-warm-400' : 'bg-primary-300';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-dark/50 font-medium">
          {capacity - registered} spots remaining
        </span>
        <span className="text-xs text-dark/40">
          {registered}/{capacity}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function EventCard({ event, index }: { event: Event; index: number }) {
  const [hovered, setHovered] = useState(false);
  const dateInfo = formatEventDate(event.event_date);
  const statusConfig = getStatusConfig(event.status, event.registered, event.capacity, event.event_date);
  const countdown = getCountdown(event.event_date);
  const ctaLabel = getCtaLabel(event.status, event.category);
  const tags = event.tags ? event.tags.split(',').slice(0, 3) : [];
  const isActive = statusConfig.label !== 'Completed' && statusConfig.label !== 'Sold Out';

  const categoryColors: Record<string, string> = {
    community: 'bg-primary-50 text-primary-600',
    workshop: 'bg-sky-50 text-sky-600',
    education: 'bg-warm-100 text-warm-700',
    fundraiser: 'bg-tropical/5 text-tropical',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group bg-white rounded-3xl overflow-hidden shadow-md shadow-primary-100/20 hover:shadow-xl hover:shadow-primary-200/30 transition-all duration-500 hover:-translate-y-1"
    >
      {/* Image section with overlay info */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={event.image_url}
          alt={event.title}
          className={`w-full h-full object-cover transition-transform duration-700 ${hovered ? 'scale-110' : 'scale-100'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Date badge */}
        <div className="absolute top-4 left-4 bg-white rounded-2xl px-3 py-2 text-center shadow-lg min-w-[56px]">
          <div className="text-xs font-bold text-primary-400 uppercase leading-none">{dateInfo.month}</div>
          <div className="text-xl font-bold text-tropical leading-tight">{dateInfo.day}</div>
          <div className="text-[10px] text-dark/40 uppercase">{dateInfo.weekday}</div>
        </div>

        {/* Status badge */}
        <div className="absolute top-4 right-4">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.color} shadow-sm`}>
            {statusConfig.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </div>

        {/* Countdown */}
        {countdown && (
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-tropical shadow-sm">
            <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
            {countdown}
          </div>
        )}

        {/* Category */}
        <div className="absolute bottom-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[event.category] || categoryColors.community} bg-white/90 backdrop-blur-sm shadow-sm`}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-sora font-bold text-lg text-tropical mb-2 group-hover:text-primary-500 transition-colors">
          {event.title}
        </h3>
        <p className="text-dark/55 text-sm leading-relaxed mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Details grid */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-start gap-2.5 text-sm text-dark/60">
            <Clock className="w-4 h-4 text-primary-300 mt-0.5 flex-shrink-0" />
            <span>{event.start_time} - {event.end_time}</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-dark/60">
            <MapPin className="w-4 h-4 text-primary-300 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{event.address || event.location}</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-dark/60">
            <Users className="w-4 h-4 text-primary-300 mt-0.5 flex-shrink-0" />
            <span>{event.organizer}</span>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 text-[11px] text-dark/45 font-medium">
                <Tag className="w-2.5 h-2.5" />
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <ProgressBar registered={event.registered} capacity={event.capacity} />

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-dark/30" />
            <span className="text-sm font-semibold text-tropical">
              {event.price > 0 ? `$${event.price}` : 'Free'}
            </span>
          </div>

          {isActive ? (
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-green text-white text-sm font-semibold shadow-md shadow-primary-200/30 hover:shadow-lg hover:shadow-primary-300/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <UserPlus className="w-3.5 h-3.5" />
              {ctaLabel}
            </button>
          ) : (
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-dark/40 text-sm font-semibold cursor-not-allowed">
              {statusConfig.label === 'Sold Out' ? 'Join Waitlist' : 'Event Ended'}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      if (data) setEvents(data);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    await supabase.from('newsletter_subscribers').insert({ email: newsletterEmail });
    setSubscribed(true);
  };

  const categories = ['all', ...new Set(events.map(e => e.category))];
  const filtered = filter === 'all' ? events : events.filter(e => e.category === filter);
  const upcomingCount = events.filter(e => new Date(e.event_date).getTime() > Date.now()).length;
  const totalSpots = events.reduce((sum, e) => sum + (e.capacity - e.registered), 0);

  return (
    <section id="events" className="section-padding relative overflow-hidden">
      <div className="absolute top-[10%] right-0 w-[400px] h-[400px] rounded-full bg-warm-100/20 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-0 w-[300px] h-[300px] rounded-full bg-primary-50/30 blur-[60px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warm-100 text-warm-700 text-sm font-semibold mb-4">
            <Calendar className="w-4 h-4" />
            Come Together
          </span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl text-tropical mb-4">
            Show Up. Give Back. Belong.
          </h2>
          <p className="text-dark/60 text-lg mb-6">
            Every event is a chance to stand beside the children and families we serve.
            Whether you clean a beach, teach a workshop, or simply share a meal -- your
            presence is the gift.
          </p>

          {/* Live stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl glass shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-300 animate-pulse" />
              <span className="text-sm text-dark/60"><strong className="text-tropical">{upcomingCount}</strong> upcoming</span>
            </div>
            <div className="w-px h-4 bg-primary-100" />
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-primary-300" />
              <span className="text-sm text-dark/60"><strong className="text-tropical">{totalSpots}</strong> spots available</span>
            </div>
            <div className="w-px h-4 bg-primary-100 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary-300" />
              <span className="text-sm text-dark/60">Across Bali</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === cat
                  ? 'gradient-green text-white shadow-md shadow-primary-200/30'
                  : 'bg-white text-dark/60 hover:bg-primary-50 hover:text-tropical border border-gray-100'
              }`}
            >
              {cat === 'all' ? 'All Events' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Events grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-52 bg-gray-100" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-50 rounded w-full" />
                  <div className="h-4 bg-gray-50 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-primary-200 mx-auto mb-4" />
            <p className="text-dark/50 font-medium">No events in this category right now.</p>
          </div>
        )}

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mt-20"
        >
          <div className="bg-gradient-to-br from-tropical to-primary-700 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-white/5 blur-[40px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <Mail className="w-10 h-10 mx-auto mb-4 opacity-80" />
              <h3 className="font-sora font-bold text-2xl mb-3">Never Miss a Chance to Help</h3>
              <p className="text-white/70 mb-6">
                Join our community of compassionate people who receive stories from the field,
                event invitations, and updates on the children whose lives you are helping change.
              </p>
              {subscribed ? (
                <div className="flex items-center justify-center gap-2 text-primary-200 font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  Thank you for subscribing!
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-white/50 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-white text-tropical font-semibold hover:bg-primary-50 transition-colors flex items-center gap-2"
                  >
                    Subscribe
                    <ArrowRight className="w-4 h-4" />
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