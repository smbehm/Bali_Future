import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Calendar, Globe, Heart, Send, Check } from 'lucide-react';
import { formatPostgrestError, supabase } from '../lib/supabase';
import { linesToEmailHtml, sendEmailNotification } from '../lib/sendEmailNotification';

const journeySteps = [
  { icon: <Globe className="w-5 h-5" />, title: 'Share Your Heart', desc: 'Tell us what moves you to serve' },
  { icon: <Calendar className="w-5 h-5" />, title: 'Find Your Place', desc: 'We match your skills to real needs' },
  { icon: <MapPin className="w-5 h-5" />, title: 'Join the Family', desc: 'Arrive in Bali ready to make a difference' },
  { icon: <Heart className="w-5 h-5" />, title: 'Transform Lives', desc: 'Including your own' },
];

export default function Volunteer() {
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', country: '', skills: '', availability: '', message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const { error } = await supabase.from('volunteers').insert(formData);

    if (error) {
      console.error('[volunteers]', error);
      setSubmitError(formatPostgrestError(error));
      return;
    }

    const displayName = formData.full_name.trim() || 'Applicant';
    const orgSubject = `New Volunteer Application — ${displayName}`;
    const orgHtml = linesToEmailHtml([
      `Name: ${displayName}`,
      `Email: ${formData.email.trim()}`,
      `Phone: ${formData.phone.trim() || '—'}`,
      `Country: ${formData.country.trim() || '—'}`,
      `Skills: ${formData.skills.trim() || '—'}`,
      `Availability: ${formData.availability.trim() || '—'}`,
      `Message: ${formData.message.trim() || '—'}`,
    ]);

    const volunteerEmailTrim = formData.email.trim();
    const donorConfirmation =
      volunteerEmailTrim.includes('@')
        ? {
            to: volunteerEmailTrim,
            subject: "We've received your volunteer application — Bali Future",
            html: linesToEmailHtml([
              'Thank you for offering your time and heart to the children we serve.',
              '',
              'Here is a copy of what you submitted:',
              `Name: ${displayName}`,
              `Email: ${volunteerEmailTrim}`,
              `Phone: ${formData.phone.trim() || '—'}`,
              `Country: ${formData.country.trim() || '—'}`,
              `Skills: ${formData.skills.trim() || '—'}`,
              `Availability: ${formData.availability.trim() || '—'}`,
              `Message: ${formData.message.trim() || '—'}`,
            ]),
          }
        : null;

    setSubmitted(true);

    void sendEmailNotification({
      organization: { subject: orgSubject, html: orgHtml },
      donor: donorConfirmation,
    }).catch(() => {});

    const waText = `New volunteer application from ${formData.full_name} email: ${formData.email} country: ${formData.country}`;
    window.setTimeout(() => {
      window.open(`https://wa.me/14157170016?text=${encodeURIComponent(waText)}`, '_blank');
    }, 2000);
  };

  useEffect(() => {
    if (!submitted) return;
    const t = window.setTimeout(() => {
      setSubmitted(false);
      setSubmitError(null);
      setFormData({ full_name: '', email: '', phone: '', country: '', skills: '', availability: '', message: '' });
    }, 5000);
    return () => window.clearTimeout(t);
  }, [submitted]);

  return (
    <section id="volunteer" className="section-padding relative overflow-hidden bg-gradient-to-b from-cream via-sky-50/30 to-cream">
      <div className="decorative-blur absolute bottom-0 right-0 h-[min(500px,100vh)] w-[min(500px,100vw)] rounded-full bg-sky-50/50 blur-[80px]" />

      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-sm font-semibold mb-4">
            <Users className="w-4 h-4" />
            Your Time Changes Everything
          </span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl text-tropical mb-6">
            Be the Reason a Child Smiles
          </h2>
          <p className="text-dark/60 text-lg">
            Our volunteers don't just visit -- they become family. Whether you teach a child to read,
            build a classroom, or simply show up with love, your presence leaves a lasting mark
            on young hearts that will never forget you.
          </p>
        </motion.div>

        {/* Journey timeline */}
        <div className="grid grid-cols-1 gap-6 mb-16 sm:grid-cols-2 md:grid-cols-4">
          {journeySteps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-2xl gradient-sky flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-sky-200/50">
                {step.icon}
              </div>
              <div className="font-sora font-bold text-tropical text-sm">{step.title}</div>
              <div className="text-xs text-dark/50 mt-1">{step.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Application form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full gradient-sky flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-sora font-bold text-2xl text-tropical mb-3">Welcome to the Family</h3>
              <p className="text-dark/60">Your application is in our hands. We will be in touch within 48 hours to start your journey together.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-sky-100/50 p-8 md:p-10">
              <h3 className="font-sora font-bold text-xl text-tropical mb-6">Volunteer Application</h3>
              {submitError ? (
                <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {submitError}
                </p>
              ) : null}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-dark/70 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-sky-100 focus:border-sky-300 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark/70 mb-1 block">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-sky-100 focus:border-sky-300 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark/70 mb-1 block">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-sky-100 focus:border-sky-300 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark/70 mb-1 block">Availability</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-sky-100 focus:border-sky-300 outline-none transition-colors bg-white"
                  >
                    <option value="">Select duration</option>
                    <option value="1-2 weeks">1-2 weeks</option>
                    <option value="1 month">1 month</option>
                    <option value="3 months">3 months</option>
                    <option value="6+ months">6+ months</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-dark/70 mb-1 block">Skills & Experience</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="Teaching, construction, medical, tech..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-sky-100 focus:border-sky-300 outline-none transition-colors"
                />
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-dark/70 mb-1 block">Why do you want to volunteer?</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-sky-100 focus:border-sky-300 outline-none transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl gradient-sky text-white font-semibold shadow-lg shadow-sky-200/50 hover:shadow-xl transition-all"
              >
                <Send className="w-4 h-4" />
                Submit Application
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
